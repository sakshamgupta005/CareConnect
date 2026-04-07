import { Router } from "express";
import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const doctorTeamRoutes = Router();
const STORE_FILE_PATH = path.join(process.cwd(), ".data", "doctor-team-store.json");

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeToken(value) {
  return cleanText(value).replace(/[^A-Za-z0-9_-]/g, "").toUpperCase();
}

function normalizePatientPublicId(value) {
  return normalizeToken(value);
}

function normalizeDoctorPublicId(value) {
  const normalized = normalizeToken(value.replace(/^DOC-/i, ""));
  return normalized ? `DOC-${normalized}` : "";
}

function mapMemberDocToDto(doc) {
  const data = doc || {};
  return {
    id: cleanText(data.id),
    patientPublicId: cleanText(data.patientPublicId),
    doctorPublicId: cleanText(data.doctorPublicId),
    doctorName: cleanText(data.doctorName) || null,
    doctorSpecialty: cleanText(data.doctorSpecialty) || null,
    notes: cleanText(data.notes) || null,
    createdAt: cleanText(data.createdAt),
    updatedAt: cleanText(data.updatedAt),
  };
}

async function readStore() {
  try {
    const raw = await readFile(STORE_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const members = Array.isArray(parsed?.members) ? parsed.members : [];
    return { members };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return { members: [] };
    }
    throw error;
  }
}

async function writeStore(store) {
  await mkdir(path.dirname(STORE_FILE_PATH), { recursive: true });
  await writeFile(STORE_FILE_PATH, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

doctorTeamRoutes.get("/doctor-team/public/:doctorPublicId", async (req, res) => {
  try {
    const normalizedDoctorPublicId = normalizeDoctorPublicId(req.params.doctorPublicId || "");
    if (!normalizedDoctorPublicId) {
      return res.status(400).json({ error: "Missing doctor public id." });
    }

    const store = await readStore();
    const members = store.members
      .map(mapMemberDocToDto)
      .filter((item) => item.doctorPublicId === normalizedDoctorPublicId);
    const uniquePatientIds = [...new Set(members.map((item) => item.patientPublicId).filter(Boolean))];

    let doctorName = null;
    let doctorSpecialty = null;
    let lastUpdatedAt = null;
    members.forEach((item) => {
      if (!doctorName && item.doctorName) doctorName = item.doctorName;
      if (!doctorSpecialty && item.doctorSpecialty) doctorSpecialty = item.doctorSpecialty;
      if (!lastUpdatedAt || item.updatedAt > lastUpdatedAt) {
        lastUpdatedAt = item.updatedAt;
      }
    });

    return res.status(200).json({
      doctorPublicId: normalizedDoctorPublicId,
      doctorName,
      doctorSpecialty,
      connectedPatients: uniquePatientIds.length,
      relatedPatientPublicIds: uniquePatientIds.sort((a, b) => a.localeCompare(b)),
      lastUpdatedAt,
    });
  } catch (error) {
    console.error("[GET /doctor-team/public/:doctorPublicId] Failed:", error);
    const message = error instanceof Error ? error.message : "Could not load doctor public profile.";
    return res.status(500).json({ error: message });
  }
});

doctorTeamRoutes.get("/doctor-team", async (req, res) => {
  try {
    const normalizedPatientPublicId = normalizePatientPublicId(req.query.patientPublicId || "");
    if (!normalizedPatientPublicId) {
      return res.status(400).json({ error: "Missing patient public id." });
    }

    const store = await readStore();
    const members = store.members
      .map(mapMemberDocToDto)
      .filter((item) => item.patientPublicId === normalizedPatientPublicId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return res.status(200).json(members);
  } catch (error) {
    console.error("[GET /doctor-team] Failed:", error);
    const message = error instanceof Error ? error.message : "Could not load doctor team.";
    return res.status(500).json({ error: message });
  }
});

doctorTeamRoutes.post("/doctor-team", async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const normalizedPatientPublicId = normalizePatientPublicId(body.patientPublicId || "");
    const normalizedDoctorPublicId = normalizeDoctorPublicId(body.doctorPublicId || "");
    const doctorName = cleanText(body.doctorName);
    const doctorSpecialty = cleanText(body.doctorSpecialty);
    const notes = cleanText(body.notes);

    if (!normalizedPatientPublicId) {
      return res.status(400).json({ error: "Missing patient public id." });
    }
    if (!normalizedDoctorPublicId) {
      return res.status(400).json({ error: "Missing doctor public id." });
    }

    const nowIso = new Date().toISOString();
    const store = await readStore();
    const existingIndex = store.members.findIndex(
      (member) =>
        cleanText(member.patientPublicId) === normalizedPatientPublicId &&
        cleanText(member.doctorPublicId) === normalizedDoctorPublicId,
    );

    if (existingIndex >= 0) {
      const existing = mapMemberDocToDto(store.members[existingIndex]);
      const updated = {
        ...existing,
        doctorName: doctorName || null,
        doctorSpecialty: doctorSpecialty || null,
        notes: notes || null,
        updatedAt: nowIso,
      };
      store.members[existingIndex] = updated;
      await writeStore(store);
      return res.status(200).json(updated);
    }

    const created = {
      id: randomUUID(),
      patientPublicId: normalizedPatientPublicId,
      doctorPublicId: normalizedDoctorPublicId,
      doctorName: doctorName || null,
      doctorSpecialty: doctorSpecialty || null,
      notes: notes || null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    store.members.push(created);
    await writeStore(store);

    return res.status(201).json(created);
  } catch (error) {
    console.error("[POST /doctor-team] Failed:", error);
    const message = error instanceof Error ? error.message : "Could not add doctor to team.";
    return res.status(500).json({ error: message });
  }
});

doctorTeamRoutes.delete("/doctor-team", async (req, res) => {
  try {
    const normalizedPatientPublicId = normalizePatientPublicId(req.query.patientPublicId || "");
    const memberId = cleanText(req.query.id || "");
    if (!normalizedPatientPublicId) {
      return res.status(400).json({ error: "Missing patient public id." });
    }
    if (!memberId) {
      return res.status(400).json({ error: "Missing doctor team member id." });
    }

    const store = await readStore();
    const targetIndex = store.members.findIndex((member) => cleanText(member.id) === memberId);
    if (targetIndex < 0) {
      return res.status(404).json({ error: "Doctor team member not found." });
    }

    const member = mapMemberDocToDto(store.members[targetIndex]);
    if (member.patientPublicId !== normalizedPatientPublicId) {
      return res.status(403).json({ error: "This member does not belong to the provided patient public id." });
    }

    store.members.splice(targetIndex, 1);
    await writeStore(store);
    return res.status(200).json({ deleted: true });
  } catch (error) {
    console.error("[DELETE /doctor-team] Failed:", error);
    const message = error instanceof Error ? error.message : "Could not remove doctor from team.";
    return res.status(500).json({ error: message });
  }
});

export default doctorTeamRoutes;
