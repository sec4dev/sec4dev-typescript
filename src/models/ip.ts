/**
 * IP check models.
 */

export type IPClassification =
  | "hosting"
  | "residential"
  | "mobile"
  | "vpn"
  | "tor"
  | "proxy"
  | "unknown";

export interface IPSignals {
  isHosting: boolean;
  isResidential: boolean;
  isMobile: boolean;
  isVpn: boolean;
  isTor: boolean;
  isProxy: boolean;
}

export interface IPNetwork {
  asn: number | null;
  org: string | null;
  provider: string | null;
}

export interface IPGeo {
  country: string | null;
  region: string | null;
}

export interface IPCheckResult {
  ip: string;
  classification: string;
  confidence: number;
  signals: IPSignals;
  network: IPNetwork;
  geo: IPGeo;
}
