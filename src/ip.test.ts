/**
 * Tests for IPService (mocked fetch).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { Sec4DevClient } from "./client.js";
import { ValidationError } from "./exceptions.js";

function mockFetchJson(body: object, status = 200) {
  return vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      headers: new Map<string, string>(),
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
    }) as unknown as Response
  );
}

function makeIPResponse(overrides: Record<string, unknown> = {}) {
  return {
    ip: "203.0.113.42",
    classification: "hosting",
    confidence: 0.95,
    signals: {
      is_hosting: true,
      is_residential: false,
      is_mobile: false,
      is_vpn: false,
      is_tor: false,
      is_proxy: false,
    },
    network: { asn: 16509, org: "Amazon.com, Inc.", provider: "AWS" },
    geo: { country: "US", region: null },
    ...overrides,
  };
}

describe("IPService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("check returns result", async () => {
    const body = makeIPResponse();
    globalThis.fetch = mockFetchJson(body);

    const client = new Sec4DevClient("sec4_test");
    const result = await client.ip.check("203.0.113.42");

    expect(result.ip).toBe("203.0.113.42");
    expect(result.classification).toBe("hosting");
    expect(result.confidence).toBe(0.95);
    expect(result.signals.isHosting).toBe(true);
    expect(result.signals.isVpn).toBe(false);
    expect(result.network.provider).toBe("AWS");
    expect(result.geo.country).toBe("US");
  });

  it("isHosting returns true when hosting", async () => {
    globalThis.fetch = mockFetchJson(makeIPResponse({ classification: "hosting" }));

    const client = new Sec4DevClient("sec4_test");
    expect(await client.ip.isHosting("203.0.113.42")).toBe(true);
  });

  it("isVpn returns true when vpn", async () => {
    globalThis.fetch = mockFetchJson(
      makeIPResponse({
        classification: "vpn",
        signals: { is_hosting: false, is_vpn: true },
      })
    );

    const client = new Sec4DevClient("sec4_test");
    expect(await client.ip.isVpn("203.0.113.42")).toBe(true);
  });

  it("isResidential returns true when residential", async () => {
    globalThis.fetch = mockFetchJson(
      makeIPResponse({
        classification: "residential",
        signals: { is_hosting: false, is_residential: true },
      })
    );

    const client = new Sec4DevClient("sec4_test");
    expect(await client.ip.isResidential("203.0.113.42")).toBe(true);
  });

  it("check throws ValidationError for invalid IP", async () => {
    const client = new Sec4DevClient("sec4_test");
    await expect(client.ip.check("not-an-ip")).rejects.toThrow(ValidationError);
    await expect(client.ip.check("")).rejects.toThrow(ValidationError);
  });

  it("check accepts IPv6", async () => {
    globalThis.fetch = mockFetchJson(
      makeIPResponse({ ip: "::1", classification: "unknown" })
    );

    const client = new Sec4DevClient("sec4_test");
    const result = await client.ip.check("::1");
    expect(result.ip).toBe("::1");
  });
});
