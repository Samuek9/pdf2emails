export type EmailCategory = "corporate" | "generic" | "personal" | "unknown";

export interface ExtractedEmail {
  email: string;
  category: EmailCategory;
}

export interface ExtractOptions {
  excludeGeneric: boolean;
  excludePersonal: boolean;
}

export interface ExtractResult {
  emails: ExtractedEmail[];
  totalRaw: number;
  excludedGeneric: number;
  excludedPersonal: number;
  totalEmails: number;
  corporateCount: number;
  genericCount: number;
  personalCount: number;
}

export interface ParsedPdf {
  text: string;
  numPages: number;
  fileName: string;
  all: ExtractedEmail[];
  totalRaw: number;
}

export type Gateway = "paypal" | "dlocal";

export interface Pricing {
  region: "latam" | "row";
  countryCode: string;
  displayPrice: string;
  priceUsd: number;
  verifyPriceUsd: number;
  verifyOnlyUsd: number;
  priceCop: number;
  primaryGateway: Gateway;
  secondaryGateway: Gateway;
  couponApplied: string | null;
}
