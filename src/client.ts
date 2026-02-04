/**
 * Sec4Dev API client.
 */

import { ValidationError } from "./exceptions.js";
import type { RateLimitInfo } from "./http.js";
import { EmailService } from "./email.js";
import { IPService } from "./ip.js";

const DEFAULT_BASE_URL = "https://api.sec4.dev/api/v1";

export interface ClientOptions {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onRateLimit?: (info: RateLimitInfo) => void;
}

export class Sec4DevClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retries: number;
  private readonly retryDelay: number;
  private readonly onRateLimit?: (info: RateLimitInfo) => void;
  private _rateLimit: RateLimitInfo = { limit: 0, remaining: 0, resetSeconds: 0 };

  readonly email: EmailService;
  readonly ip: IPService;

  constructor(apiKey: string, options: ClientOptions = {}) {
    const key = apiKey?.trim();
    if (!key || !key.startsWith("sec4_")) {
      throw new ValidationError("API key must start with sec4_", 422);
    }
    this.apiKey = key;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeout = options.timeout ?? 30000;
    this.retries = options.retries ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;
    this.onRateLimit = options.onRateLimit;

    const captureRateLimit = (info: RateLimitInfo) => {
      this._rateLimit = info;
      this.onRateLimit?.(info);
    };

    const serviceOpts = {
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      timeoutMs: this.timeout,
      retries: this.retries,
      retryDelayMs: this.retryDelay,
      onRateLimit: captureRateLimit,
    };
    this.email = new EmailService(serviceOpts);
    this.ip = new IPService(serviceOpts);
  }

  get rateLimit(): RateLimitInfo {
    return { ...this._rateLimit };
  }
}
