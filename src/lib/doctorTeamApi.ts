import { fetchJsonWithApiFallback } from "./apiClient";
import { normalizeDoctorPublicIdInput, normalizePatientPublicId } from "./doctorTeam";

export type DoctorTeamMemberDto = {
  id: string;
  patientPublicId: string;
  doctorPublicId: string;
  doctorName: string | null;
  doctorSpecialty: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DoctorPublicProfileDto = {
  doctorPublicId: string;
  doctorName: string | null;
  doctorSpecialty: string | null;
  connectedPatients: number;
  relatedPatientPublicIds: string[];
  lastUpdatedAt: string | null;
};

type CreateDoctorTeamMemberInput = {
  patientPublicId: string;
  doctorPublicId: string;
  doctorName?: string;
  doctorSpecialty?: string;
  notes?: string;
};

export async function listDoctorTeamMembers(patientPublicId: string): Promise<DoctorTeamMemberDto[]> {
  const normalizedPatientId = normalizePatientPublicId(patientPublicId);
  if (!normalizedPatientId) {
    throw new Error("Missing patient public id.");
  }

  const { response, payload } = await fetchJsonWithApiFallback(
    `/api/doctor-team?patientPublicId=${encodeURIComponent(normalizedPatientId)}`,
  );
  ensureHttpSuccess(response, payload, "Could not load doctor team.");

  if (!Array.isArray(payload) || !payload.every(isDoctorTeamMemberDto)) {
    throw new Error("Invalid doctor team response from server.");
  }

  return payload;
}

export async function createDoctorTeamMember(input: CreateDoctorTeamMemberInput): Promise<DoctorTeamMemberDto> {
  const normalizedPatientId = normalizePatientPublicId(input.patientPublicId);
  const normalizedDoctorId = normalizeDoctorPublicIdInput(input.doctorPublicId);
  if (!normalizedPatientId) {
    throw new Error("Missing patient public id.");
  }
  if (!normalizedDoctorId) {
    throw new Error("Missing doctor public id.");
  }

  const { response, payload } = await fetchJsonWithApiFallback("/api/doctor-team", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      patientPublicId: normalizedPatientId,
      doctorPublicId: normalizedDoctorId,
      doctorName: input.doctorName ?? "",
      doctorSpecialty: input.doctorSpecialty ?? "",
      notes: input.notes ?? "",
    }),
  });
  ensureHttpSuccess(response, payload, "Could not add doctor to team.");

  if (!isDoctorTeamMemberDto(payload)) {
    throw new Error("Invalid doctor team create response from server.");
  }

  return payload;
}

export async function deleteDoctorTeamMember(patientPublicId: string, memberId: string): Promise<void> {
  const normalizedPatientId = normalizePatientPublicId(patientPublicId);
  const normalizedMemberId = typeof memberId === "string" ? memberId.trim() : "";
  if (!normalizedPatientId) {
    throw new Error("Missing patient public id.");
  }
  if (!normalizedMemberId) {
    throw new Error("Missing doctor team member id.");
  }

  const { response, payload } = await fetchJsonWithApiFallback(
    `/api/doctor-team?patientPublicId=${encodeURIComponent(normalizedPatientId)}&id=${encodeURIComponent(normalizedMemberId)}`,
    {
      method: "DELETE",
    },
  );
  ensureHttpSuccess(response, payload, "Could not remove doctor from team.");
}

export async function getDoctorPublicProfile(doctorPublicId: string): Promise<DoctorPublicProfileDto> {
  const normalizedDoctorId = normalizeDoctorPublicIdInput(doctorPublicId);
  if (!normalizedDoctorId) {
    throw new Error("Missing doctor public id.");
  }

  const { response, payload } = await fetchJsonWithApiFallback(
    `/api/doctor-team/public/${encodeURIComponent(normalizedDoctorId)}`,
  );
  ensureHttpSuccess(response, payload, "Could not load doctor public profile.");

  if (!isDoctorPublicProfileDto(payload)) {
    throw new Error("Invalid doctor public profile response from server.");
  }

  return payload;
}

function ensureHttpSuccess(response: Response, payload: unknown, fallback: string): void {
  if (response.ok) return;

  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string" &&
    payload.error.trim()
  ) {
    throw new Error(payload.error);
  }

  throw new Error(fallback);
}

function isDoctorTeamMemberDto(value: unknown): value is DoctorTeamMemberDto {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.patientPublicId === "string" &&
    typeof item.doctorPublicId === "string" &&
    (typeof item.doctorName === "string" || item.doctorName === null) &&
    (typeof item.doctorSpecialty === "string" || item.doctorSpecialty === null) &&
    (typeof item.notes === "string" || item.notes === null) &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

function isDoctorPublicProfileDto(value: unknown): value is DoctorPublicProfileDto {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.doctorPublicId === "string" &&
    (typeof item.doctorName === "string" || item.doctorName === null) &&
    (typeof item.doctorSpecialty === "string" || item.doctorSpecialty === null) &&
    typeof item.connectedPatients === "number" &&
    Array.isArray(item.relatedPatientPublicIds) &&
    item.relatedPatientPublicIds.every((entry) => typeof entry === "string") &&
    (typeof item.lastUpdatedAt === "string" || item.lastUpdatedAt === null)
  );
}
