type ReportProfileSource = {
  title: string;
  rawText: string;
};

export type PatientProfile = {
  displayName: string;
  name: string | null;
  age: string | null;
  gender: string | null;
  bloodType: string | null;
  completionCount: number;
};

const UNKNOWN_PROFILE_LABEL = "Patient profile";

export function extractPatientProfile(source: ReportProfileSource): PatientProfile {
  const rawText = typeof source.rawText === "string" ? source.rawText : "";
  const title = typeof source.title === "string" ? source.title.trim() : "";

  const name = extractPatientName(rawText);
  const age = extractPatientAge(rawText);
  const gender = extractPatientGender(rawText);
  const bloodType = extractPatientBloodType(rawText);
  const completionCount = [age, gender, bloodType].filter(Boolean).length;

  return {
    displayName: name || title || UNKNOWN_PROFILE_LABEL,
    name,
    age,
    gender,
    bloodType,
    completionCount,
  };
}

export function hasDetectedPatientProfile(profile: PatientProfile): boolean {
  return profile.completionCount > 0 || Boolean(profile.name);
}

function extractPatientName(text: string): string | null {
  const match =
    text.match(/\bpatient\s*name\s*[:\-]?\s*([A-Za-z][A-Za-z .'-]{1,60})/i) ||
    text.match(/(?:^|\n)\s*name\s*[:\-]?\s*([A-Za-z][A-Za-z .'-]{1,60})/i);
  const value = match?.[1]?.trim().replace(/\s+/g, " ");
  return value || null;
}

function extractPatientAge(text: string): string | null {
  const ageMatch =
    text.match(/\bage\s*[:\-]?\s*(\d{1,3})\s*(?:years?|yrs?)?\b/i) ||
    text.match(/\b(\d{1,3})\s*(?:years?|yrs?)\s*old\b/i);
  const age = ageMatch?.[1]?.trim();
  return age ? `${age} years` : null;
}

function extractPatientGender(text: string): string | null {
  const match = text.match(
    /\b(?:gender|sex)\s*[:\-]?\s*(male|female|man|woman|boy|girl|m|f|other|non-binary|nonbinary)\b/i,
  );
  const normalized = match?.[1]?.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (normalized === "m" || normalized === "male" || normalized === "man" || normalized === "boy") {
    return "Male";
  }

  if (normalized === "f" || normalized === "female" || normalized === "woman" || normalized === "girl") {
    return "Female";
  }

  if (normalized === "non-binary" || normalized === "nonbinary") {
    return "Non-binary";
  }

  return "Other";
}

function extractPatientBloodType(text: string): string | null {
  const directMatch = text.match(
    /\b(?:blood\s*(?:group|type)|bloodgroup|bg)\s*[:\-]?\s*(ab|a|b|o)\s*(positive|negative|\+|-)\b/i,
  );
  const contextualMatch = text.match(
    /\b(?:patient|report|lab|sample).{0,30}\b(ab|a|b|o)\s*(positive|negative|\+|-)\b/i,
  );
  const looseMatch = text.match(/\b(ab|a|b|o)\s*(positive|negative)\b/i);
  const match = directMatch || contextualMatch || looseMatch;

  if (!match) {
    return null;
  }

  const group = match[1]?.toUpperCase();
  const sign = normalizeBloodSign(match[2] || "");
  return group && sign ? `${group}${sign}` : null;
}

function normalizeBloodSign(rawValue: string): string {
  const value = rawValue.trim().toLowerCase();
  if (value === "+" || value === "positive") return "+";
  if (value === "-" || value === "negative") return "-";
  return "";
}
