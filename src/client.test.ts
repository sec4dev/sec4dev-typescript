/**
 * Tests for Sec4DevClient and API key validation.
 */

import { describe, it, expect } from "vitest";
import { Sec4DevClient } from "./client.js";
import { ValidationError } from "./exceptions.js";

describe("Sec4DevClient", () => {
  it("accepts valid API key", () => {
    const client = new Sec4DevClient("sec4_test_key_123");
    expect(client.email).toBeDefined();
    expect(client.ip).toBeDefined();
  });

  it("rejects empty API key", () => {
    expect(() => new Sec4DevClient("")).toThrow(ValidationError);
    expect(() => new Sec4DevClient("")).toThrow(/sec4_/);
  });

  it("rejects API key without sec4_ prefix", () => {
    expect(() => new Sec4DevClient("invalid_key")).toThrow(ValidationError);
    expect(() => new Sec4DevClient("invalid_key")).toThrow(/sec4_/);
  });

  it("rejects whitespace-only API key", () => {
    expect(() => new Sec4DevClient("   ")).toThrow(ValidationError);
  });

  it("uses custom baseUrl", () => {
    const client = new Sec4DevClient("sec4_k", {
      baseUrl: "https://custom.example.com/v1",
    });
    expect(client.rateLimit).toEqual({
      limit: 0,
      remaining: 0,
      resetSeconds: 0,
    });
  });

  it("exposes rateLimit", () => {
    const client = new Sec4DevClient("sec4_k");
    const rl = client.rateLimit;
    expect(rl).toHaveProperty("limit");
    expect(rl).toHaveProperty("remaining");
    expect(rl).toHaveProperty("resetSeconds");
  });
});
