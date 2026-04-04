const DOCTOR_PUBLIC_ID_PREFIX = "DOC-";
const PUBLIC_ID_TOKEN_REGEX = /[^A-Za-z0-9_-]/g;

function normalizePublicToken(value: string): string {
  return value.replace(PUBLIC_ID_TOKEN_REGEX, "").toUpperCase();
}

export function normalizePatientPublicId(value: string): string {
  return normalizePublicToken(value.trim());
}

export function normalizeDoctorPublicIdInput(value: string): string {
  const trimmed = value.trim().toUpperCase();
  const withoutPrefix = trimmed.startsWith(DOCTOR_PUBLIC_ID_PREFIX)
    ? trimmed.slice(DOCTOR_PUBLIC_ID_PREFIX.length)
    : trimmed;
  const normalized = normalizePublicToken(withoutPrefix);

  if (!normalized) {
    return "";
  }

  return `${DOCTOR_PUBLIC_ID_PREFIX}${normalized}`;
}

export function buildDoctorPublicIdFromUsername(username: string): string {
  return normalizeDoctorPublicIdInput(username);
}
