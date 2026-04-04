import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import "dotenv/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { PDFParse } from "pdf-parse";
import type { Connect, Plugin } from "vite";
import { defineConfig } from "vite";
import { analyzeHealthReport } from "./src/lib/ai";
import { validateContactSubmissionBody } from "./src/lib/contactSubmission";
import { assertPrismaDelegates, prisma } from "./src/lib/prisma";

const UPLOAD_PDF_API_PATH = "/api/uploads/pdf";
const UPLOAD_REPORT_API_PATH = "/api/upload-report";
const ANALYZE_REPORT_API_PATH = "/api/analyze-report";
const REPORTS_API_PATH = "/api/reports";
const REPORT_BY_ID_API_PREFIX = "/api/report/";
const CONTACT_API_PATH = "/api/contact";

const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;
const MAX_ANALYZE_TEXT_CHARS = 120000;

type UploadPdfBody = {
  fileName?: unknown;
  mimeType?: unknown;
  dataBase64?: unknown;
};

type UploadReportBody = {
  title?: unknown;
  fileName?: unknown;
  fileType?: unknown;
  rawText?: unknown;
};

type AnalyzeReportBody = {
  reportId?: unknown;
};

function reportApiPlugin(projectRoot: string): Plugin {
  const middleware = createReportMiddleware(projectRoot);

  return {
    name: "careconnect-report-api",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

function createReportMiddleware(projectRoot: string): Connect.NextHandleFunction {
  const uploadsDirectory = path.join(projectRoot, "public", "uploads");

  return async (req, res, next) => {
    const requestUrl = req.url || "";

    try {
      if (isUploadPdfApiPath(requestUrl)) {
        await handleUploadPdfRequest(req, res, uploadsDirectory);
        return;
      }

      if (isUploadReportApiPath(requestUrl)) {
        await handleUploadReportRequest(req, res);
        return;
      }

      if (isAnalyzeReportApiPath(requestUrl)) {
        await handleAnalyzeReportRequest(req, res);
        return;
      }

      if (isReportByIdApiPath(requestUrl)) {
        await handleReportByIdRequest(req, res);
        return;
      }

      if (isReportsApiPath(requestUrl)) {
        await handleReportsRequest(req, res);
        return;
      }

      if (isContactApiPath(requestUrl)) {
        await handleContactRequest(req, res);
        return;
      }
    } catch (error) {
      console.error(`[api] Unhandled API error on ${requestUrl}:`, error);
      const message = error instanceof Error ? error.message : "Unexpected API error.";
      sendJson(res, 500, { error: message });
      return;
    }

    next();
  };
}

async function handleUploadPdfRequest(
  req: IncomingMessage,
  res: ServerResponse,
  uploadsDirectory: string,
): Promise<void> {
  try {
    if (req.method === "DELETE") {
      const requestedPath = getDeleteFilePathParam(req);
      const absoluteFilePath = resolveSafeUploadFilePath(uploadsDirectory, requestedPath);

      await unlink(absoluteFilePath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") {
          throw error;
        }
      });

      sendJson(res, 200, { deleted: true });
      return;
    }

    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed." });
      return;
    }

    const body = (await parseJsonBody(req, MAX_UPLOAD_BYTES)) as UploadPdfBody;
    const upload = validateUploadPdfBody(body);

    const pdfBuffer = decodePdfBuffer(upload.dataBase64);
    const fileName = buildSafePdfFileName(upload.fileName);
    const absoluteFilePath = path.join(uploadsDirectory, fileName);
    const relativePath = `/uploads/${fileName}`;

    await mkdir(uploadsDirectory, { recursive: true });
    await writeFile(absoluteFilePath, pdfBuffer);

    const savedPdfBuffer = await readFile(absoluteFilePath);
    const reportText = await extractPdfText(savedPdfBuffer);

    sendJson(res, 201, {
      filePath: relativePath,
      originalFileName: upload.fileName,
      reportText,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload PDF.";
    const statusCode = message.toLowerCase().includes("too large") ? 413 : 400;
    sendJson(res, statusCode, { error: message });
  }
}

async function handleUploadReportRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    assertPrismaDelegates(["report"]);

    const body = (await parseJsonBody(req, MAX_UPLOAD_BYTES)) as UploadReportBody;
    const payload = validateUploadReportBody(body);

    const report = await prisma.report.create({
      data: {
        title: payload.title,
        fileName: payload.fileName,
        fileType: payload.fileType,
        rawText: payload.rawText,
        status: "uploaded",
      },
    });

    sendJson(res, 201, serializeReport(report));
  } catch (error) {
    console.error("[api/upload-report] Failed to create report:", error);
    const message = error instanceof Error ? error.message : "Could not save report.";
    sendJson(res, 400, { error: message });
  }
}

async function handleAnalyzeReportRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    assertPrismaDelegates(["report", "insight", "faq", "recommendation"]);

    const body = (await parseJsonBody(req, MAX_UPLOAD_BYTES)) as AnalyzeReportBody;
    const reportId = validateAnalyzeReportBody(body);

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      sendJson(res, 404, { error: "Report not found." });
      return;
    }

    if (!report.rawText.trim()) {
      sendJson(res, 400, { error: "Report text is empty and cannot be analyzed." });
      return;
    }

    const analysis = analyzeHealthReport(report.rawText.slice(0, MAX_ANALYZE_TEXT_CHARS));

    await prisma.$transaction(async (tx) => {
      await tx.insight.deleteMany({ where: { reportId } });
      await tx.faq.deleteMany({ where: { reportId } });
      await tx.recommendation.deleteMany({ where: { reportId } });

      await tx.report.update({
        where: { id: reportId },
        data: {
          aiSummary: analysis.summary,
          status: "analyzed",
        },
      });

      if (analysis.insights.length > 0) {
        await tx.insight.createMany({
          data: analysis.insights.map((insight) => ({
            reportId,
            type: insight.type,
            label: insight.label,
            value: insight.value,
            status: insight.status,
          })),
        });
      }

      if (analysis.faqs.length > 0) {
        await tx.faq.createMany({
          data: analysis.faqs.map((faq) => ({
            reportId,
            question: faq.question,
            answer: faq.answer,
          })),
        });
      }

      if (analysis.recommendations.length > 0) {
        await tx.recommendation.createMany({
          data: analysis.recommendations.map((item) => ({
            reportId,
            category: item.category,
            text: item.text,
          })),
        });
      }
    });

    const details = await getReportDetails(reportId);
    if (!details) {
      sendJson(res, 404, { error: "Report not found after analysis." });
      return;
    }

    sendJson(res, 200, details);
  } catch (error) {
    console.error("[api/analyze-report] Failed to analyze report:", error);
    const message = error instanceof Error ? error.message : "Could not analyze report.";
    sendJson(res, 400, { error: message });
  }
}

async function handleReportByIdRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  assertPrismaDelegates(["report", "insight", "faq", "recommendation"]);

  const reportId = extractReportIdFromUrl(req.url || "");
  if (!reportId) {
    sendJson(res, 400, { error: "Missing report id." });
    return;
  }

  const details = await getReportDetails(reportId);
  if (!details) {
    sendJson(res, 404, { error: "Report not found." });
    return;
  }

  sendJson(res, 200, details);
}

async function handleReportsRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  assertPrismaDelegates(["report", "insight", "faq", "recommendation"]);

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          insights: true,
          faqs: true,
          recommendations: true,
        },
      },
    },
  });

  sendJson(
    res,
    200,
    reports.map((report) => ({
      ...serializeReport(report),
      counts: report._count,
    })),
  );
}

async function handleContactRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  assertPrismaDelegates(["contactSubmission"]);

  if (req.method === "GET") {
    try {
      const submissions = await prisma.contactSubmission.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          message: true,
          createdAt: true,
        },
      });

      sendJson(
        res,
        200,
        submissions.map((submission) => ({
          ...submission,
          createdAt: submission.createdAt.toISOString(),
        })),
      );
      return;
    } catch (error) {
      console.error("[api/contact] Failed to load contact submissions:", error);
      const message = error instanceof Error ? error.message : "Could not load contact submissions.";
      sendJson(res, 400, { error: message });
      return;
    }
  }

  if (req.method === "POST") {
    try {
      const body = await parseJsonBody(req, MAX_UPLOAD_BYTES);
      const payload = validateContactSubmissionBody(body);

      const submission = await prisma.contactSubmission.create({
        data: {
          name: payload.name,
          email: payload.email,
          phone: payload.phone || null,
          message: payload.message,
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

      sendJson(res, 201, {
        id: submission.id,
        createdAt: submission.createdAt.toISOString(),
      });
      return;
    } catch (error) {
      console.error("[api/contact] Failed to save contact submission:", error);
      const message = error instanceof Error ? error.message : "Could not save contact submission.";
      sendJson(res, 400, { error: message });
      return;
    }
  }

  sendJson(res, 405, { error: "Method not allowed." });
}

async function getReportDetails(reportId: string): Promise<Record<string, unknown> | null> {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      insights: { orderBy: { label: "asc" } },
      faqs: { orderBy: { question: "asc" } },
      recommendations: { orderBy: { category: "asc" } },
    },
  });

  if (!report) {
    return null;
  }

  return {
    report: serializeReport(report),
    insights: report.insights,
    faqs: report.faqs,
    recommendations: report.recommendations,
  };
}

function isUploadPdfApiPath(url: string): boolean {
  return url === UPLOAD_PDF_API_PATH || url.startsWith(`${UPLOAD_PDF_API_PATH}?`);
}

function isUploadReportApiPath(url: string): boolean {
  return url === UPLOAD_REPORT_API_PATH || url.startsWith(`${UPLOAD_REPORT_API_PATH}?`);
}

function isAnalyzeReportApiPath(url: string): boolean {
  return url === ANALYZE_REPORT_API_PATH || url.startsWith(`${ANALYZE_REPORT_API_PATH}?`);
}

function isReportsApiPath(url: string): boolean {
  return url === REPORTS_API_PATH || url.startsWith(`${REPORTS_API_PATH}?`);
}

function isContactApiPath(url: string): boolean {
  return url === CONTACT_API_PATH || url.startsWith(`${CONTACT_API_PATH}?`);
}

function isReportByIdApiPath(url: string): boolean {
  return extractReportIdFromUrl(url) !== null;
}

function extractReportIdFromUrl(url: string): string | null {
  const pathname = url.split("?")[0]?.split("#")[0] || "";
  if (!pathname.startsWith(REPORT_BY_ID_API_PREFIX)) {
    return null;
  }

  const encodedId = pathname.slice(REPORT_BY_ID_API_PREFIX.length).split("/")[0] || "";
  return encodedId ? decodeURIComponent(encodedId) : null;
}

async function parseJsonBody(req: IncomingMessage, maxBytes: number): Promise<unknown> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  return new Promise((resolve, reject) => {
    req.on("data", (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        reject(new Error(`Request too large. Maximum allowed payload is ${Math.floor(maxBytes / 1024 / 1024)} MB.`));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON payload."));
      }
    });

    req.on("error", () => reject(new Error("Could not read request body.")));
  });
}

function validateUploadPdfBody(body: UploadPdfBody): { fileName: string; mimeType: string; dataBase64: string } {
  const fileName = typeof body.fileName === "string" ? body.fileName.trim() : "";
  const mimeType = typeof body.mimeType === "string" ? body.mimeType.trim().toLowerCase() : "";
  const dataBase64 = typeof body.dataBase64 === "string" ? body.dataBase64.trim() : "";

  if (!fileName) throw new Error("Missing file name.");
  if (!fileName.toLowerCase().endsWith(".pdf")) throw new Error("Only PDF files are allowed.");
  if (mimeType && mimeType !== "application/pdf") throw new Error("Only PDF files are allowed.");
  if (!dataBase64) throw new Error("Missing file data.");

  return { fileName, mimeType, dataBase64 };
}

function validateUploadReportBody(body: UploadReportBody): {
  title: string;
  fileName: string;
  fileType: string;
  rawText: string;
} {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const fileName = typeof body.fileName === "string" ? body.fileName.trim() : "";
  const fileType = typeof body.fileType === "string" ? body.fileType.trim() : "";
  const rawText = typeof body.rawText === "string" ? body.rawText.trim() : "";

  if (!title) throw new Error("Missing title.");
  if (!fileName) throw new Error("Missing fileName.");
  if (!fileType) throw new Error("Missing fileType.");
  if (!rawText) throw new Error("Missing rawText.");

  return {
    title: title.slice(0, 200),
    fileName: fileName.slice(0, 200),
    fileType: fileType.slice(0, 80),
    rawText: rawText.slice(0, MAX_ANALYZE_TEXT_CHARS),
  };
}

function validateAnalyzeReportBody(body: AnalyzeReportBody): string {
  const reportId = typeof body.reportId === "string" ? body.reportId.trim() : "";
  if (!reportId) {
    throw new Error("Missing reportId.");
  }
  return reportId;
}

function decodePdfBuffer(dataBase64: string): Buffer {
  const base64 = dataBase64.includes(",") ? dataBase64.split(",").pop() || "" : dataBase64;
  const buffer = Buffer.from(base64, "base64");

  if (buffer.length === 0) throw new Error("Uploaded file is empty.");
  const signature = buffer.subarray(0, 5).toString("ascii");
  if (signature !== "%PDF-") throw new Error("Uploaded file is not a valid PDF.");

  return buffer;
}

async function extractPdfText(pdfBuffer: Buffer): Promise<string> {
  let parser: PDFParse | null = null;
  let text = "";

  try {
    parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });
    const result = await parser.getText();
    text = typeof result.text === "string" ? result.text.trim() : "";
    await parser.destroy();
  } catch {
    if (parser) {
      await parser.destroy().catch(() => undefined);
    }
    throw new Error("PDF parsing failed. Please upload a text-based PDF report.");
  }

  if (!text) {
    throw new Error("No readable text was found in this PDF. Please upload a text-based report.");
  }

  return text.slice(0, MAX_ANALYZE_TEXT_CHARS);
}

function getDeleteFilePathParam(req: IncomingMessage): string {
  const url = new URL(req.url || "", "http://localhost");
  const filePath = url.searchParams.get("filePath");
  if (!filePath) throw new Error("Missing filePath query parameter.");
  return filePath;
}

function resolveSafeUploadFilePath(uploadsDirectory: string, filePath: string): string {
  const normalized = filePath.trim();
  if (!normalized.startsWith("/uploads/")) throw new Error("Invalid file path.");

  const relativeFileName = normalized.slice("/uploads/".length);
  if (!relativeFileName || relativeFileName.includes("..") || relativeFileName.includes("/") || relativeFileName.includes("\\")) {
    throw new Error("Invalid file path.");
  }

  const resolved = path.resolve(uploadsDirectory, relativeFileName);
  const uploadsRoot = path.resolve(uploadsDirectory);
  if (!resolved.startsWith(`${uploadsRoot}${path.sep}`) && resolved !== uploadsRoot) {
    throw new Error("Invalid file path.");
  }

  return resolved;
}

function buildSafePdfFileName(originalName: string): string {
  const sourceBase = path.basename(originalName, path.extname(originalName));
  const safeBase = sourceBase
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
  return `${Date.now()}-${safeBase || "report"}-${randomUUID().slice(0, 8)}.pdf`;
}

function serializeReport(report: {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  rawText: string;
  aiSummary: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): Record<string, unknown> {
  return {
    id: report.id,
    title: report.title,
    fileName: report.fileName,
    fileType: report.fileType,
    rawText: report.rawText,
    aiSummary: report.aiSummary,
    status: report.status,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
  };
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export default defineConfig({
  plugins: [react(), tailwindcss(), reportApiPlugin(path.resolve(__dirname, "."))],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== "true",
  },
});
