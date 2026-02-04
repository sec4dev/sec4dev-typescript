/**
 * HTTP client with retry, rate limit handling, and exception mapping.
 */

import {
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  PaymentRequiredError,
  RateLimitError,
  Sec4DevError,
  ServerError,
  ValidationError,
} from "./exceptions.js";

const SDK_VERSION = "1.0.0";

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetSeconds: number;
}

function parseRateLimitHeaders(headers: Headers): RateLimitInfo {
  const getInt = (name: string, def: number): number => {
    const v = headers.get(name);
    if (v == null) return def;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? def : n;
  };
  return {
    limit: getInt("x-ratelimit-limit", 0),
    remaining: getInt("x-ratelimit-remaining", 0),
    resetSeconds: getInt("x-ratelimit-reset", 0),
  };
}

function errorFromResponse(
  statusCode: number,
  body: unknown,
  headers: Headers
): Sec4DevError {
  let message = "Unknown error";
  if (body && typeof body === "object" && "detail" in body) {
    const d = (body as { detail: unknown }).detail;
    message = typeof d === "string" ? d : String(d);
  }
  if (statusCode === 401) return new AuthenticationError(message, statusCode, body);
  if (statusCode === 402) return new PaymentRequiredError(message, statusCode, body);
  if (statusCode === 403) return new ForbiddenError(message, statusCode, body);
  if (statusCode === 404) return new NotFoundError(message, statusCode, body);
  if (statusCode === 422) return new ValidationError(message, statusCode, body);
  if (statusCode === 429) {
    const rate = parseRateLimitHeaders(headers);
    let retryAfter = 0;
    const ra = headers.get("retry-after");
    if (ra != null) {
      const n = parseInt(ra, 10);
      if (!Number.isNaN(n)) retryAfter = n;
    }
    return new RateLimitError(
      message,
      429,
      body,
      retryAfter,
      rate.limit,
      rate.remaining
    );
  }
  if (statusCode >= 500) return new ServerError(message, statusCode, body);
  return new Sec4DevError(message, statusCode, body);
}

function isRetryable(statusCode: number | null, isNetworkError: boolean): boolean {
  if (isNetworkError) return true;
  if (statusCode == null) return true;
  if (statusCode === 429) return true;
  if ([500, 502, 503, 504].includes(statusCode)) return true;
  return false;
}

export interface RequestOptions {
  apiKey: string;
  timeoutMs: number;
  retries: number;
  retryDelayMs: number;
  onRateLimit?: (info: RateLimitInfo) => void;
}

export async function request<T>(
  method: string,
  url: string,
  body: unknown,
  options: RequestOptions
): Promise<{ data: T; rateLimit: RateLimitInfo }> {
  const { apiKey, timeoutMs, retries, retryDelayMs, onRateLimit } = options;
  let lastError: Error | null = null;
  let lastStatus: number | null = null;
  let lastBody: unknown = null;
  let lastHeaders: Headers | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": `sec4dev-javascript/${SDK_VERSION}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const rateLimit = parseRateLimitHeaders(response.headers);
      if (onRateLimit) onRateLimit(rateLimit);

      if (response.status === 429) {
        const retryAfter = (() => {
          const ra = response.headers.get("retry-after");
          if (ra != null) {
            const n = parseInt(ra, 10);
            if (!Number.isNaN(n)) return n;
          }
          return 60;
        })();
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, retryAfter * 1000));
          continue;
        }
        let errBody: unknown = null;
        try {
          errBody = await response.json();
        } catch {
          errBody = await response.text();
        }
        throw errorFromResponse(429, errBody ?? { detail: "Rate limit exceeded" }, response.headers);
      }

      if (!response.ok) {
        lastStatus = response.status;
        try {
          lastBody = await response.json();
        } catch {
          lastBody = await response.text();
        }
        lastHeaders = response.headers;
        const err = errorFromResponse(response.status, lastBody, response.headers);
        if (!isRetryable(response.status, false)) throw err;
        lastError = err;
        if (attempt < retries) {
          const delay = retryDelayMs * Math.pow(2, attempt) + Math.random() * 100;
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw err;
      }

      const data = (await response.json()) as T;
      return { data, rateLimit };
    } catch (e) {
      clearTimeout(timeoutId);
      const isNetwork = e instanceof Error && e.name === "AbortError" || (e as Error).name === "TypeError";
      if (e instanceof Sec4DevError) throw e;
      lastError = e instanceof Error ? e : new Error(String(e));
      lastStatus = null;
      if (attempt < retries && (isNetwork || (e as { statusCode?: number }).statusCode === undefined)) {
        const delay = retryDelayMs * Math.pow(2, attempt) + Math.random() * 100;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw lastError;
    }
  }

  if (lastStatus != null && lastHeaders != null) {
    throw errorFromResponse(lastStatus, lastBody, lastHeaders);
  }
  throw lastError ?? new Sec4DevError("Request failed after retries", 0);
}
