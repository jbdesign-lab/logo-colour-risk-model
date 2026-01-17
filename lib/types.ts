export type RiskTier = "Low" | "Medium" | "High" | "Severe";
export type Confidence = "Low" | "Medium" | "High";

export interface Company {
  id: string;
  name: string;
  industry?: string;
  region?: string;
  logoColor: {
    name: string;
    hex: string;
  };
  risk: {
    score: number; // 0-100
    tier: RiskTier;
    confidence: Confidence;
  };
  exposure?: number;
}

export interface ColorRiskSummary {
  colorName: string;
  hex: string;
  avgRiskScore: number;
  tier: RiskTier;
  confidence: Confidence;
  companyCount: number;
  tierBreakdown: Record<RiskTier, number>;
}

export interface ComparisonData {
  id: string;
  name: string;
  logo: {
    name: string;
    hex: string;
  };
  riskScore: number;
  tier: RiskTier;
  confidence: Confidence;
}

export interface WhatIfResult {
  currentColor: { name: string; hex: string };
  proposedColor: { name: string; hex: string };
  currentRisk: number;
  proposedRisk: number;
  delta: number;
  confidence: Confidence;
  description: string;
}
