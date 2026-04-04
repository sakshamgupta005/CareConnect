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
import { sanitizeReportAnalysis, type ReportAnalysis } from "./src/lib/reportAnalysis";

const UPLOAD_API_PATH = "/api/uploads/pdf";
const ANALYZE_API_PATH = "/api/analyze-report";
const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;
const MAX_ANALYZE_BYTES = 2 * 1024 * 1024;
const MAX_AI_REPORT_CHARS = 24000;

type UploadBody = {
  fileName?: unknown;
  mimeType?: unknown;
  dataBase64?: unknown;
};

type AnalyzeBody = {
  reportText?: unknown;
};

type UploadSuccessPayload = {
  filePath: string;
  originalFileName: string;
  reportText: string;
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

    if (isUploadApiPath(requestUrl)) {
      await handleUploadRequest(req, res, uploadsDirectory);
      return;
    }

    if (isAnalyzeApiPath(requestUrl)) {
      await handleAnalyzeRequest(req, res);
      return;
    }

    next();
  };
}

async function handleUploadRequest(
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

    const body = (await parseJsonBody(req, MAX_UPLOAD_BYTES)) as UploadBody;
    const upload = validateUploadBody(body);

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
    } satisfies UploadSuccessPayload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload PDF.";
    const statusCode = message.toLowerCase().includes("too large") ? 413 : 400;
    sendJson(res, statusCode, { error: message });
  }
}

async function handleAnalyzeRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed." });
      return;
    }

    const body = (await parseJsonBody(req, MAX_ANALYZE_BYTES)) as AnalyzeBody;
    const reportText = validateAnalyzeBody(body);
    const analysis = await analyzeReportWithOpenAI(reportText);

    sendJson(res, 200, analysis as unknown as Record<string, unknown>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Report analysis failed.";
    const lower = message.toLowerCase();

    const statusCode = lower.includes("missing") || lower.includes("invalid") || lower.includes("required")
      ? 400
      : lower.includes("too large")
        ? 413
        : 500;

    sendJson(res, statusCode, { error: message });
  }
}

function isUploadApiPath(url: string): boolean {
  return url === UPLOAD_API_PATH || url.startsWith(`${UPLOAD_API_PATH}?`);
}

function isAnalyzeApiPath(url: string): boolean {
  return url === ANALYZE_API_PATH || url.startsWith(`${ANALYZE_API_PATH}?`);
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

    req.on("error", () => {
      reject(new Error("Could not read request body."));
    });
  });
}

function validateUploadBody(body: UploadBody): { fileName: string; mimeType: string; dataBase64: string } {
  const fileName = typeof body.fileName === "string" ? body.fileName.trim() : "";
  const mimeType = typeof body.mimeType === "string" ? body.mimeType.trim().toLowerCase() : "";
  const dataBase64 = typeof body.dataBase64 === "string" ? body.dataBase64.trim() : "";

  if (!fileName) {
    throw new Error("Missing file name.");
  }
  if (!fileName.toLowerCase().endsWith(".pdf")) {
    throw new Error("Only PDF files are allowed.");
  }
  if (mimeType && mimeType !== "application/pdf") {
    throw new Error("Only PDF files are allowed.");
  }
  if (!dataBase64) {
    throw new Error("Missing file data.");
  }

  return { fileName, mimeType, dataBase64 };
}

function validateAnalyzeBody(body: AnalyzeBody): string {
  const reportText = typeof body.reportText === "string" ? body.reportText.trim() : "";
  if (!reportText) {
    throw new Error("Missing reportText.");
  }

  return reportText.slice(0, MAX_AI_REPORT_CHARS);
}

function decodePdfBuffer(dataBase64: string): Buffer {
  const base64 = dataBase64.includes(",") ? dataBase64.split(",").pop() || "" : dataBase64;
  const buffer = Buffer.from(base64, "base64");

  if (buffer.length === 0) {
    throw new Error("Uploaded file is empty.");
  }

  const pdfSignature = buffer.subarray(0, 5).toString("ascii");
  if (pdfSignature !== "%PDF-") {
    throw new Error("Uploaded file is not a valid PDF.");
  }

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

  return text.slice(0, 120000);
}

async function analyzeReportWithOpenAI(reportText: string): Promise<ReportAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY. Add it to your environment before running report analysis.");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const promptText = reportText.slice(0, MAX_AI_REPORT_CHARS);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a healthcare report explainer. Return ONLY strict JSON with keys: summary, keyFindings, faqs, recommendations. Use only explicit facts from report text. Do not hallucinate values. Keep language simple for non-medical users. keyFindings[].status must be low, normal, or high.",
        },
        {
          role: "user",
          content: `Analyze the report text below and return JSON only.\n\n${promptText}`,
        },
      ],
    }),
  });

  const raw = await response.text();
  let payload: unknown = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorMessage =
      payload && typeof payload === "object" && "error" in payload && payload.error && typeof payload.error === "object" &&
      "message" in payload.error && typeof payload.error.message === "string"
        ? payload.error.message
        : "OpenAI request failed.";
    throw new Error(errorMessage);
  }

  const content = getChatCompletionContent(payload);
  if (!content) {
    throw new Error("AI returned an empty analysis response.");
  }

  let parsedAnalysis: unknown = null;
  try {
    parsedAnalysis = JSON.parse(content);
  } catch {
    throw new Error("AI did not return valid JSON.");
  }

  return sanitizeReportAnalysis(parsedAnalysis);
}

function getChatCompletionContent(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const data = payload as {
    choices?: Array<{
      message?: {
        content?: unknown;
      };
    }>;
  };

  const rawContent = data.choices?.[0]?.message?.content;
  if (typeof rawContent === "string") {
    return rawContent;
  }

  if (!Array.isArray(rawContent)) {
    return "";
  }

  return rawContent
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }

      if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
        return part.text;
      }

      return "";
    })
    .join("\n")
    .trim();
}

function getDeleteFilePathParam(req: IncomingMessage): string {
  const url = new URL(req.url || "", "http://localhost");
  const filePath = url.searchParams.get("filePath");
  if (!filePath) {
    throw new Error("Missing filePath query parameter.");
  }
  return filePath;
}

function resolveSafeUploadFilePath(uploadsDirectory: string, filePath: string): string {
  const normalized = filePath.trim();
  if (!normalized.startsWith("/uploads/")) {
    throw new Error("Invalid file path.");
  }

  const relativeFileName = normalized.slice("/uploads/".length);
  if (!relativeFileName || relativeFileName.includes("..") || relativeFileName.includes("/") || relativeFileName.includes("\\")) {
    throw new Error("Invalid file path.");
  }

  const resolved = path.resolve(uploadsDirectory, relativeFileName);
  const uploadsRoot = path.resolve(uploadsDirectory);

  if (!resolved.startsWith(uploadsRoot + path.sep) && resolved !== uploadsRoot) {
    throw new Error("Invalid file path.");
  }

  return resolved;
}

function buildSafePdfFileName(originalName: string): string {
  const extension = ".pdf";
  const sourceBase = path.basename(originalName, path.extname(originalName));
  const safeBase = sourceBase
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);

  const normalizedBase = safeBase || "report";
  return `${Date.now()}-${normalizedBase}-${randomUUID().slice(0, 8)}${extension}`;
}

function sendJson(res: ServerResponse, statusCode: number, payload: Record<string, unknown>): void {
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
