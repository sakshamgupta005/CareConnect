import { admin, db } from "../config/firebase.js";

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export async function sendWhatsAppMessage(phone, message, patientId = "") {
  const normalizedPhone = normalizeString(phone);
  const normalizedMessage = normalizeString(message);
  const normalizedPatientId = normalizeString(patientId);

  if (!normalizedPhone) {
    throw new Error("Phone is required to send WhatsApp summary.");
  }

  if (!normalizedMessage) {
    throw new Error("Message is required to send WhatsApp summary.");
  }

  try {
    // Mock sender: replace this with real WhatsApp API integration later.
    console.log(`[WhatsApp Mock] Sending to ${normalizedPhone}: ${normalizedMessage}`);

    const logDoc = {
      patientId: normalizedPatientId || null,
      phone: normalizedPhone,
      message: normalizedMessage,
      status: "sent",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    const logRef = await db.collection("whatsapp_logs").add(logDoc);

    return {
      status: "sent",
      logId: logRef.id,
    };
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Unknown WhatsApp error.";
    throw new Error(`WhatsApp send failed: ${messageText}`);
  }
}
