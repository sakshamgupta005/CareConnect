import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, LoaderCircle, Stethoscope, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { loadAuthSession } from "../../lib/auth";
import { normalizeDoctorPublicIdInput } from "../../lib/doctorTeam";
import { getDoctorPublicProfile, type DoctorPublicProfileDto } from "../../lib/doctorTeamApi";

export default function DoctorPublicProfilePage() {
  const params = useParams<{ doctorPublicId: string }>();
  const session = loadAuthSession();
  const doctorPublicId = useMemo(
    () => normalizeDoctorPublicIdInput(decodeURIComponent(params.doctorPublicId ?? "")),
    [params.doctorPublicId],
  );
  const [profile, setProfile] = useState<DoctorPublicProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!doctorPublicId) {
        setError("Doctor public ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const data = await getDoctorPublicProfile(doctorPublicId);
        if (!cancelled) {
          setProfile(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load doctor public profile.");
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [doctorPublicId]);

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 sm:px-6">
        <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <Link to={session?.role === "doctor" ? "/doctor/collaboration" : "/patient"} className="inline-flex">
            <Button size="sm" variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Doctor Public Profile</h1>
          <p className="text-sm text-slate-600">Public care-team details connected to the doctor ID.</p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-6 sm:p-8"
        >
          {isLoading ? (
            <p className="inline-flex items-center gap-2 text-sm text-secondary">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading public doctor profile...
            </p>
          ) : null}
          {error ? <p className="text-sm text-amber-700">{error}</p> : null}
          {profile ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Doctor public ID</p>
                <p className="mt-1 text-lg font-semibold text-secondary">{profile.doctorPublicId}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <ProfileMetric label="Doctor Name" value={profile.doctorName || "Not shared"} icon={Stethoscope} />
                <ProfileMetric label="Specialty" value={profile.doctorSpecialty || "Not shared"} icon={Stethoscope} />
                <ProfileMetric label="Connected Patients" value={`${profile.connectedPatients}`} icon={Users} />
              </div>
              {profile.lastUpdatedAt ? (
                <p className="text-xs text-slate-500">
                  Last updated {new Date(profile.lastUpdatedAt).toLocaleString("en-IN")}
                </p>
              ) : null}
              {session?.role === "doctor" ? (
                <Link to={`/doctor/collaboration?doctorPublicId=${encodeURIComponent(profile.doctorPublicId)}`}>
                  <Button size="sm" variant="outline">Open Doctor Collaboration</Button>
                </Link>
              ) : null}
            </div>
          ) : null}
        </motion.section>
      </div>
    </div>
  );
}

function ProfileMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Stethoscope;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="inline-flex items-center gap-1 text-xs uppercase tracking-wide text-slate-500">
        <Icon className="h-3.5 w-3.5 text-secondary" />
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
