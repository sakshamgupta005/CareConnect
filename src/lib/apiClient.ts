type JsonFetchResult = {
  response: Response;
  payload: unknown;
};

const DEFAULT_DEV_API_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"] as const;

export async function fetchJsonWithApiFallback(path: string, init?: RequestInit): Promise<JsonFetchResult> {
  const candidates = buildApiUrlCandidates(path);
  let lastError: unknown = null;

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];

    try {
      const response = await fetch(candidate, init);
      const payload = await parseJsonResponse(response);
      return { response, payload };
    } catch (error) {
      lastError = error;
      if (!isNetworkError(error) || index === candidates.length - 1) {
        throw buildApiUnavailableError(lastError);
      }
    }
  }

  throw buildApiUnavailableError(lastError);
}

function buildApiUrlCandidates(path: string): string[] {
  const normalizedPath = normalizeApiPath(path);
  const configuredBaseUrl = readConfiguredApiBaseUrl();
  const candidates = configuredBaseUrl ? [joinUrl(configuredBaseUrl, normalizedPath), normalizedPath] : [normalizedPath];

  if (typeof window !== "undefined") {
    const currentOrigin = window.location.origin;
    DEFAULT_DEV_API_ORIGINS.forEach((origin) => {
      if (origin !== currentOrigin) {
        candidates.push(joinUrl(origin, normalizedPath));
      }
    });
  }

  return [...new Set(candidates)];
}

function normalizeApiPath(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function readConfiguredApiBaseUrl(): string {
  const raw = typeof import.meta !== "undefined" ? import.meta.env.VITE_API_BASE_URL : "";
  return typeof raw === "string" ? raw.trim().replace(/\/+$/, "") : "";
}

function joinUrl(baseUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const raw = await response.text();
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

function buildApiUnavailableError(error: unknown): Error {
  if (error instanceof Error && error.message.trim()) {
    return new Error(
      `Could not reach the CareConnect API. Start the app with \`npm run dev\` on port 3000, or set \`VITE_API_BASE_URL\`. ${error.message}`,
    );
  }

  return new Error(
    "Could not reach the CareConnect API. Start the app with `npm run dev` on port 3000, or set `VITE_API_BASE_URL`.",
  );
}
