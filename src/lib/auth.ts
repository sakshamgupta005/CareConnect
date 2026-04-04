export type UserRole = "doctor" | "patient";

export type AuthSession = {
  username: string;
  role: UserRole;
  loggedInAt: number;
};

export const AUTH_STORAGE_KEY = "careconnect_auth_session_v1";
export const LEGACY_LOGIN_FLAG_KEY = "careconnect_logged_in";
export const DEMO_LOGIN_PASSWORD = "careconnect123";

export function validateLoginPassword(password: string): boolean {
  return password === DEMO_LOGIN_PASSWORD;
}

export function loadAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (!parsed || typeof parsed !== "object") return null;

    const username = typeof parsed.username === "string" ? parsed.username.trim() : "";
    const role = parsed.role === "doctor" || parsed.role === "patient" ? parsed.role : null;
    const loggedInAt = typeof parsed.loggedInAt === "number" ? parsed.loggedInAt : Date.now();

    if (!username || !role) return null;

    return {
      username,
      role,
      loggedInAt,
    };
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.localStorage.setItem(LEGACY_LOGIN_FLAG_KEY, "true");
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.setItem(LEGACY_LOGIN_FLAG_KEY, "false");
}
