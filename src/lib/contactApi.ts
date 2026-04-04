import { fetchJsonWithApiFallback } from "./apiClient";
import { validateContactSubmissionBody, type ContactSubmissionInput } from "./contactSubmission";
import { loadAuthSession } from "./auth";

type ContactSubmissionResponse = {
  id: string;
  createdAt: string;
};

export type ContactSubmissionRecord = {
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

export async function submitContactForm(input: ContactSubmissionInput): Promise<ContactSubmissionResponse> {
  const payload = validateContactSubmissionBody(input);

  const { response, payload: parsed } = await fetchJsonWithApiFallback("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

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
  const session = loadAuthSession();
  const { response, payload: parsed } = await fetchJsonWithApiFallback("/api/contact", {
    headers: session
      ? {
          "x-careconnect-role": session.role,
        }
      : undefined,
  });

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

export async function deleteContactSubmission(submissionId: string): Promise<void> {
  const id = typeof submissionId === "string" ? submissionId.trim() : "";
  if (!id) {
    throw new Error("Missing submission id.");
  }

  const session = loadAuthSession();
  const { response, payload: parsed } = await fetchJsonWithApiFallback(`/api/contact?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: session
      ? {
          "x-careconnect-role": session.role,
        }
      : undefined,
  });

  if (!response.ok) {
    const message =
      parsed && typeof parsed === "object" && "error" in parsed && typeof parsed.error === "string"
        ? parsed.error
        : "Could not delete contact submission.";
    throw new Error(message);
  }
}

function isContactSubmissionRecord(value: unknown): value is ContactSubmissionRecord {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.email === "string" &&
    (typeof item.phone === "string" || item.phone === null) &&
    (typeof item.role === "string" || item.role === null) &&
    (typeof item.age === "string" || item.age === null) &&
    (typeof item.gender === "string" || item.gender === null) &&
    (typeof item.bloodGroup === "string" || item.bloodGroup === null) &&
    (typeof item.reportTitle === "string" || item.reportTitle === null) &&
    (typeof item.reportFileName === "string" || item.reportFileName === null) &&
    (typeof item.reportFileType === "string" || item.reportFileType === null) &&
    (typeof item.reportFilePath === "string" || item.reportFilePath === null) &&
    (typeof item.reportRawText === "string" || item.reportRawText === null) &&
    (typeof item.linkedReportId === "string" || item.linkedReportId === null) &&
    (item.linkedReportStatus === "uploaded" || item.linkedReportStatus === "analyzed" || item.linkedReportStatus === null) &&
    typeof item.message === "string" &&
    typeof item.createdAt === "string"
  );
}
