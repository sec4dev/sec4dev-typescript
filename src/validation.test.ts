/**
 * Tests for validation helpers.
 */

import { describe, it, expect } from "vitest";
import { validateEmail, validateIp } from "./validation.js";
import { ValidationError } from "./exceptions.js";

describe("validateEmail", () => {
  it("accepts valid emails", () => {
    expect(() => validateEmail("user@example.com")).not.toThrow();
    expect(() => validateEmail("a@b.co")).not.toThrow();
    expect(() => validateEmail("  user@domain.org  ")).not.toThrow();
  });

  it("rejects empty", () => {
    expect(() => validateEmail("")).toThrow(ValidationError);
    expect(() => validateEmail("   ")).toThrow(ValidationError);
  });

  it("rejects invalid format", () => {
    expect(() => validateEmail("no-at-sign")).toThrow(ValidationError);
    expect(() => validateEmail("@nodomain.com")).toThrow(ValidationError);
    expect(() => validateEmail("nobody@")).toThrow(ValidationError);
    expect(() => validateEmail("a@b")).toThrow(ValidationError);
  });

  it("rejects non-string", () => {
    expect(() => validateEmail(null as unknown as string)).toThrow(ValidationError);
    expect(() => validateEmail(123 as unknown as string)).toThrow(ValidationError);
  });
});

describe("validateIp", () => {
  it("accepts valid IPv4", () => {
    expect(() => validateIp("192.168.1.1")).not.toThrow();
    expect(() => validateIp("0.0.0.0")).not.toThrow();
    expect(() => validateIp("255.255.255.255")).not.toThrow();
    expect(() => validateIp("  203.0.113.42  ")).not.toThrow();
  });

  it("accepts valid IPv6", () => {
    expect(() => validateIp("::1")).not.toThrow();
    expect(() => validateIp("2001:db8::1")).not.toThrow();
  });

  it("rejects empty", () => {
    expect(() => validateIp("")).toThrow(ValidationError);
    expect(() => validateIp("   ")).toThrow(ValidationError);
  });

  it("rejects invalid IP", () => {
    expect(() => validateIp("256.1.1.1")).toThrow(ValidationError);
    expect(() => validateIp("not.an.ip")).toThrow(ValidationError);
  });

  it("rejects non-string", () => {
    expect(() => validateIp(null as unknown as string)).toThrow(ValidationError);
    expect(() => validateIp(123 as unknown as string)).toThrow(ValidationError);
  });
});
