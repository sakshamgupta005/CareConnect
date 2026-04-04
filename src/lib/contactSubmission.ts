export type ContactSubmissionInput = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactSubmissionBody(body: unknown): ContactSubmissionInput {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body.");
  }

  const source = body as Record<string, unknown>;

  const name = typeof source.name === "string" ? source.name.trim() : "";
  const email = typeof source.email === "string" ? source.email.trim().toLowerCase() : "";
  const phoneRaw = typeof source.phone === "string" ? source.phone.trim() : "";
  const message = typeof source.message === "string" ? source.message.trim() : "";

  if (!name) {
    throw new Error("Name is required.");
  }

  if (name.length < 2) {
    throw new Error("Name is too short.");
  }

  if (!email) {
    throw new Error("Email is required.");
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("Email format is invalid.");
  }

  if (!message) {
    throw new Error("Message is required.");
  }

  const phone = phoneRaw ? phoneRaw.slice(0, 40) : undefined;

  return {
    name: name.slice(0, 120),
    email: email.slice(0, 160),
    phone,
    message: message.slice(0, 2500),
  };
}
