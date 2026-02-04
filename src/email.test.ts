/**
 * Tests for EmailService (mocked fetch).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { Sec4DevClient } from "./client.js";
import { AuthenticationError } from "./exceptions.js";
import { ValidationError } from "./exceptions.js";

function mockFetchJson(body: object, status = 200, headers: Record<string, string> = {}) {
  return vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      headers: new Map(Object.entries(headers)),
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
    }) as unknown as Response
  );
}

describe("EmailService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("check returns result", async () => {
    const mockRes = {
      email: "user@tempmail.com",
      domain: "tempmail.com",
      is_disposable: true,
    };
    globalThis.fetch = mockFetchJson(mockRes);

    const client = new Sec4DevClient("sec4_test");
    const result = await client.email.check("user@tempmail.com");

    expect(result.email).toBe("user@tempmail.com");
    expect(result.domain).toBe("tempmail.com");
    expect(result.isDisposable).toBe(true);
  });

  it("isDisposable returns true when disposable", async () => {
    globalThis.fetch = mockFetchJson({
      email: "x@disposable.com",
      domain: "disposable.com",
      is_disposable: true,
    });

    const client = new Sec4DevClient("sec4_test");
    expect(await client.email.isDisposable("x@disposable.com")).toBe(true);
  });

  it("isDisposable returns false when not disposable", async () => {
    globalThis.fetch = mockFetchJson({
      email: "user@gmail.com",
      domain: "gmail.com",
      is_disposable: false,
    });

    const client = new Sec4DevClient("sec4_test");
    expect(await client.email.isDisposable("user@gmail.com")).toBe(false);
  });

  it("check throws ValidationError for invalid email", async () => {
    const client = new Sec4DevClient("sec4_test");
    await expect(client.email.check("not-an-email")).rejects.toThrow(ValidationError);
    await expect(client.email.check("")).rejects.toThrow(ValidationError);
  });

  it("check propagates AuthenticationError on 401", async () => {
    globalThis.fetch = mockFetchJson(
      { detail: "Invalid API key" },
      401
    );

    const client = new Sec4DevClient("sec4_test");
    await expect(client.email.check("user@gmail.com")).rejects.toThrow(AuthenticationError);
  });
});
