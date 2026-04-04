import { Router } from "express";
import { admin, db } from "../config/firebase.js";
import { askMedicalQuestion } from "../services/aiService.js";

const aiRoutes = Router();

aiRoutes.post("/ask", async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const patientId = typeof body.patientId === "string" ? body.patientId.trim() : "";

    if (!question) {
      return res.status(400).json({
        error: "question is required.",
      });
    }

    const answer = await askMedicalQuestion(question);

    // Keep a history of AI chat interactions in Firestore for traceability.
    await db.collection("ai_chat_logs").add({
      patientId: patientId || null,
      question,
      answer,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("[POST /ai/ask] Failed:", error);
    const message = error instanceof Error ? error.message : "Could not process AI question.";
    return res.status(500).json({ error: message });
  }
});

export default aiRoutes;
