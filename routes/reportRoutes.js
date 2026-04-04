import { Router } from "express";
import { admin, db } from "../config/firebase.js";
import { summarizeReport } from "../services/aiService.js";
import { sendWhatsAppMessage } from "../services/whatsappService.js";

const reportRoutes = Router();
const MAX_REPORT_TEXT_CHARS = 120000;

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateUploadPayload(rawBody) {
  const body = rawBody && typeof rawBody === "object" ? rawBody : {};

  // Support both extractedText and rawText so old clients keep working.
  const extractedText = cleanText(body.extractedText ?? body.rawText);
  const patientId = cleanText(body.patientId);
  const phone = cleanText(body.phone);
  const title = cleanText(body.title);
  const fileName = cleanText(body.fileName);

  if (!patientId) {
    throw new Error("patientId is required.");
  }

  if (!phone) {
    throw new Error("phone is required.");
  }

  if (!extractedText) {
    throw new Error("extractedText is required.");
  }

  return {
    patientId,
    phone,
    title: title || "Medical Report",
    fileName: fileName || null,
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
      extractedText: payload.extractedText,
      aiSummary,
      status: "analyzed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const reportRef = await db.collection("reports").add(reportDoc);

    // 3) Send summary to WhatsApp (mock) and create whatsapp_logs entry.
    const whatsappResult = await sendWhatsAppMessage(payload.phone, aiSummary, payload.patientId);

    // 4) Save WhatsApp status on report for easy tracking.
    await reportRef.update({
      whatsappStatus: whatsappResult.status,
      whatsappLogId: whatsappResult.logId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      message: "Report processed successfully.",
      reportId: reportRef.id,
      aiSummary,
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
