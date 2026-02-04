/**
 * Sec4Dev SDK for JavaScript/TypeScript - Security Checks API.
 */

export const VERSION = "1.0.0";

export { Sec4DevClient } from "./client.js";
export type { ClientOptions } from "./client.js";
export { EmailService } from "./email.js";
export { IPService } from "./ip.js";
export {
  Sec4DevError,
  AuthenticationError,
  PaymentRequiredError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
} from "./exceptions.js";
export type { EmailCheckResult } from "./models/email.js";
export type {
  IPCheckResult,
  IPSignals,
  IPNetwork,
  IPGeo,
  IPClassification,
} from "./models/ip.js";
export type { RateLimitInfo } from "./http.js";
