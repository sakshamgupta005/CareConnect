import { type FormEvent, useState } from "react";
import { motion } from "motion/react";
import { LockKeyhole, Stethoscope, UserRound } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { type UserRole } from "../../lib/auth";

type LoginPageProps = {
  onLogin: (input: { username: string; password: string; role: UserRole }) => boolean;
};

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanUsername = username.trim();
    if (!cleanUsername || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    const success = onLogin({
      username: cleanUsername,
      password,
      role,
    });

    if (!success) {
      setError("Invalid password. Please try again.");
      return;
    }

    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-4xl space-y-7">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
            Secure Access
          </p>
          <h1 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">CareConnect Login</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Sign in with your role to open the right dashboard and view role-specific workflows.
          </p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="card mx-auto w-full max-w-2xl p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Select role</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRole("patient")}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    role === "patient"
                      ? "border-sky-300 bg-sky-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <UserRound className="h-4 w-4 text-sky-700" />
                  <p className="mt-2 text-sm font-semibold text-slate-900">Patient</p>
                  <p className="mt-1 text-xs text-slate-600">Open report understanding and guidance pages.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("doctor")}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    role === "doctor"
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <Stethoscope className="h-4 w-4 text-indigo-700" />
                  <p className="mt-2 text-sm font-semibold text-slate-900">Doctor</p>
                  <p className="mt-1 text-xs text-slate-600">Open report assignment and FAQ management pages.</p>
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm text-slate-700">
                <span>Username</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  type="text"
                  placeholder="Enter username"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                />
              </label>
              <label className="space-y-1.5 text-sm text-slate-700">
                <span>Password</span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                />
              </label>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              <p className="inline-flex items-center gap-1 font-medium text-slate-700">
                <LockKeyhole className="h-3.5 w-3.5 text-secondary" />
                Demo password: <span className="font-semibold text-slate-900">careconnect123</span>
              </p>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" className="w-full">
              Continue as {role === "doctor" ? "Doctor" : "Patient"}
            </Button>
          </form>
        </motion.section>
      </div>
    </div>
  );
}
