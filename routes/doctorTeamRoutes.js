import { Router } from "express";
import { db } from "../config/firebase.js";

const doctorTeamRoutes = Router();
const COLLECTION_NAME = "doctor_team_members";

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
  const data = doc.data() || {};
  return {
    id: doc.id,
    patientPublicId: cleanText(data.patientPublicId),
    doctorPublicId: cleanText(data.doctorPublicId),
    doctorName: cleanText(data.doctorName) || null,
    doctorSpecialty: cleanText(data.doctorSpecialty) || null,
    notes: cleanText(data.notes) || null,
    createdAt: cleanText(data.createdAt),
    updatedAt: cleanText(data.updatedAt),
  };
}

doctorTeamRoutes.get("/doctor-team/public/:doctorPublicId", async (req, res) => {
  try {
    const normalizedDoctorPublicId = normalizeDoctorPublicId(req.params.doctorPublicId || "");
    if (!normalizedDoctorPublicId) {
      return res.status(400).json({ error: "Missing doctor public id." });
    }

    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where("doctorPublicId", "==", normalizedDoctorPublicId)
      .get();

    const members = snapshot.docs.map(mapMemberDocToDto);
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

    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where("patientPublicId", "==", normalizedPatientPublicId)
      .get();

    const members = snapshot.docs
      .map(mapMemberDocToDto)
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
    const existingSnapshot = await db
      .collection(COLLECTION_NAME)
      .where("patientPublicId", "==", normalizedPatientPublicId)
      .where("doctorPublicId", "==", normalizedDoctorPublicId)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      const existingRef = existingSnapshot.docs[0].ref;
      await existingRef.update({
        doctorName: doctorName || null,
        doctorSpecialty: doctorSpecialty || null,
        notes: notes || null,
        updatedAt: nowIso,
      });
      const updatedDoc = await existingRef.get();
      return res.status(200).json(mapMemberDocToDto(updatedDoc));
    }

    const createdRef = await db.collection(COLLECTION_NAME).add({
      patientPublicId: normalizedPatientPublicId,
      doctorPublicId: normalizedDoctorPublicId,
      doctorName: doctorName || null,
      doctorSpecialty: doctorSpecialty || null,
      notes: notes || null,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    const createdDoc = await createdRef.get();

    return res.status(201).json(mapMemberDocToDto(createdDoc));
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

    const ref = db.collection(COLLECTION_NAME).doc(memberId);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Doctor team member not found." });
    }

    const member = mapMemberDocToDto(doc);
    if (member.patientPublicId !== normalizedPatientPublicId) {
      return res.status(403).json({ error: "This member does not belong to the provided patient public id." });
    }

    await ref.delete();
    return res.status(200).json({ deleted: true });
  } catch (error) {
    console.error("[DELETE /doctor-team] Failed:", error);
    const message = error instanceof Error ? error.message : "Could not remove doctor from team.";
    return res.status(500).json({ error: message });
  }
});

export default doctorTeamRoutes;
