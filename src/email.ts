/**
 * Email check service.
 */

import type { EmailCheckResult } from "./models/email.js";
import { request } from "./http.js";
import type { RateLimitInfo } from "./http.js";
import { validateEmail } from "./validation.js";

export interface EmailServiceOptions {
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
  retries: number;
  retryDelayMs: number;
  onRateLimit?: (info: RateLimitInfo) => void;
}

export class EmailService {
  private readonly options: EmailServiceOptions;

  constructor(options: EmailServiceOptions) {
    this.options = options;
  }

  async check(email: string): Promise<EmailCheckResult> {
    validateEmail(email);
    const url = `${this.options.baseUrl.replace(/\/$/, "")}/email/check`;
    const { data } = await request<{
      email: string;
      domain: string;
      is_disposable: boolean;
    }>("POST", url, { email: email.trim() }, {
      apiKey: this.options.apiKey,
      timeoutMs: this.options.timeoutMs,
      retries: this.options.retries,
      retryDelayMs: this.options.retryDelayMs,
      onRateLimit: this.options.onRateLimit,
    });
    return {
      email: data.email ?? email,
      domain: data.domain ?? "",
      isDisposable: data.is_disposable ?? false,
    };
  }

  async isDisposable(email: string): Promise<boolean> {
    const result = await this.check(email);
    return result.isDisposable;
  }
}
