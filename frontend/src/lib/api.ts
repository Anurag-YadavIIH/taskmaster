import type { ApiError } from "./types";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const TOKEN_KEY = "taskmaster_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Dispatched when the server rejects the current token; AuthContext listens and redirects to /login. */
export const AUTH_EXPIRED_EVENT = "taskmaster:auth-expired";

export class ApiException extends Error {
  status: number;
  fieldErrors: Record<string, string> | null;

  constructor(status: number, message: string, fieldErrors: Record<string, string> | null = null) {
    super(message);
    this.name = "ApiException";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  formData?: FormData;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
}

function buildQueryString(query?: RequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function parseErrorBody(res: Response): Promise<{ message: string; fieldErrors: Record<string, string> | null; isApiError: boolean }> {
  const fallback = { message: res.statusText || `Request failed with status ${res.status}`, fieldErrors: null, isApiError: false };
  const text = await res.text();
  if (!text) return fallback;
  try {
    const data = JSON.parse(text) as ApiError;
    if (typeof data.status !== "number" || typeof data.message !== "string") return fallback;
    return { message: data.message, fieldErrors: data.fieldErrors ?? null, isApiError: true };
  } catch {
    return fallback;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, formData, query, signal } = options;

  const url = `${API_BASE_URL}/api${path}${buildQueryString(query)}`;

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let requestBody: BodyInit | undefined;
  if (formData) {
    requestBody = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  const res = await fetch(url, { method, headers, body: requestBody, signal });

  if (res.status === 401 || res.status === 403) {
    const { message, fieldErrors, isApiError } = await parseErrorBody(res);
    // A real ApiError body means an *authenticated* request was rejected for an
    // authorization reason (e.g. "not the team owner") -- show it inline rather
    // than logging the user out. A bare 401/403 (no body) means the token itself
    // was missing/invalid, so send the user back to /login.
    if (res.status === 401 || !isApiError) {
      clearToken();
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    }
    throw new ApiException(res.status, message, fieldErrors);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    const { message, fieldErrors } = await parseErrorBody(res);
    throw new ApiException(res.status, message, fieldErrors);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
  get: <T,>(path: string, query?: RequestOptions["query"], signal?: AbortSignal) =>
    request<T>(path, { method: "GET", query, signal }),
  post: <T,>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: "POST", body, signal }),
  put: <T,>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: "PUT", body, signal }),
  patch: <T,>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: "PATCH", body, signal }),
  delete: <T,>(path: string, signal?: AbortSignal) =>
    request<T>(path, { method: "DELETE", signal }),
  upload: <T,>(path: string, formData: FormData, signal?: AbortSignal) =>
    request<T>(path, { method: "POST", formData, signal }),
};

/** Downloads a binary resource (e.g. an attachment) with the auth header attached. */
export async function downloadFile(path: string): Promise<{ blob: Blob; fileName: string | null }> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api${path}`, { headers });

  if (res.status === 401 || res.status === 403) {
    clearToken();
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  }
  if (!res.ok) {
    const { message, fieldErrors } = await parseErrorBody(res);
    throw new ApiException(res.status, message, fieldErrors);
  }

  const disposition = res.headers.get("Content-Disposition");
  let fileName: string | null = null;
  if (disposition) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match) fileName = match[1];
  }

  return { blob: await res.blob(), fileName };
}
