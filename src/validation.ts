/**
 * Input validation for email and IP.
 */

import { ValidationError } from "./exceptions.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isIPv4(s: string): boolean {
  const parts = s.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = parseInt(p, 10);
    return Number.isInteger(n) && n >= 0 && n <= 255 && p === String(n);
  });
}

function isIPv6(s: string): boolean {
  if (s.includes(".")) {
    const lastColon = s.lastIndexOf(":");
    const tail = s.slice(lastColon + 1);
    if (!isIPv4(tail)) return false;
    s = s.slice(0, lastColon);
  }
  const parts = s.split(":");
  if (parts.length < 2 || parts.length > 8) return false;
  const allHex = (x: string) => /^[0-9a-fA-F]{1,4}$/.test(x) || x === "";
  return parts.every((p) => allHex(p));
}

export function validateEmail(email: string): void {
  if (email == null || typeof email !== "string") {
    throw new ValidationError("Email is required", 422);
  }
  const trimmed = email.trim();
  if (!trimmed) {
    throw new ValidationError("Email cannot be empty", 422);
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    throw new ValidationError("Invalid email format", 422);
  }
}

export function validateIp(ip: string): void {
  if (ip == null || typeof ip !== "string") {
    throw new ValidationError("IP address is required", 422);
  }
  const trimmed = ip.trim();
  if (!trimmed) {
    throw new ValidationError("IP address cannot be empty", 422);
  }
  if (!isIPv4(trimmed) && !isIPv6(trimmed)) {
    throw new ValidationError("Invalid IP address format", 422);
  }
}
