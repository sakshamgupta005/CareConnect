import { Router } from "express";
import { admin, db } from "../config/firebase.js";
import { summarizeReport } from "../services/aiService.js";
import { sendWhatsAppMessage } from "../services/whatsappService.js";

const reportRoutes = Router();
const MAX_REPORT_TEXT_CHARS = 120000;

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createFallbackPatientId() {
  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `patient-${timePart}-${randomPart}`;
}

function validateUploadPayload(rawBody) {
  const body = rawBody && typeof rawBody === "object" ? rawBody : {};

  // Support both extractedText and rawText so old clients keep working.
  const extractedText = cleanText(body.extractedText ?? body.rawText);
  const patientId = cleanText(body.patientId) || createFallbackPatientId();
  const phone = cleanText(body.phone);
  const title = cleanText(body.title);
  const fileName = cleanText(body.fileName);
  const fileType = cleanText(body.fileType);
  const filePath = cleanText(body.filePath);

  if (!extractedText) {
    throw new Error("extractedText is required.");
  }

  return {
    patientId,
    phone: phone || null,
    title: title || "Medical Report",
    fileName: fileName || "report.txt",
    fileType: fileType || "text/plain",
    filePath: filePath || null,
    extractedText: extractedText.slice(0, MAX_REPORT_TEXT_CHARS),
  };
}

async function handleReportUpload(req, res) {
  try {
    const payload = validateUploadPayload(req.body);

    // 1) Generate AI summary using Groq.
    const aiSummary = await summarizeReport(payload.extractedText);

    // 2) Save report + summary to Firestore.
    const reportDoc = {
      patientId: payload.patientId,
      phone: payload.phone,
      title: payload.title,
      fileName: payload.fileName,
      fileType: payload.fileType,
      filePath: payload.filePath,
      extractedText: payload.extractedText,
      aiSummary,
      status: "analyzed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const reportRef = await db.collection("reports").add(reportDoc);

    // 3) Send summary to WhatsApp (mock) and create whatsapp_logs entry.
    const whatsappResult = payload.phone
      ? await sendWhatsAppMessage(payload.phone, aiSummary, payload.patientId)
      : {
          status: "skipped",
          reason: "phone was not provided",
          logId: null,
        };

    // 4) Save WhatsApp status on report for easy tracking.
    await reportRef.update({
      whatsappStatus: whatsappResult.status,
      whatsappLogId: whatsappResult.logId || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const createdAt = new Date().toISOString();

    return res.status(201).json({
      id: reportRef.id,
      title: payload.title,
      fileName: payload.fileName,
      fileType: payload.fileType,
      filePath: payload.filePath,
      rawText: payload.extractedText,
      aiSummary,
      status: "analyzed",
      createdAt,
      updatedAt: createdAt,
      message: "Report processed successfully.",
      reportId: reportRef.id,
      whatsapp: whatsappResult,
    });
  } catch (error) {
    console.error("[POST /reports/upload] Failed:", error);
    const message = error instanceof Error ? error.message : "Could not process report upload.";
    return res.status(500).json({ error: message });
  }
}

// Primary upload endpoint.
reportRoutes.post("/upload", handleReportUpload);

// Compatibility alias if your previous API used /upload-report.
reportRoutes.post("/upload-report", handleReportUpload);

export default reportRoutes;
