export type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "careconnect-theme-mode";
const THEME_ATTRIBUTE = "data-theme";
const THEME_TRANSITION_CLASS = "theme-switching";
let themeTransitionTimer: number | null = null;

function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function loadThemePreference(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return getSystemTheme();
}

export function saveThemePreference(theme: ThemeMode): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function applyThemeToDocument(theme: ThemeMode): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  document.documentElement.style.colorScheme = theme;
}

export function startThemeTransition(durationMs = 430): void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.add(THEME_TRANSITION_CLASS);

  if (themeTransitionTimer !== null) {
    window.clearTimeout(themeTransitionTimer);
  }

  themeTransitionTimer = window.setTimeout(() => {
    root.classList.remove(THEME_TRANSITION_CLASS);
    themeTransitionTimer = null;
  }, durationMs);
}
