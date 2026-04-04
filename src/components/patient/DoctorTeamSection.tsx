import { FormEvent, useEffect, useMemo, useState } from "react";
import { LoaderCircle, Stethoscope, Trash2, UserPlus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { loadAuthSession } from "../../lib/auth";
import { normalizeDoctorPublicIdInput, normalizePatientPublicId } from "../../lib/doctorTeam";
import {
  createDoctorTeamMember,
  deleteDoctorTeamMember,
  listDoctorTeamMembers,
  type DoctorTeamMemberDto,
} from "../../lib/doctorTeamApi";

export function DoctorTeamSection({ sectionId = "patient-doctor-team" }: { sectionId?: string }) {
  const session = loadAuthSession();
  const patientPublicId = useMemo(() => normalizePatientPublicId(session?.username ?? ""), [session?.username]);
  const [members, setMembers] = useState<DoctorTeamMemberDto[]>([]);
  const [doctorPublicId, setDoctorPublicId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorSpecialty, setDoctorSpecialty] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadMembers = async () => {
      if (!patientPublicId) {
        setError("Could not find your patient public ID from this login.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const loadedMembers = await listDoctorTeamMembers(patientPublicId);
        if (!cancelled) {
          setMembers(loadedMembers);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load doctor team.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [patientPublicId]);

  const handleAddDoctor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!patientPublicId) {
      setError("Could not find your patient public ID from this login.");
      return;
    }

    const normalizedDoctorId = normalizeDoctorPublicIdInput(doctorPublicId);
    if (!normalizedDoctorId) {
      setError("Enter a valid doctor public ID.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const createdMember = await createDoctorTeamMember({
        patientPublicId,
        doctorPublicId: normalizedDoctorId,
        doctorName,
        doctorSpecialty,
      });
      setMembers((current) => [createdMember, ...current.filter((item) => item.id !== createdMember.id)]);
      setDoctorPublicId("");
      setDoctorName("");
      setDoctorSpecialty("");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not add doctor to team.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveDoctor = async (memberId: string) => {
    if (!patientPublicId) {
      setError("Could not find your patient public ID from this login.");
      return;
    }

    setError("");
    try {
      await deleteDoctorTeamMember(patientPublicId, memberId);
      setMembers((current) => current.filter((item) => item.id !== memberId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not remove doctor from team.");
    }
  };

  return (
    <section id={sectionId} className="card-patient scroll-mt-24 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
            Doctor Team
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">Add doctors by public ID</h2>
          <p className="mt-1 text-sm text-slate-600">
            Build your doctor network so care teams can coordinate faster on your case.
          </p>
          <p className="mt-2 text-xs text-slate-500">Your patient public ID: {patientPublicId || "Not available"}</p>
        </div>
      </div>

      <form onSubmit={handleAddDoctor} className="mt-5 grid gap-3 md:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Doctor public ID</span>
          <input
            value={doctorPublicId}
            onChange={(event) => setDoctorPublicId(event.target.value)}
            placeholder="DOC-9911223344"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-secondary focus:outline-none"
            required
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Doctor name (optional)</span>
          <input
            value={doctorName}
            onChange={(event) => setDoctorName(event.target.value)}
            placeholder="Dr. A. Sharma"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-secondary focus:outline-none"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Specialty (optional)</span>
          <input
            value={doctorSpecialty}
            onChange={(event) => setDoctorSpecialty(event.target.value)}
            placeholder="Cardiology"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-secondary focus:outline-none"
          />
        </label>

        <div className="md:col-span-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Add To Doctor Team
          </Button>
        </div>
      </form>

      {error ? <p className="mt-3 text-sm text-amber-700">{error}</p> : null}

      <div className="mt-5 space-y-3">
        {members.length > 0 ? (
          members.map((member) => (
            <article key={member.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{member.doctorName || "Doctor contact"}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-600">
                    <Stethoscope className="h-3.5 w-3.5 text-secondary" />
                    {member.doctorSpecialty || "Specialty not added"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-secondary">{member.doctorPublicId}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/care-team/doctor/${encodeURIComponent(member.doctorPublicId)}`} className="inline-flex">
                    <Button size="sm" variant="outline">
                      <Users className="h-4 w-4" />
                      View Doctor Profile
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      void handleRemoveDoctor(member.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            {isLoading ? "Loading doctor team..." : "No doctors added yet. Add the first doctor using their public ID."}
          </div>
        )}
      </div>
    </section>
  );
}
