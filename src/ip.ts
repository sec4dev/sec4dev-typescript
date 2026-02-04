/**
 * IP check service.
 */

import type { IPCheckResult } from "./models/ip.js";
import { request } from "./http.js";
import type { RateLimitInfo } from "./http.js";
import { validateIp } from "./validation.js";

export interface IPServiceOptions {
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
  retries: number;
  retryDelayMs: number;
  onRateLimit?: (info: RateLimitInfo) => void;
}

interface RawIPCheckResult {
  ip: string;
  classification: string;
  confidence: number;
  signals?: {
    is_hosting?: boolean;
    is_residential?: boolean;
    is_mobile?: boolean;
    is_vpn?: boolean;
    is_tor?: boolean;
    is_proxy?: boolean;
  };
  network?: { asn?: number; org?: string; provider?: string };
  geo?: { country?: string; region?: string };
}

function mapResult(data: RawIPCheckResult): IPCheckResult {
  const signals = data.signals ?? {};
  const network = data.network ?? {};
  const geo = data.geo ?? {};
  return {
    ip: data.ip ?? "",
    classification: data.classification ?? "unknown",
    confidence: typeof data.confidence === "number" ? data.confidence : 0,
    signals: {
      isHosting: signals.is_hosting ?? false,
      isResidential: signals.is_residential ?? false,
      isMobile: signals.is_mobile ?? false,
      isVpn: signals.is_vpn ?? false,
      isTor: signals.is_tor ?? false,
      isProxy: signals.is_proxy ?? false,
    },
    network: {
      asn: network.asn ?? null,
      org: network.org ?? null,
      provider: network.provider ?? null,
    },
    geo: {
      country: geo.country ?? null,
      region: geo.region ?? null,
    },
  };
}

export class IPService {
  private readonly options: IPServiceOptions;

  constructor(options: IPServiceOptions) {
    this.options = options;
  }

  async check(ip: string): Promise<IPCheckResult> {
    validateIp(ip);
    const url = `${this.options.baseUrl.replace(/\/$/, "")}/ip/check`;
    const { data } = await request<RawIPCheckResult>("POST", url, { ip: ip.trim() }, {
      apiKey: this.options.apiKey,
      timeoutMs: this.options.timeoutMs,
      retries: this.options.retries,
      retryDelayMs: this.options.retryDelayMs,
      onRateLimit: this.options.onRateLimit,
    });
    return mapResult(data);
  }

  async isHosting(ip: string): Promise<boolean> {
    const result = await this.check(ip);
    return result.signals.isHosting;
  }

  async isVpn(ip: string): Promise<boolean> {
    const result = await this.check(ip);
    return result.signals.isVpn;
  }

  async isTor(ip: string): Promise<boolean> {
    const result = await this.check(ip);
    return result.signals.isTor;
  }

  async isResidential(ip: string): Promise<boolean> {
    const result = await this.check(ip);
    return result.signals.isResidential;
  }

  async isMobile(ip: string): Promise<boolean> {
    const result = await this.check(ip);
    return result.signals.isMobile;
  }
}
