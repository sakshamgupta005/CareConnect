import { validateContactSubmissionBody, type ContactSubmissionInput } from "./contactSubmission";

type ContactSubmissionResponse = {
  id: string;
  createdAt: string;
};

export type ContactSubmissionRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: string;
};

export async function submitContactForm(input: ContactSubmissionInput): Promise<ContactSubmissionResponse> {
  const payload = validateContactSubmissionBody(input);

  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let parsed: unknown = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const message =
      parsed && typeof parsed === "object" && "error" in parsed && typeof parsed.error === "string"
        ? parsed.error
        : "Could not submit contact form.";
    throw new Error(message);
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("id" in parsed) ||
    !("createdAt" in parsed) ||
    typeof parsed.id !== "string" ||
    typeof parsed.createdAt !== "string"
  ) {
    throw new Error("Invalid contact response from server.");
  }

  return {
    id: parsed.id,
    createdAt: parsed.createdAt,
  };
}

export async function listContactSubmissions(): Promise<ContactSubmissionRecord[]> {
  const response = await fetch("/api/contact");
  const raw = await response.text();
  let parsed: unknown = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const message =
      parsed && typeof parsed === "object" && "error" in parsed && typeof parsed.error === "string"
        ? parsed.error
        : "Could not load contact submissions.";
    throw new Error(message);
  }

  if (!Array.isArray(parsed) || !parsed.every(isContactSubmissionRecord)) {
    throw new Error("Invalid contact submissions response from server.");
  }

  return parsed;
}

function isContactSubmissionRecord(value: unknown): value is ContactSubmissionRecord {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.email === "string" &&
    (typeof item.phone === "string" || item.phone === null) &&
    typeof item.message === "string" &&
    typeof item.createdAt === "string"
  );
}
