import "dotenv/config";
import makeWASocket, { Browsers, DisconnectReason, useMultiFileAuthState } from "baileys";
import qrcode from "qrcode-terminal";

const SITE_URL = (process.env.CARECONNECT_SITE_URL || "https://CareConnect.com").trim();
const AUTH_FOLDER = (process.env.WHATSAPP_AUTH_FOLDER || ".data/baileys-auth").trim();

const START_KEYWORDS = ["start", "hi", "hello", "help", "menu", "open whatsapp help"];
const STOP_KEYWORDS = ["stop", "exit", "cancel", "reset"];

const sessions = new Map();

function normalize(text) {
  return typeof text === "string" ? text.trim() : "";
}

function toLower(text) {
  return normalize(text).toLowerCase();
}

function extractMessageText(message) {
  if (!message) return "";

  if (message.conversation) return message.conversation;
  if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
  if (message.imageMessage?.caption) return message.imageMessage.caption;
  if (message.videoMessage?.caption) return message.videoMessage.caption;
  if (message.documentMessage?.caption) return message.documentMessage.caption;

  const buttonReply = message.buttonsResponseMessage?.selectedButtonId;
  if (buttonReply) return buttonReply;

  const listReply = message.listResponseMessage?.singleSelectReply?.selectedRowId;
  if (listReply) return listReply;

  return "";
}

function matchesKeyword(messageText, keywords) {
  const value = toLower(messageText);
  return keywords.some((keyword) => value.includes(keyword));
}

function detectFaqReply(messageText) {
  const value = toLower(messageText);

  const faqRules = [
    {
      keywords: ["what is careconnect", "about careconnect", "what can careconnect do", "what can this website do"],
      answer:
        "CareConnect helps patients understand reports in simple language, track key findings, and prepare doctor follow-up questions calmly.",
    },
    {
      keywords: ["upload", "report", "pdf", "how to add report"],
      answer:
        "To upload your report: open CareConnect, go to Contact/Patient flow, upload PDF or paste report text, then run analysis for guided explanations.",
    },
    {
      keywords: ["doctor", "care team", "consult", "appointment"],
      answer:
        "CareConnect can prepare focused questions for your doctor so your consultation is clear and efficient. It supports, but does not replace, medical advice.",
    },
    {
      keywords: ["safe", "private", "security", "data"],
      answer:
        "Please avoid sharing extremely sensitive data in chat. For full workflow and report tracking, use the CareConnect website where your report flow is organized.",
    },
    {
      keywords: ["symptom", "urgent", "emergency", "severe"],
      answer:
        "If symptoms are severe or urgent, please contact local emergency services or your doctor immediately. I can still help prepare report questions.",
    },
  ];

  const matched = faqRules.find((rule) => rule.keywords.some((keyword) => value.includes(keyword)));
  return matched?.answer || "";
}

function createFreshSession(pushName) {
  return {
    step: "name",
    profile: {
      name: normalize(pushName) || "",
      age: "",
      city: "",
      concern: "",
    },
    updatedAt: Date.now(),
  };
}

function sanitizeAge(input) {
  const digits = normalize(input).match(/\d{1,3}/)?.[0] || "";
  if (!digits) return "";
  const value = Number(digits);
  if (Number.isNaN(value) || value <= 0 || value > 120) return "";
  return String(value);
}

function nextQuestion(session) {
  if (session.step === "name") {
    return "Please share your full name.";
  }

  if (session.step === "age") {
    return "Thank you. Please share your age in years.";
  }

  if (session.step === "city") {
    return "Great. Which city are you currently in?";
  }

  if (session.step === "concern") {
    return "What is your main health concern right now? You can answer in one short sentence.";
  }

  return "Reply MENU anytime if you want to restart support steps.";
}

function buildFinalSummary(session) {
  const lines = [
    "Thank you. Your basic patient details are noted:",
    `- Name: ${session.profile.name}`,
    `- Age: ${session.profile.age}`,
    `- City: ${session.profile.city}`,
    `- Main concern: ${session.profile.concern}`,
    "",
    "What CareConnect can do for you:",
    "1. Explain your report in simple language",
    "2. Highlight important findings",
    "3. Prepare calm, focused doctor questions",
    "4. Help track report-based guidance over time",
    "",
    `Continue your full guided flow here: ${SITE_URL}`,
    "You can also ask me basic questions here anytime.",
  ];

  return lines.join("\n");
}

function introMessage(pushName) {
  const name = normalize(pushName) || "there";
  return [
    `Hi ${name}, I am the CareConnect WhatsApp Assistant.`,
    "I will ask a few simple details so we can guide you clearly and calmly.",
    "Reply START to begin.",
    `Website: ${SITE_URL}`,
  ].join("\n");
}

async function sendText(sock, jid, text) {
  await sock.sendMessage(jid, { text });
}

async function handleConversation(sock, messageItem) {
  const jid = messageItem?.key?.remoteJid;
  if (!jid || jid === "status@broadcast" || jid.endsWith("@g.us")) {
    return;
  }

  if (messageItem.key?.fromMe) {
    return;
  }

  const messageText = normalize(extractMessageText(messageItem.message));
  if (!messageText) {
    return;
  }

  const pushName = normalize(messageItem.pushName);
  const lowerMessage = toLower(messageText);
  const currentSession = sessions.get(jid);

  if (matchesKeyword(lowerMessage, STOP_KEYWORDS)) {
    sessions.delete(jid);
    await sendText(
      sock,
      jid,
      [
        "No problem. I have reset your support flow.",
        "When you are ready, reply START and I will guide you again.",
        `CareConnect website: ${SITE_URL}`,
      ].join("\n"),
    );
    return;
  }

  const faqReply = detectFaqReply(lowerMessage);

  if (!currentSession && !matchesKeyword(lowerMessage, START_KEYWORDS)) {
    if (faqReply) {
      await sendText(sock, jid, `${faqReply}\n\nAsk anything else, or reply START to begin patient intake support.`);
      return;
    }

    await sendText(sock, jid, introMessage(pushName));
    return;
  }

  if (!currentSession && matchesKeyword(lowerMessage, START_KEYWORDS)) {
    const newSession = createFreshSession(pushName);
    sessions.set(jid, newSession);

    await sendText(
      sock,
      jid,
      [
        "Great choice. Let us begin your quick patient support intake.",
        "I will ask 4 short questions.",
        nextQuestion(newSession),
      ].join("\n"),
    );
    return;
  }

  const session = currentSession || createFreshSession(pushName);
  session.updatedAt = Date.now();

  if (faqReply && matchesKeyword(lowerMessage, ["?", "what", "how", "when", "can", "do"])) {
    await sendText(sock, jid, `${faqReply}\n\nWhen ready, continue: ${nextQuestion(session)}`);
    sessions.set(jid, session);
    return;
  }

  if (session.step === "name") {
    if (messageText.length < 2) {
      await sendText(sock, jid, "I could not read the name clearly. Please share your full name.");
      return;
    }

    session.profile.name = messageText;
    session.step = "age";
    sessions.set(jid, session);
    await sendText(sock, jid, nextQuestion(session));
    return;
  }

  if (session.step === "age") {
    const age = sanitizeAge(messageText);
    if (!age) {
      await sendText(sock, jid, "Please share age as a number in years (for example: 42).");
      return;
    }

    session.profile.age = age;
    session.step = "city";
    sessions.set(jid, session);
    await sendText(sock, jid, nextQuestion(session));
    return;
  }

  if (session.step === "city") {
    if (messageText.length < 2) {
      await sendText(sock, jid, "Please share your city name so I can continue.");
      return;
    }

    session.profile.city = messageText;
    session.step = "concern";
    sessions.set(jid, session);
    await sendText(sock, jid, nextQuestion(session));
    return;
  }

  if (session.step === "concern") {
    session.profile.concern = messageText;
    session.step = "done";
    sessions.set(jid, session);

    await sendText(sock, jid, buildFinalSummary(session));
    return;
  }

  await sendText(
    sock,
    jid,
    [
      "I am here to help.",
      "Ask a basic question like 'What can CareConnect do?' or reply RESET to start intake again.",
      `Website: ${SITE_URL}`,
    ].join("\n"),
  );
}

async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

  const sock = makeWASocket({
    auth: state,
    browser: Browsers.ubuntu("CareConnect WhatsApp Assistant"),
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("[whatsapp-bot] Scan this QR code with your WhatsApp account:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("[whatsapp-bot] Connected and ready.");
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const canReconnect = statusCode !== DisconnectReason.loggedOut;

      if (canReconnect) {
        console.log("[whatsapp-bot] Connection closed. Reconnecting...");
        await startWhatsAppBot();
      } else {
        console.log("[whatsapp-bot] Logged out. Delete auth folder and pair again.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ type, messages }) => {
    if (type !== "notify") {
      return;
    }

    for (const messageItem of messages) {
      try {
        await handleConversation(sock, messageItem);
      } catch (error) {
        console.error("[whatsapp-bot] Message handling failed:", error);
      }
    }
  });
}

startWhatsAppBot().catch((error) => {
  console.error("[whatsapp-bot] Startup failed:", error);
  process.exitCode = 1;
});
