import { Company, WhatIfResult, ColorRiskSummary } from "@/lib/types";
import { getColorRiskSummaries } from "@/data/mockData";

export function calculateWhatIfRisk(
  company: Company,
  newColorName: string
): WhatIfResult {
  const summaries = getColorRiskSummaries();
  const newColorSummary = summaries[newColorName] as ColorRiskSummary;

  if (!newColorSummary) {
    throw new Error(`Color ${newColorName} not found`);
  }

  const currentRisk = company.risk.score;
  const proposedRisk = newColorSummary.avgRiskScore;
  const delta = proposedRisk - currentRisk;

  return {
    currentColor: company.logoColor,
    proposedColor: {
      name: newColorSummary.colorName,
      hex: newColorSummary.hex,
    },
    currentRisk,
    proposedRisk,
    delta,
    confidence: newColorSummary.confidence,
    description:
      delta > 0
        ? `Changing to ${newColorName} would increase risk by ${Math.abs(delta)} points`
        : `Changing to ${newColorName} would decrease risk by ${Math.abs(delta)} points`,
  };
}

export function filterCompaniesByColorAndSearch(
  companies: Company[],
  selectedColors: string[],
  searchQuery: string
): Company[] {
  let filtered = companies;

  if (selectedColors.length > 0) {
    filtered = filtered.filter((c) =>
      selectedColors.includes(c.logoColor.name)
    );
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((c) => c.name.toLowerCase().includes(query));
  }

  return filtered;
}

export function calculatePortfolioStats(companies: Company[]) {
  if (companies.length === 0) {
    return {
      totalCompanies: 0,
      avgRiskScore: 0,
      tierBreakdown: { Low: 0, Medium: 0, High: 0, Severe: 0 },
      percentageByTier: {
        Low: "0%",
        Medium: "0%",
        High: "0%",
        Severe: "0%",
      },
      totalExposure: 0,
    };
  }

  const tierCounts = { Low: 0, Medium: 0, High: 0, Severe: 0 };
  let totalScore = 0;
  let totalExposure = 0;

  companies.forEach((c) => {
    tierCounts[c.risk.tier]++;
    totalScore += c.risk.score;
    if (c.exposure) totalExposure += c.exposure;
  });

  const avgScore = Math.round(totalScore / companies.length);
  const percentages = {
    Low: Math.round((tierCounts.Low / companies.length) * 100),
    Medium: Math.round((tierCounts.Medium / companies.length) * 100),
    High: Math.round((tierCounts.High / companies.length) * 100),
    Severe: Math.round((tierCounts.Severe / companies.length) * 100),
  };

  return {
    totalCompanies: companies.length,
    avgRiskScore: avgScore,
    tierBreakdown: tierCounts,
    percentageByTier: {
      Low: `${percentages.Low}%`,
      Medium: `${percentages.Medium}%`,
      High: `${percentages.High}%`,
      Severe: `${percentages.Severe}%`,
    },
    totalExposure,
  };
}

export function getRiskColor(tier: string): string {
  switch (tier) {
    case "Low":
      return "#10B981"; // green
    case "Medium":
      return "#F59E0B"; // amber
    case "High":
      return "#EF4444"; // red
    case "Severe":
      return "#7C2D12"; // dark red
    default:
      return "#6B7280"; // gray
  }
}

export function getTierBgColor(tier: string): string {
  switch (tier) {
    case "Low":
      return "bg-green-50";
    case "Medium":
      return "bg-yellow-50";
    case "High":
      return "bg-red-50";
    case "Severe":
      return "bg-red-100";
    default:
      return "bg-gray-50";
  }
}

export function getTierTextColor(tier: string): string {
  switch (tier) {
    case "Low":
      return "text-green-700";
    case "Medium":
      return "text-yellow-700";
    case "High":
      return "text-red-700";
    case "Severe":
      return "text-red-900";
    default:
      return "text-gray-700";
  }
}
