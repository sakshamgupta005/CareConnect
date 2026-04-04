import Groq from "groq-sdk";

const GROQ_MODEL = "llama3-70b-8192";
let cachedGroqClient = null;

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error("Missing GROQ_API_KEY. Add it to your .env file before starting the server.");
  }

  if (!cachedGroqClient) {
    cachedGroqClient = new Groq({ apiKey: apiKey.trim() });
  }

  return cachedGroqClient;
}

async function runGroqPrompt(systemPrompt, userPrompt) {
  try {
    const client = getGroqClient();

    const response = await client.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("Groq returned an empty response.");
    }

    return content.trim();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Groq API error.";
    throw new Error(`Groq request failed: ${message}`);
  }
}

export async function summarizeReport(text) {
  const reportText = typeof text === "string" ? text.trim() : "";
  if (!reportText) {
    throw new Error("Report text is required for summarization.");
  }

  const systemPrompt =
    "You are a healthcare assistant. Write clear and simple medical summaries for patients. Keep it educational and avoid diagnosis claims.";

  const userPrompt = [
    "Summarize this medical report for a patient in plain English.",
    "Requirements:",
    "- Keep it short and easy to understand.",
    "- Highlight key findings and what the patient should discuss with a doctor.",
    "- Include a short safety note that this is not a medical diagnosis.",
    "",
    "Medical report text:",
    reportText,
  ].join("\n");

  return runGroqPrompt(systemPrompt, userPrompt);
}

export async function askMedicalQuestion(question) {
  const promptQuestion = typeof question === "string" ? question.trim() : "";
  if (!promptQuestion) {
    throw new Error("Question is required.");
  }

  const systemPrompt =
    "You are a patient-friendly healthcare assistant. Give safe, concise, educational answers and remind users to consult a licensed doctor for diagnosis or treatment.";

  const userPrompt = [
    "Answer the patient question in simple language.",
    "Keep the answer practical, calm, and short.",
    "",
    `Question: ${promptQuestion}`,
  ].join("\n");

  return runGroqPrompt(systemPrompt, userPrompt);
}
