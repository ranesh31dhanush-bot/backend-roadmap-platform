import { ApiResponse, ApiErrorResponse } from "@top1/shared";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "/api/v1" : "http://localhost:5000/api/v1");

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, code: string = "CLIENT_ERROR", details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match && match[2] ? decodeURIComponent(match[2]) : null;
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Attach CSRF Token if available
  const csrfToken = getCookie("csrfToken");
  if (csrfToken && !headers.has("x-csrf-token")) {
    headers.set("x-csrf-token", csrfToken);
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Send & receive HttpOnly cookies
  });

  // Handle 401 Unauthorized -> Attempt silent token refresh
  if (response.status === 401 && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/register") && !endpoint.includes("/auth/refresh")) {
    if (isRefreshing) {
      // Queue request while refresh is in flight
      await new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
      return fetchApi<T>(endpoint, options);
    }

    isRefreshing = true;

    try {
      const refreshUrl = `${API_BASE_URL}/auth/refresh`;
      const refreshRes = await fetch(refreshUrl, {
        method: "POST",
        credentials: "include",
      });

      if (!refreshRes.ok) {
        throw new Error("Token refresh failed");
      }

      processQueue(null);

      // Re-fetch original request with refreshed session cookie
      response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });
    } catch (refreshErr) {
      processQueue(refreshErr as Error);
      throw new ApiClientError("Session expired. Please log in again.", "AUTHENTICATION_ERROR");
    } finally {
      isRefreshing = false;
    }
  }

  const json: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: {
      code: "PARSE_ERROR",
      message: "Failed to parse JSON response from server",
    },
  }));

  if (!json.success) {
    const errorJson = json as ApiErrorResponse;
    throw new ApiClientError(
      errorJson.error?.message || "API request failed",
      errorJson.error?.code || "UNKNOWN_ERROR",
      errorJson.error?.details,
    );
  }

  return json.data;
}
