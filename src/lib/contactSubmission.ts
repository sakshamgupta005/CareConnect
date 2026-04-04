export type ContactSubmissionInput = {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  age?: string;
  gender?: string;
  bloodGroup?: string;
  reportTitle?: string;
  reportFileName?: string;
  reportFileType?: string;
  reportFilePath?: string;
  reportRawText?: string;
  linkedReportId?: string;
  linkedReportStatus?: "uploaded" | "analyzed";
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
  const roleRaw = typeof source.role === "string" ? source.role.trim() : "";
  const ageRaw = typeof source.age === "string" ? source.age.trim() : "";
  const genderRaw = typeof source.gender === "string" ? source.gender.trim() : "";
  const bloodGroupRaw = typeof source.bloodGroup === "string" ? source.bloodGroup.trim().toUpperCase() : "";
  const reportTitleRaw = typeof source.reportTitle === "string" ? source.reportTitle.trim() : "";
  const reportFileNameRaw = typeof source.reportFileName === "string" ? source.reportFileName.trim() : "";
  const reportFileTypeRaw = typeof source.reportFileType === "string" ? source.reportFileType.trim() : "";
  const reportFilePathRaw = typeof source.reportFilePath === "string" ? source.reportFilePath.trim() : "";
  const reportRawTextRaw = typeof source.reportRawText === "string" ? source.reportRawText.trim() : "";
  const linkedReportIdRaw = typeof source.linkedReportId === "string" ? source.linkedReportId.trim() : "";
  const message = typeof source.message === "string" ? source.message.trim() : "";
  const linkedReportStatusRaw =
    source.linkedReportStatus === "uploaded" || source.linkedReportStatus === "analyzed"
      ? source.linkedReportStatus
      : undefined;

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
  const role = roleRaw ? roleRaw.slice(0, 120) : undefined;
  const age = ageRaw ? ageRaw.slice(0, 40) : undefined;
  const gender = genderRaw ? genderRaw.slice(0, 40) : undefined;
  const bloodGroup = bloodGroupRaw ? bloodGroupRaw.slice(0, 12) : undefined;
  const reportTitle = reportTitleRaw ? reportTitleRaw.slice(0, 200) : undefined;
  const reportFileName = reportFileNameRaw ? reportFileNameRaw.slice(0, 200) : undefined;
  const reportFileType = reportFileTypeRaw ? reportFileTypeRaw.slice(0, 80) : undefined;
  const reportFilePath = reportFilePathRaw ? reportFilePathRaw.slice(0, 500) : undefined;
  const reportRawText = reportRawTextRaw ? reportRawTextRaw.slice(0, 120000) : undefined;
  const linkedReportId = linkedReportIdRaw ? linkedReportIdRaw.slice(0, 120) : undefined;

  return {
    name: name.slice(0, 120),
    email: email.slice(0, 160),
    phone,
    role,
    age,
    gender,
    bloodGroup,
    reportTitle,
    reportFileName,
    reportFileType,
    reportFilePath,
    reportRawText,
    linkedReportId,
    linkedReportStatus: linkedReportStatusRaw,
    message: message.slice(0, 2500),
  };
}
