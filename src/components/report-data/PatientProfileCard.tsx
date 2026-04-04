import { type ReactNode } from "react";
import { Droplets, HeartPulse, UserRound } from "lucide-react";
import { type PatientProfile, hasDetectedPatientProfile } from "../../lib/patientProfile";

type PatientProfileCardProps = {
  profile: PatientProfile;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function PatientProfileCard({
  profile,
  title = "Patient Profile",
  subtitle = "Details detected from the uploaded report text.",
  actions,
}: PatientProfileCardProps) {
  const hasDetectedData = hasDetectedPatientProfile(profile);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detected identity</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">{profile.displayName}</p>
        <p className="mt-1 text-sm text-slate-600">
          {profile.name ? "Name found in report text." : "Using the report title because a patient name was not clearly detected."}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ProfileFact icon={<HeartPulse className="h-4 w-4 text-rose-600" />} label="Age" value={profile.age} />
        <ProfileFact icon={<UserRound className="h-4 w-4 text-sky-600" />} label="Gender" value={profile.gender} />
        <ProfileFact icon={<Droplets className="h-4 w-4 text-emerald-600" />} label="Blood Type" value={profile.bloodType} />
      </div>

      {!hasDetectedData ? (
        <p className="mt-4 text-sm text-slate-500">
          No patient demographics were clearly found in this report yet. Add lines like `Age: 26`, `Gender: Male`, or
          `Blood Group: B+` to help CareConnect detect them.
        </p>
      ) : null}
    </section>
  );
}

function ProfileFact({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="inline-flex rounded-lg bg-white p-2 shadow-sm">{icon}</div>
      <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-900">{value || "Not detected"}</p>
    </div>
  );
}
