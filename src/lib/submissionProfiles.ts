import { type ContactSubmissionRecord } from "./contactApi";
import { extractPatientProfile, type PatientProfile } from "./patientProfile";

export type SubmissionProfileRecord = {
  submission: ContactSubmissionRecord;
  profile: PatientProfile;
  aiReadyReportText: string;
  reportTitle: string;
  summary: string;
};

export function buildSubmissionProfileRecord(submission: ContactSubmissionRecord): SubmissionProfileRecord {
  const reportTitle = submission.reportTitle?.trim() || `${submission.name} Report`;
  const aiReadyReportText = buildAiReadyReportText(submission);
  const extractedProfile = extractPatientProfile({
    title: reportTitle,
    rawText: aiReadyReportText,
  });

  const age = extractedProfile.age || normalizeAge(submission.age);
  const gender = extractedProfile.gender || normalizeGender(submission.gender);
  const bloodType = extractedProfile.bloodType || normalizeBloodGroup(submission.bloodGroup);
  const profile: PatientProfile = {
    displayName: extractedProfile.name || submission.name || extractedProfile.displayName,
    name: extractedProfile.name || submission.name || null,
    age,
    gender,
    bloodType,
    completionCount: [age, gender, bloodType].filter(Boolean).length,
  };

  const summary =
    [
      age ? `Age ${age}` : "",
      gender || "",
      bloodType ? `Blood ${bloodType}` : "",
    ]
      .filter(Boolean)
      .join(" | ") || "Profile details not detected yet";

  return {
    submission,
    profile,
    aiReadyReportText,
    reportTitle,
    summary,
  };
}

function buildAiReadyReportText(submission: ContactSubmissionRecord): string {
  const body = submission.reportRawText?.trim() || "";
  const headerLines = [
    submission.name.trim() ? `Patient Name: ${submission.name.trim()}` : "",
    normalizeAge(submission.age) ? `Age: ${normalizeAge(submission.age)}` : "",
    normalizeGender(submission.gender) ? `Gender: ${normalizeGender(submission.gender)}` : "",
    normalizeBloodGroup(submission.bloodGroup) ? `Blood Group: ${normalizeBloodGroup(submission.bloodGroup)}` : "",
  ].filter((line) => shouldIncludeHeaderLine(body, line));

  return [...headerLines, body].filter(Boolean).join("\n");
}

function shouldIncludeHeaderLine(body: string, line: string): boolean {
  if (!line) return false;

  const label = line.split(":")[0]?.trim().toLowerCase();
  if (!label) return true;

  return !body.toLowerCase().includes(`${label}:`);
}

function normalizeAge(value: string | null): string | null {
  const trimmed = value?.trim() || "";
  if (!trimmed) return null;

  return /\byears?\b/i.test(trimmed) ? trimmed : `${trimmed} years`;
}

function normalizeGender(value: string | null): string | null {
  const trimmed = value?.trim().toLowerCase() || "";
  if (!trimmed) return null;

  if (trimmed === "m" || trimmed === "male" || trimmed === "man" || trimmed === "boy") {
    return "Male";
  }

  if (trimmed === "f" || trimmed === "female" || trimmed === "woman" || trimmed === "girl") {
    return "Female";
  }

  if (trimmed === "non-binary" || trimmed === "nonbinary") {
    return "Non-binary";
  }

  return value?.trim() || null;
}

function normalizeBloodGroup(value: string | null): string | null {
  const trimmed = value?.trim().toUpperCase() || "";
  return trimmed || null;
}
