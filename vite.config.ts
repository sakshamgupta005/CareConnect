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
import { normalizeDoctorPublicIdInput, normalizePatientPublicId } from "./src/lib/doctorTeam";
import { assertPrismaDelegates, prisma } from "./src/lib/prisma";

const UPLOAD_PDF_API_PATH = "/api/uploads/pdf";
const UPLOAD_REPORT_API_PATH = "/api/upload-report";
const ANALYZE_REPORT_API_PATH = "/api/analyze-report";
const REPORTS_API_PATH = "/api/reports";
const REPORT_BY_ID_API_PREFIX = "/api/report/";
const CONTACT_API_PATH = "/api/contact";
const DOCTOR_TEAM_API_PATH = "/api/doctor-team";
const DOCTOR_TEAM_PUBLIC_API_PREFIX = "/api/doctor-team/public/";

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
  filePath?: unknown;
  rawText?: unknown;
};

type AnalyzeReportBody = {
  reportId?: unknown;
};

type ReportScalarRecord = {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  filePath?: string | null;
  rawText: string;
  aiSummary: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type LocalReportRecord = {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  filePath: string | null;
  rawText: string;
  aiSummary: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type LocalInsightRecord = {
  id: string;
  reportId: string;
  type: string;
  label: string;
  value: string;
  status: "low" | "normal" | "high";
};

type LocalFaqRecord = {
  id: string;
  reportId: string;
  question: string;
  answer: string;
};

type LocalRecommendationRecord = {
  id: string;
  reportId: string;
  category: string;
  text: string;
};

type LocalReportStore = {
  reports: LocalReportRecord[];
  insights: LocalInsightRecord[];
  faqs: LocalFaqRecord[];
  recommendations: LocalRecommendationRecord[];
};

type LocalContactSubmissionRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string | null;
  age: string | null;
  gender: string | null;
  bloodGroup: string | null;
  reportTitle: string | null;
  reportFileName: string | null;
  reportFileType: string | null;
  reportFilePath: string | null;
  reportRawText: string | null;
  linkedReportId: string | null;
  linkedReportStatus: "uploaded" | "analyzed" | null;
  message: string;
  createdAt: string;
};

type LocalContactSubmissionStore = {
  submissions: LocalContactSubmissionRecord[];
};

type DoctorTeamBody = {
  patientPublicId?: unknown;
  doctorPublicId?: unknown;
  doctorName?: unknown;
  doctorSpecialty?: unknown;
  notes?: unknown;
};

type LocalDoctorTeamMemberRecord = {
  id: string;
  patientPublicId: string;
  doctorPublicId: string;
  doctorName: string | null;
  doctorSpecialty: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type LocalDoctorTeamStore = {
  members: LocalDoctorTeamMemberRecord[];
};

type DoctorTeamDbRecord = {
  id: string;
  patientPublicId: string;
  doctorPublicId: string;
  doctorName: string | null;
  doctorSpecialty: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type DoctorTeamPublicSource = {
  doctorPublicId: string;
  doctorName: string | null;
  doctorSpecialty: string | null;
  patientPublicId: string;
  updatedAt: Date;
};

type SerializedReport = {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  filePath: string | null;
  rawText: string;
  aiSummary: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
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
  const localReportStoreFilePath = path.join(projectRoot, ".data", "report-store.json");
  const localContactStoreFilePath = path.join(projectRoot, ".data", "contact-submission-store.json");
  const localDoctorTeamStoreFilePath = path.join(projectRoot, ".data", "doctor-team-store.json");

  return async (req, res, next) => {
    const requestUrl = req.url || "";

    try {
      if (isUploadPdfApiPath(requestUrl)) {
        await handleUploadPdfRequest(req, res, uploadsDirectory);
        return;
      }

      if (isUploadReportApiPath(requestUrl)) {
        await handleUploadReportRequest(req, res, localReportStoreFilePath);
        return;
      }

      if (isAnalyzeReportApiPath(requestUrl)) {
        await handleAnalyzeReportRequest(req, res, localReportStoreFilePath);
        return;
      }

      if (isReportByIdApiPath(requestUrl)) {
        await handleReportByIdRequest(req, res, localReportStoreFilePath);
        return;
      }

      if (isReportsApiPath(requestUrl)) {
        await handleReportsRequest(req, res, localReportStoreFilePath);
        return;
      }

      if (isContactApiPath(requestUrl)) {
        await handleContactRequest(req, res, localContactStoreFilePath);
        return;
      }

      if (isDoctorTeamPublicApiPath(requestUrl)) {
        await handleDoctorTeamPublicProfileRequest(req, res, localDoctorTeamStoreFilePath);
        return;
      }

      if (isDoctorTeamApiPath(requestUrl)) {
        await handleDoctorTeamRequest(req, res, localDoctorTeamStoreFilePath);
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

async function handleUploadReportRequest(
  req: IncomingMessage,
  res: ServerResponse,
  localReportStoreFilePath: string,
): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  let payload: ReturnType<typeof validateUploadReportBody> | null = null;

  try {
    assertPrismaDelegates(["report"]);

    const body = (await parseJsonBody(req, MAX_UPLOAD_BYTES)) as UploadReportBody;
    payload = validateUploadReportBody(body);
    const hasReportFilePathColumn = await supportsReportFilePathColumn();

    const report = await prisma.report.create({
      data: buildReportCreateData(payload, hasReportFilePathColumn),
      select: getReportScalarSelect(hasReportFilePathColumn),
    });

    sendJson(res, 201, serializeReport(report));
  } catch (error) {
    if (payload && shouldUseLocalReportStore(error)) {
      console.warn("[api/upload-report] Prisma unavailable. Saving report to local fallback store.");
      const report = await createLocalReport(localReportStoreFilePath, payload);
      sendJson(res, 201, report);
      return;
    }

    console.error("[api/upload-report] Failed to create report:", error);
    const message = error instanceof Error ? error.message : "Could not save report.";
    sendJson(res, 400, { error: message });
  }
}

async function handleAnalyzeReportRequest(
  req: IncomingMessage,
  res: ServerResponse,
  localReportStoreFilePath: string,
): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  let reportId = "";

  try {
    assertPrismaDelegates(["report", "insight", "faq", "recommendation"]);

    const body = (await parseJsonBody(req, MAX_UPLOAD_BYTES)) as AnalyzeReportBody;
    reportId = validateAnalyzeReportBody(body);
    const hasReportFilePathColumn = await supportsReportFilePathColumn();

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: getReportScalarSelect(hasReportFilePathColumn),
    });
    if (!report) {
      const localDetails = await analyzeLocalReport(localReportStoreFilePath, reportId);
      if (localDetails) {
        sendJson(res, 200, localDetails);
        return;
      }

      sendJson(res, 404, { error: "Report not found." });
      return;
    }

    if (!report.rawText.trim()) {
      sendJson(res, 400, { error: "Report text is empty and cannot be analyzed." });
      return;
    }

    const analysis = analyzeHealthReport(report.rawText.slice(0, MAX_ANALYZE_TEXT_CHARS));

    const writeOperations = [
      prisma.insight.deleteMany({ where: { reportId } }),
      prisma.faq.deleteMany({ where: { reportId } }),
      prisma.recommendation.deleteMany({ where: { reportId } }),
      prisma.report.update({
        where: { id: reportId },
        data: {
          aiSummary: analysis.summary,
          status: "analyzed",
        },
        select: { id: true },
      }),
    ];

    if (analysis.insights.length > 0) {
      writeOperations.push(
        prisma.insight.createMany({
          data: analysis.insights.map((insight) => ({
            reportId,
            type: insight.type,
            label: insight.label,
            value: insight.value,
            status: insight.status,
          })),
        }),
      );
    }

    if (analysis.faqs.length > 0) {
      writeOperations.push(
        prisma.faq.createMany({
          data: analysis.faqs.map((faq) => ({
            reportId,
            question: faq.question,
            answer: faq.answer,
          })),
        }),
      );
    }

    if (analysis.recommendations.length > 0) {
      writeOperations.push(
        prisma.recommendation.createMany({
          data: analysis.recommendations.map((item) => ({
            reportId,
            category: item.category,
            text: item.text,
          })),
        }),
      );
    }

    await prisma.$transaction(writeOperations);

    const details = await getReportDetails(reportId, localReportStoreFilePath);
    if (!details) {
      sendJson(res, 404, { error: "Report not found after analysis." });
      return;
    }

    sendJson(res, 200, details);
  } catch (error) {
    if (reportId && shouldUseLocalReportStore(error)) {
      console.warn("[api/analyze-report] Prisma unavailable. Using local fallback store.");
      const details = await analyzeLocalReport(localReportStoreFilePath, reportId);
      if (details) {
        sendJson(res, 200, details);
        return;
      }
    }

    console.error("[api/analyze-report] Failed to analyze report:", error);
    const message = error instanceof Error ? error.message : "Could not analyze report.";
    sendJson(res, 400, { error: message });
  }
}

async function handleReportByIdRequest(
  req: IncomingMessage,
  res: ServerResponse,
  localReportStoreFilePath: string,
): Promise<void> {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  const reportId = extractReportIdFromUrl(req.url || "");
  if (!reportId) {
    sendJson(res, 400, { error: "Missing report id." });
    return;
  }

  try {
    assertPrismaDelegates(["report", "insight", "faq", "recommendation"]);

    const details = await getReportDetails(reportId, localReportStoreFilePath);
    if (!details) {
      sendJson(res, 404, { error: "Report not found." });
      return;
    }

    sendJson(res, 200, details);
  } catch (error) {
    if (shouldUseLocalReportStore(error)) {
      console.warn("[api/report/:id] Prisma unavailable. Using local fallback store.");
      const localDetails = await getLocalReportDetails(localReportStoreFilePath, reportId);
      if (!localDetails) {
        sendJson(res, 404, { error: "Report not found." });
        return;
      }

      sendJson(res, 200, localDetails);
      return;
    }

    throw error;
  }
}

async function handleReportsRequest(
  req: IncomingMessage,
  res: ServerResponse,
  localReportStoreFilePath: string,
): Promise<void> {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    assertPrismaDelegates(["report", "insight", "faq", "recommendation"]);
    const hasReportFilePathColumn = await supportsReportFilePathColumn();

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        ...getReportScalarSelect(hasReportFilePathColumn),
        _count: {
          select: {
            insights: true,
            faqs: true,
            recommendations: true,
          },
        },
      },
    });

    const localReports = await listLocalReports(localReportStoreFilePath);

    sendJson(
      res,
      200,
      mergeReportLists(
        reports.map((report) => ({
          ...serializeReport(report),
          counts: report._count,
        })),
        localReports,
      ),
    );
  } catch (error) {
    if (shouldUseLocalReportStore(error)) {
      console.warn("[api/reports] Prisma unavailable. Using local fallback store.");
      sendJson(res, 200, await listLocalReports(localReportStoreFilePath));
      return;
    }

    throw error;
  }
}

async function handleContactRequest(
  req: IncomingMessage,
  res: ServerResponse,
  localContactStoreFilePath: string,
): Promise<void> {
  if (req.method === "GET") {
    const role = getRequestHeader(req, "x-careconnect-role").toLowerCase();
    if (role !== "doctor") {
      sendJson(res, 403, { error: "Only doctor role can view contact submissions." });
      return;
    }

    try {
      assertPrismaDelegates(["contactSubmission"]);

      const submissions = await prisma.contactSubmission.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          age: true,
          gender: true,
          bloodGroup: true,
          reportTitle: true,
          reportFileName: true,
          reportFileType: true,
          reportFilePath: true,
          reportRawText: true,
          linkedReportId: true,
          linkedReportStatus: true,
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
      if (shouldUseLocalContactStore(error)) {
        sendJson(res, 200, await listLocalContactSubmissions(localContactStoreFilePath));
        return;
      }

      console.error("[api/contact] Failed to load contact submissions:", error);
      const message = error instanceof Error ? error.message : "Could not load contact submissions.";
      sendJson(res, 400, { error: message });
      return;
    }
  }

  if (req.method === "POST") {
    let payload: ReturnType<typeof validateContactSubmissionBody> | null = null;

    try {
      const body = await parseJsonBody(req, MAX_UPLOAD_BYTES);
      payload = validateContactSubmissionBody(body);
      assertPrismaDelegates(["contactSubmission"]);

      const submission = await prisma.contactSubmission.create({
        data: {
          name: payload.name,
          email: payload.email,
          phone: payload.phone || null,
          role: payload.role || null,
          age: payload.age || null,
          gender: payload.gender || null,
          bloodGroup: payload.bloodGroup || null,
          reportTitle: payload.reportTitle || null,
          reportFileName: payload.reportFileName || null,
          reportFileType: payload.reportFileType || null,
          reportFilePath: payload.reportFilePath || null,
          reportRawText: payload.reportRawText || null,
          linkedReportId: payload.linkedReportId || null,
          linkedReportStatus: payload.linkedReportStatus || null,
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
      if (payload && shouldUseLocalContactStore(error)) {
        const submission = await createLocalContactSubmission(localContactStoreFilePath, payload);
        sendJson(res, 201, submission);
        return;
      }

      console.error("[api/contact] Failed to save contact submission:", error);
      const message = error instanceof Error ? error.message : "Could not save contact submission.";
      sendJson(res, 400, { error: message });
      return;
    }
  }

  if (req.method === "DELETE") {
    const role = req.headers["x-careconnect-role"]?.toString().trim().toLowerCase() || "";
    if (role !== "doctor") {
      sendJson(res, 403, { error: "Only doctor role can remove contact submissions." });
      return;
    }

    try {
      const url = new URL(req.url || "", "http://localhost");
      const submissionId = url.searchParams.get("id")?.trim() || "";
      if (!submissionId) {
        sendJson(res, 400, { error: "Missing submission id." });
        return;
      }
      assertPrismaDelegates(["contactSubmission"]);

      await prisma.contactSubmission.delete({
        where: { id: submissionId },
      });

      sendJson(res, 200, { deleted: true });
      return;
    } catch (error) {
      if (shouldUseLocalContactStore(error)) {
        const url = new URL(req.url || "", "http://localhost");
        const submissionId = url.searchParams.get("id")?.trim() || "";
        if (!submissionId) {
          sendJson(res, 400, { error: "Missing submission id." });
          return;
        }

        await deleteLocalContactSubmission(localContactStoreFilePath, submissionId);
        sendJson(res, 200, { deleted: true });
        return;
      }

      console.error("[api/contact] Failed to delete contact submission:", error);
      const message = error instanceof Error ? error.message : "Could not delete contact submission.";
      sendJson(res, 400, { error: message });
      return;
    }
  }

  sendJson(res, 405, { error: "Method not allowed." });
}

async function handleDoctorTeamRequest(
  req: IncomingMessage,
  res: ServerResponse,
  localDoctorTeamStoreFilePath: string,
): Promise<void> {
  if (req.method === "GET") {
    const patientPublicId = extractPatientPublicIdFromQuery(req.url || "");
    if (!patientPublicId) {
      sendJson(res, 400, { error: "Missing patient public id." });
      return;
    }

    try {
      assertPrismaDelegates(["doctorTeamMember"]);
      const delegate = getDoctorTeamDelegate();

      const members = (await delegate.findMany({
        where: { patientPublicId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          patientPublicId: true,
          doctorPublicId: true,
          doctorName: true,
          doctorSpecialty: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
      })) as DoctorTeamDbRecord[];

      sendJson(res, 200, members.map(serializeDoctorTeamMember));
      return;
    } catch (error) {
      if (shouldUseLocalDoctorTeamStore(error)) {
        sendJson(res, 200, await listLocalDoctorTeamMembers(localDoctorTeamStoreFilePath, patientPublicId));
        return;
      }

      console.error("[api/doctor-team] Failed to load doctor team:", error);
      const message = error instanceof Error ? error.message : "Could not load doctor team.";
      sendJson(res, 400, { error: message });
      return;
    }
  }

  if (req.method === "POST") {
    let payload: ReturnType<typeof validateDoctorTeamBody> | null = null;

    try {
      const body = (await parseJsonBody(req, MAX_UPLOAD_BYTES)) as DoctorTeamBody;
      payload = validateDoctorTeamBody(body);
      assertPrismaDelegates(["doctorTeamMember"]);
      const delegate = getDoctorTeamDelegate();

      const existing = (await delegate.findFirst({
        where: {
          patientPublicId: payload.patientPublicId,
          doctorPublicId: payload.doctorPublicId,
        },
        select: { id: true },
      })) as { id: string } | null;

      if (existing) {
        sendJson(res, 409, { error: "Doctor already exists in your team." });
        return;
      }

      const createdMember = (await delegate.create({
        data: payload,
        select: {
          id: true,
          patientPublicId: true,
          doctorPublicId: true,
          doctorName: true,
          doctorSpecialty: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
      })) as DoctorTeamDbRecord;

      sendJson(res, 201, serializeDoctorTeamMember(createdMember));
      return;
    } catch (error) {
      if (payload && shouldUseLocalDoctorTeamStore(error)) {
        try {
          const created = await createLocalDoctorTeamMember(localDoctorTeamStoreFilePath, payload);
          sendJson(res, 201, created);
          return;
        } catch (localError) {
          const localMessage = localError instanceof Error ? localError.message : "Could not add doctor to team.";
          const statusCode = localMessage.toLowerCase().includes("already exists") ? 409 : 400;
          sendJson(res, statusCode, { error: localMessage });
          return;
        }
      }

      const message = error instanceof Error ? error.message : "Could not add doctor to team.";
      const statusCode = isDuplicateDoctorTeamError(error) ? 409 : 400;
      console.error("[api/doctor-team] Failed to add doctor:", error);
      sendJson(res, statusCode, { error: isDuplicateDoctorTeamError(error) ? "Doctor already exists in your team." : message });
      return;
    }
  }

  if (req.method === "DELETE") {
    const patientPublicId = extractPatientPublicIdFromQuery(req.url || "");
    const memberId = extractDoctorTeamMemberIdFromQuery(req.url || "");
    if (!patientPublicId) {
      sendJson(res, 400, { error: "Missing patient public id." });
      return;
    }
    if (!memberId) {
      sendJson(res, 400, { error: "Missing doctor team member id." });
      return;
    }

    try {
      assertPrismaDelegates(["doctorTeamMember"]);
      const delegate = getDoctorTeamDelegate();

      const result = (await delegate.deleteMany({
        where: {
          id: memberId,
          patientPublicId,
        },
      })) as { count: number };

      if (result.count === 0) {
        sendJson(res, 404, { error: "Doctor team member not found." });
        return;
      }

      sendJson(res, 200, { deleted: true });
      return;
    } catch (error) {
      if (shouldUseLocalDoctorTeamStore(error)) {
        try {
          await deleteLocalDoctorTeamMember(localDoctorTeamStoreFilePath, patientPublicId, memberId);
          sendJson(res, 200, { deleted: true });
          return;
        } catch (localError) {
          const localMessage = localError instanceof Error ? localError.message : "Could not remove doctor from team.";
          const statusCode = localMessage.toLowerCase().includes("not found") ? 404 : 400;
          sendJson(res, statusCode, { error: localMessage });
          return;
        }
      }

      console.error("[api/doctor-team] Failed to remove doctor:", error);
      const message = error instanceof Error ? error.message : "Could not remove doctor from team.";
      sendJson(res, 400, { error: message });
      return;
    }
  }

  sendJson(res, 405, { error: "Method not allowed." });
}

async function handleDoctorTeamPublicProfileRequest(
  req: IncomingMessage,
  res: ServerResponse,
  localDoctorTeamStoreFilePath: string,
): Promise<void> {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  const doctorPublicId = extractDoctorPublicIdFromPublicApiUrl(req.url || "");
  if (!doctorPublicId) {
    sendJson(res, 400, { error: "Missing doctor public id." });
    return;
  }

  try {
    assertPrismaDelegates(["doctorTeamMember"]);
    const delegate = getDoctorTeamDelegate();

    const members = (await delegate.findMany({
      where: { doctorPublicId },
      orderBy: { updatedAt: "desc" },
      select: {
        doctorPublicId: true,
        doctorName: true,
        doctorSpecialty: true,
        patientPublicId: true,
        updatedAt: true,
      },
    })) as DoctorTeamPublicSource[];

    if (members.length === 0) {
      sendJson(res, 404, { error: "Doctor public profile not found." });
      return;
    }

    sendJson(res, 200, buildDoctorPublicProfileResponse(members));
    return;
  } catch (error) {
    if (shouldUseLocalDoctorTeamStore(error)) {
      const profile = await getLocalDoctorPublicProfile(localDoctorTeamStoreFilePath, doctorPublicId);
      if (!profile) {
        sendJson(res, 404, { error: "Doctor public profile not found." });
        return;
      }

      sendJson(res, 200, profile);
      return;
    }

    console.error("[api/doctor-team/public] Failed to load profile:", error);
    const message = error instanceof Error ? error.message : "Could not load doctor public profile.";
    sendJson(res, 400, { error: message });
  }
}

async function getReportDetails(
  reportId: string,
  localReportStoreFilePath?: string,
): Promise<Record<string, unknown> | null> {
  try {
    const hasReportFilePathColumn = await supportsReportFilePathColumn();
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: {
        ...getReportScalarSelect(hasReportFilePathColumn),
        insights: { orderBy: { label: "asc" } },
        faqs: { orderBy: { question: "asc" } },
        recommendations: { orderBy: { category: "asc" } },
      },
    });

    if (report) {
      return {
        report: serializeReport(report),
        insights: report.insights,
        faqs: report.faqs,
        recommendations: report.recommendations,
      };
    }

    if (localReportStoreFilePath) {
      return getLocalReportDetails(localReportStoreFilePath, reportId);
    }

    return null;
  } catch (error) {
    if (localReportStoreFilePath && shouldUseLocalReportStore(error)) {
      return getLocalReportDetails(localReportStoreFilePath, reportId);
    }

    throw error;
  }
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

function isDoctorTeamApiPath(url: string): boolean {
  return url === DOCTOR_TEAM_API_PATH || url.startsWith(`${DOCTOR_TEAM_API_PATH}?`);
}

function isDoctorTeamPublicApiPath(url: string): boolean {
  return extractDoctorPublicIdFromPublicApiUrl(url) !== null;
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

function extractDoctorPublicIdFromPublicApiUrl(url: string): string | null {
  const pathname = url.split("?")[0]?.split("#")[0] || "";
  if (!pathname.startsWith(DOCTOR_TEAM_PUBLIC_API_PREFIX)) {
    return null;
  }

  const encodedId = pathname.slice(DOCTOR_TEAM_PUBLIC_API_PREFIX.length).split("/")[0] || "";
  if (!encodedId) {
    return null;
  }

  const decoded = decodeURIComponent(encodedId);
  const normalized = normalizeDoctorPublicIdInput(decoded);
  return normalized || null;
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
  filePath: string | null;
  rawText: string;
} {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const fileName = typeof body.fileName === "string" ? body.fileName.trim() : "";
  const fileType = typeof body.fileType === "string" ? body.fileType.trim() : "";
  const filePath = typeof body.filePath === "string" ? body.filePath.trim() : "";
  const rawText = typeof body.rawText === "string" ? body.rawText.trim() : "";

  if (!title) throw new Error("Missing title.");
  if (!fileName) throw new Error("Missing fileName.");
  if (!fileType) throw new Error("Missing fileType.");
  if (!rawText) throw new Error("Missing rawText.");

  return {
    title: title.slice(0, 200),
    fileName: fileName.slice(0, 200),
    fileType: fileType.slice(0, 80),
    filePath: filePath ? filePath.slice(0, 500) : null,
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

function validateDoctorTeamBody(body: DoctorTeamBody): {
  patientPublicId: string;
  doctorPublicId: string;
  doctorName: string | null;
  doctorSpecialty: string | null;
  notes: string | null;
} {
  const patientPublicId = normalizePatientPublicId(typeof body.patientPublicId === "string" ? body.patientPublicId : "");
  const doctorPublicId = normalizeDoctorPublicIdInput(typeof body.doctorPublicId === "string" ? body.doctorPublicId : "");
  const doctorName = typeof body.doctorName === "string" ? body.doctorName.trim().slice(0, 120) : "";
  const doctorSpecialty = typeof body.doctorSpecialty === "string" ? body.doctorSpecialty.trim().slice(0, 120) : "";
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : "";

  if (!patientPublicId) {
    throw new Error("Missing patient public id.");
  }

  if (!doctorPublicId) {
    throw new Error("Missing doctor public id.");
  }

  return {
    patientPublicId,
    doctorPublicId,
    doctorName: doctorName || null,
    doctorSpecialty: doctorSpecialty || null,
    notes: notes || null,
  };
}

function extractPatientPublicIdFromQuery(urlValue: string): string {
  const url = new URL(urlValue || "", "http://localhost");
  const normalized = normalizePatientPublicId(url.searchParams.get("patientPublicId") ?? "");
  return normalized;
}

function extractDoctorTeamMemberIdFromQuery(urlValue: string): string {
  const url = new URL(urlValue || "", "http://localhost");
  return url.searchParams.get("id")?.trim() || "";
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

function shouldUseLocalReportStore(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    message.includes("can't reach database server") ||
    message.includes("environment variable not found: database_url") ||
    message.includes('prisma client delegate "prisma.report" is missing') ||
    message.includes("prisma client delegate \"prisma.insight\" is missing") ||
    message.includes("prisma client delegate \"prisma.faq\" is missing") ||
    message.includes("prisma client delegate \"prisma.recommendation\" is missing")
  );
}

function shouldUseLocalContactStore(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    message.includes("can't reach database server") ||
    message.includes("environment variable not found: database_url") ||
    message.includes('prisma client delegate "prisma.contactsubmission" is missing') ||
    message.includes("error validating datasource") ||
    (message.includes("datasource") && message.includes("direct_url"))
  );
}

function shouldUseLocalDoctorTeamStore(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    message.includes("can't reach database server") ||
    message.includes("environment variable not found: database_url") ||
    message.includes('prisma client delegate "prisma.doctorteammember" is missing') ||
    message.includes("error validating datasource") ||
    (message.includes("table") && message.includes("doctorteammember")) ||
    (message.includes("datasource") && message.includes("direct_url"))
  );
}

function createEmptyLocalReportStore(): LocalReportStore {
  return {
    reports: [],
    insights: [],
    faqs: [],
    recommendations: [],
  };
}

function createEmptyLocalContactStore(): LocalContactSubmissionStore {
  return {
    submissions: [],
  };
}

function createEmptyLocalDoctorTeamStore(): LocalDoctorTeamStore {
  return {
    members: [],
  };
}

async function readLocalReportStore(localReportStoreFilePath: string): Promise<LocalReportStore> {
  try {
    const raw = await readFile(localReportStoreFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalReportStore>;

    return {
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    };
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      return createEmptyLocalReportStore();
    }

    throw error;
  }
}

async function writeLocalReportStore(localReportStoreFilePath: string, store: LocalReportStore): Promise<void> {
  await mkdir(path.dirname(localReportStoreFilePath), { recursive: true });
  await writeFile(localReportStoreFilePath, JSON.stringify(store, null, 2), "utf8");
}

async function readLocalContactStore(localContactStoreFilePath: string): Promise<LocalContactSubmissionStore> {
  try {
    const raw = await readFile(localContactStoreFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalContactSubmissionStore>;

    return {
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
    };
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      return createEmptyLocalContactStore();
    }

    throw error;
  }
}

async function writeLocalContactStore(
  localContactStoreFilePath: string,
  store: LocalContactSubmissionStore,
): Promise<void> {
  await mkdir(path.dirname(localContactStoreFilePath), { recursive: true });
  await writeFile(localContactStoreFilePath, JSON.stringify(store, null, 2), "utf8");
}

async function readLocalDoctorTeamStore(localDoctorTeamStoreFilePath: string): Promise<LocalDoctorTeamStore> {
  try {
    const raw = await readFile(localDoctorTeamStoreFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalDoctorTeamStore>;

    return {
      members: Array.isArray(parsed.members) ? parsed.members : [],
    };
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      return createEmptyLocalDoctorTeamStore();
    }

    throw error;
  }
}

async function writeLocalDoctorTeamStore(
  localDoctorTeamStoreFilePath: string,
  store: LocalDoctorTeamStore,
): Promise<void> {
  await mkdir(path.dirname(localDoctorTeamStoreFilePath), { recursive: true });
  await writeFile(localDoctorTeamStoreFilePath, JSON.stringify(store, null, 2), "utf8");
}

async function createLocalReport(
  localReportStoreFilePath: string,
  payload: ReturnType<typeof validateUploadReportBody>,
): Promise<Record<string, unknown>> {
  const store = await readLocalReportStore(localReportStoreFilePath);
  const now = new Date().toISOString();
  const report: LocalReportRecord = {
    id: randomUUID(),
    title: payload.title,
    fileName: payload.fileName,
    fileType: payload.fileType,
    filePath: payload.filePath,
    rawText: payload.rawText,
    aiSummary: null,
    status: "uploaded",
    createdAt: now,
    updatedAt: now,
  };

  store.reports.push(report);
  await writeLocalReportStore(localReportStoreFilePath, store);
  return serializeLocalReport(report);
}

async function listLocalContactSubmissions(
  localContactStoreFilePath: string,
): Promise<LocalContactSubmissionRecord[]> {
  const store = await readLocalContactStore(localContactStoreFilePath);
  return [...store.submissions].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    return rightTime - leftTime;
  });
}

async function createLocalContactSubmission(
  localContactStoreFilePath: string,
  payload: ReturnType<typeof validateContactSubmissionBody>,
): Promise<{ id: string; createdAt: string }> {
  const store = await readLocalContactStore(localContactStoreFilePath);
  const createdAt = new Date().toISOString();
  const submission: LocalContactSubmissionRecord = {
    id: randomUUID(),
    name: payload.name,
    email: payload.email,
    phone: payload.phone || null,
    role: payload.role || null,
    age: payload.age || null,
    gender: payload.gender || null,
    bloodGroup: payload.bloodGroup || null,
    reportTitle: payload.reportTitle || null,
    reportFileName: payload.reportFileName || null,
    reportFileType: payload.reportFileType || null,
    reportFilePath: payload.reportFilePath || null,
    reportRawText: payload.reportRawText || null,
    linkedReportId: payload.linkedReportId || null,
    linkedReportStatus: payload.linkedReportStatus || null,
    message: payload.message,
    createdAt,
  };

  store.submissions.push(submission);
  await writeLocalContactStore(localContactStoreFilePath, store);
  return { id: submission.id, createdAt: submission.createdAt };
}

async function deleteLocalContactSubmission(
  localContactStoreFilePath: string,
  submissionId: string,
): Promise<void> {
  const store = await readLocalContactStore(localContactStoreFilePath);
  const nextSubmissions = store.submissions.filter((item) => item.id !== submissionId);

  if (nextSubmissions.length === store.submissions.length) {
    throw new Error("Submission not found.");
  }

  store.submissions = nextSubmissions;
  await writeLocalContactStore(localContactStoreFilePath, store);
}

async function listLocalDoctorTeamMembers(
  localDoctorTeamStoreFilePath: string,
  patientPublicId: string,
): Promise<LocalDoctorTeamMemberRecord[]> {
  const store = await readLocalDoctorTeamStore(localDoctorTeamStoreFilePath);
  return store.members
    .filter((member) => member.patientPublicId === patientPublicId)
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

async function createLocalDoctorTeamMember(
  localDoctorTeamStoreFilePath: string,
  payload: ReturnType<typeof validateDoctorTeamBody>,
): Promise<LocalDoctorTeamMemberRecord> {
  const store = await readLocalDoctorTeamStore(localDoctorTeamStoreFilePath);
  const exists = store.members.some(
    (member) =>
      member.patientPublicId === payload.patientPublicId && member.doctorPublicId === payload.doctorPublicId,
  );

  if (exists) {
    throw new Error("Doctor already exists in your team.");
  }

  const now = new Date().toISOString();
  const member: LocalDoctorTeamMemberRecord = {
    id: randomUUID(),
    patientPublicId: payload.patientPublicId,
    doctorPublicId: payload.doctorPublicId,
    doctorName: payload.doctorName,
    doctorSpecialty: payload.doctorSpecialty,
    notes: payload.notes,
    createdAt: now,
    updatedAt: now,
  };

  store.members.push(member);
  await writeLocalDoctorTeamStore(localDoctorTeamStoreFilePath, store);
  return member;
}

async function deleteLocalDoctorTeamMember(
  localDoctorTeamStoreFilePath: string,
  patientPublicId: string,
  memberId: string,
): Promise<void> {
  const store = await readLocalDoctorTeamStore(localDoctorTeamStoreFilePath);
  const before = store.members.length;
  store.members = store.members.filter((member) => !(member.id === memberId && member.patientPublicId === patientPublicId));

  if (before === store.members.length) {
    throw new Error("Doctor team member not found.");
  }

  await writeLocalDoctorTeamStore(localDoctorTeamStoreFilePath, store);
}

async function getLocalDoctorPublicProfile(
  localDoctorTeamStoreFilePath: string,
  doctorPublicId: string,
): Promise<Record<string, unknown> | null> {
  const store = await readLocalDoctorTeamStore(localDoctorTeamStoreFilePath);
  const matches = store.members
    .filter((member) => member.doctorPublicId === doctorPublicId)
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());

  if (matches.length === 0) {
    return null;
  }

  return buildDoctorPublicProfileResponse(
    matches.map((member) => ({
      doctorPublicId: member.doctorPublicId,
      doctorName: member.doctorName,
      doctorSpecialty: member.doctorSpecialty,
      patientPublicId: member.patientPublicId,
      updatedAt: new Date(member.updatedAt),
    })),
  );
}

async function getLocalReportDetails(
  localReportStoreFilePath: string,
  reportId: string,
): Promise<Record<string, unknown> | null> {
  const store = await readLocalReportStore(localReportStoreFilePath);
  return buildLocalReportDetails(store, reportId);
}

async function analyzeLocalReport(
  localReportStoreFilePath: string,
  reportId: string,
): Promise<Record<string, unknown> | null> {
  const store = await readLocalReportStore(localReportStoreFilePath);
  const report = store.reports.find((item) => item.id === reportId);

  if (!report) {
    return null;
  }

  if (!report.rawText.trim()) {
    throw new Error("Report text is empty and cannot be analyzed.");
  }

  const analysis = analyzeHealthReport(report.rawText.slice(0, MAX_ANALYZE_TEXT_CHARS));
  const now = new Date().toISOString();

  report.aiSummary = analysis.summary;
  report.status = "analyzed";
  report.updatedAt = now;

  store.insights = store.insights.filter((item) => item.reportId !== reportId);
  store.faqs = store.faqs.filter((item) => item.reportId !== reportId);
  store.recommendations = store.recommendations.filter((item) => item.reportId !== reportId);

  store.insights.push(
    ...analysis.insights.map((item) => ({
      id: randomUUID(),
      reportId,
      type: item.type,
      label: item.label,
      value: item.value,
      status: item.status,
    })),
  );

  store.faqs.push(
    ...analysis.faqs.map((item) => ({
      id: randomUUID(),
      reportId,
      question: item.question,
      answer: item.answer,
    })),
  );

  store.recommendations.push(
    ...analysis.recommendations.map((item) => ({
      id: randomUUID(),
      reportId,
      category: item.category,
      text: item.text,
    })),
  );

  await writeLocalReportStore(localReportStoreFilePath, store);
  return buildLocalReportDetails(store, reportId);
}

async function listLocalReports(localReportStoreFilePath: string): Promise<Array<Record<string, unknown>>> {
  const store = await readLocalReportStore(localReportStoreFilePath);

  const reportsWithCounts: Array<SerializedReport & {
    counts: { insights: number; faqs: number; recommendations: number };
  }> = store.reports.map((report) => ({
    ...serializeLocalReport(report),
    counts: {
      insights: store.insights.filter((item) => item.reportId === report.id).length,
      faqs: store.faqs.filter((item) => item.reportId === report.id).length,
      recommendations: store.recommendations.filter((item) => item.reportId === report.id).length,
    },
  }));

  return reportsWithCounts.sort((left, right) => {
      const leftTime = new Date(String(left.createdAt)).getTime();
      const rightTime = new Date(String(right.createdAt)).getTime();
      return rightTime - leftTime;
    });
}

function buildLocalReportDetails(
  store: LocalReportStore,
  reportId: string,
): Record<string, unknown> | null {
  const report = store.reports.find((item) => item.id === reportId);
  if (!report) {
    return null;
  }

  return {
    report: serializeLocalReport(report),
    insights: store.insights
      .filter((item) => item.reportId === reportId)
      .sort((left, right) => left.label.localeCompare(right.label)),
    faqs: store.faqs
      .filter((item) => item.reportId === reportId)
      .sort((left, right) => left.question.localeCompare(right.question)),
    recommendations: store.recommendations
      .filter((item) => item.reportId === reportId)
      .sort((left, right) => left.category.localeCompare(right.category)),
  };
}

function mergeReportLists(
  primary: Array<Record<string, unknown>>,
  secondary: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  const merged = new Map<string, Record<string, unknown>>();

  [...primary, ...secondary].forEach((report) => {
    const id = typeof report.id === "string" ? report.id : "";
    if (id) {
      merged.set(id, report);
    }
  });

  return [...merged.values()].sort((left, right) => {
    const leftTime = new Date(String(left.createdAt)).getTime();
    const rightTime = new Date(String(right.createdAt)).getTime();
    return rightTime - leftTime;
  });
}

async function supportsReportFilePathColumn(): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Report'
          AND column_name = 'filePath'
      ) AS "exists"
    `;

    return Boolean(result[0]?.exists);
  } catch (error) {
    console.warn("[api/reports] Could not inspect Report.filePath column support:", error);
    return false;
  }
}

function getReportScalarSelect(hasReportFilePathColumn: boolean) {
  return {
    id: true,
    title: true,
    fileName: true,
    fileType: true,
    ...(hasReportFilePathColumn ? { filePath: true } : {}),
    rawText: true,
    aiSummary: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  };
}

function buildReportCreateData(
  payload: ReturnType<typeof validateUploadReportBody>,
  hasReportFilePathColumn: boolean,
) {
  return {
    title: payload.title,
    fileName: payload.fileName,
    fileType: payload.fileType,
    ...(hasReportFilePathColumn ? { filePath: payload.filePath } : {}),
    rawText: payload.rawText,
    status: "uploaded",
  };
}

function serializeReport(report: ReportScalarRecord): SerializedReport {
  return {
    id: report.id,
    title: report.title,
    fileName: report.fileName,
    fileType: report.fileType,
    filePath: report.filePath ?? null,
    rawText: report.rawText,
    aiSummary: report.aiSummary,
    status: report.status,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
  };
}

function serializeLocalReport(report: LocalReportRecord): SerializedReport {
  return {
    id: report.id,
    title: report.title,
    fileName: report.fileName,
    fileType: report.fileType,
    filePath: report.filePath ?? null,
    rawText: report.rawText,
    aiSummary: report.aiSummary,
    status: report.status,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

function serializeDoctorTeamMember(record: DoctorTeamDbRecord): LocalDoctorTeamMemberRecord {
  return {
    id: record.id,
    patientPublicId: record.patientPublicId,
    doctorPublicId: record.doctorPublicId,
    doctorName: record.doctorName,
    doctorSpecialty: record.doctorSpecialty,
    notes: record.notes,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function buildDoctorPublicProfileResponse(members: DoctorTeamPublicSource[]): Record<string, unknown> {
  const connectedPatientIds = Array.from(new Set(members.map((member) => member.patientPublicId))).sort();
  const doctorName = members.find((member) => member.doctorName)?.doctorName ?? null;
  const doctorSpecialty = members.find((member) => member.doctorSpecialty)?.doctorSpecialty ?? null;
  const lastUpdatedAt = members
    .map((member) => member.updatedAt.getTime())
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => right - left)[0];

  return {
    doctorPublicId: members[0]?.doctorPublicId ?? "",
    doctorName,
    doctorSpecialty,
    connectedPatients: connectedPatientIds.length,
    relatedPatientPublicIds: connectedPatientIds,
    lastUpdatedAt: typeof lastUpdatedAt === "number" ? new Date(lastUpdatedAt).toISOString() : null,
  };
}

function getDoctorTeamDelegate(): {
  findMany: (args: unknown) => Promise<unknown>;
  findFirst: (args: unknown) => Promise<unknown>;
  create: (args: unknown) => Promise<unknown>;
  deleteMany: (args: unknown) => Promise<unknown>;
} {
  const delegate = (prisma as unknown as Record<string, unknown>).doctorTeamMember;
  if (!delegate || typeof delegate !== "object") {
    throw new Error('Prisma client delegate "prisma.doctorTeamMember" is missing.');
  }

  const typedDelegate = delegate as {
    findMany?: (args: unknown) => Promise<unknown>;
    findFirst?: (args: unknown) => Promise<unknown>;
    create?: (args: unknown) => Promise<unknown>;
    deleteMany?: (args: unknown) => Promise<unknown>;
  };

  if (!typedDelegate.findMany || !typedDelegate.findFirst || !typedDelegate.create || !typedDelegate.deleteMany) {
    throw new Error('Prisma client delegate "prisma.doctorTeamMember" is missing required methods.');
  }

  return {
    findMany: typedDelegate.findMany.bind(delegate),
    findFirst: typedDelegate.findFirst.bind(delegate),
    create: typedDelegate.create.bind(delegate),
    deleteMany: typedDelegate.deleteMany.bind(delegate),
  };
}

function isDuplicateDoctorTeamError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return (
    message.includes("unique constraint") &&
    message.includes("doctor")
  );
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function getRequestHeader(req: IncomingMessage, name: string): string {
  const value = req.headers[name];
  if (Array.isArray(value)) {
    return value[0] ? value[0].trim() : "";
  }
  return typeof value === "string" ? value.trim() : "";
}

export default defineConfig({
  plugins: [react(), tailwindcss(), reportApiPlugin(path.resolve(__dirname, "."))],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  server: {
    cors: true,
    hmr: process.env.DISABLE_HMR !== "true",
  },
  preview: {
    cors: true,
  },
});
