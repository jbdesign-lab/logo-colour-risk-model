import { Company } from "@/lib/types";

// Seeded random number generator for consistent data generation
// This ensures server and client produce identical data
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

const colors = [
  { name: "Navy", hex: "#0B1F3B" },
  { name: "Forest Green", hex: "#2D5016" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Slate", hex: "#3E4349" },
  { name: "Gold", hex: "#D4A574" },
  { name: "Teal", hex: "#008080" },
  { name: "Crimson", hex: "#DC143C" },
  { name: "Charcoal", hex: "#36454F" },
  { name: "Indigo", hex: "#4B0082" },
  { name: "Sage", hex: "#9CAF88" },
];

const industries = [
  "Financial Services",
  "Technology",
  "Healthcare",
  "Energy",
  "Manufacturing",
  "Retail",
  "Real Estate",
  "Telecommunications",
  "Utilities",
  "Consumer Goods",
];

const regions = ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East & Africa"];

const companyNames = [
  "Apex Capital",
  "Meridian Corp",
  "Zenith Industries",
  "Pinnacle Financial",
  "Nexus Solutions",
  "Prism Ventures",
  "Ascent Group",
  "Horizon Trading",
  "Vertex Analytics",
  "Compass Digital",
  "Summit Energy",
  "Beacon Technologies",
  "Catalyst Systems",
  "Dynasty Holdings",
  "Eclipse Partners",
  "Frontier Capital",
  "Galaxy Finance",
  "Haven Insurance",
  "Infinity Networks",
  "Juncture Advisors",
];

// Risk mapping by color (deterministic for what-if simulation)
const colorRiskMapping: Record<string, { baseScore: number; variance: number }> = {
  Navy: { baseScore: 35, variance: 15 },
  "Forest Green": { baseScore: 40, variance: 12 },
  Burgundy: { baseScore: 58, variance: 18 },
  Slate: { baseScore: 45, variance: 14 },
  Gold: { baseScore: 52, variance: 16 },
  Teal: { baseScore: 38, variance: 13 },
  Crimson: { baseScore: 65, variance: 20 },
  Charcoal: { baseScore: 48, variance: 15 },
  Indigo: { baseScore: 42, variance: 13 },
  Sage: { baseScore: 41, variance: 12 },
};

function getRiskTier(score: number): "Low" | "Medium" | "High" | "Severe" {
  if (score < 30) return "Low";
  if (score < 50) return "Medium";
  if (score < 70) return "High";
  return "Severe";
}

function getConfidence(score: number): "Low" | "Medium" | "High" {
  // Higher variance = lower confidence
  const absScore = Math.abs(score - 50);
  if (absScore > 30) return "High";
  if (absScore > 15) return "Medium";
  return "Low";
}

function generateCompanies(): Company[] {
  const companies: Company[] = [];
  let id = 1;
  const rng = new SeededRandom(12345); // Fixed seed for consistency

  // Generate 120 companies
  for (let i = 0; i < 120; i++) {
    const color = colors[i % colors.length];
    const namePrefix = companyNames[Math.floor(i / 12) % companyNames.length];
    const colorRisk = colorRiskMapping[color.name];

    // Add variation per company using seeded random
    const riskScore = Math.min(
      100,
      Math.max(
        0,
        colorRisk.baseScore + (rng.next() - 0.5) * colorRisk.variance * 2
      )
    );

    companies.push({
      id: `company-${id}`,
      name: `${namePrefix} ${String(id).padStart(3, "0")}`,
      industry: industries[i % industries.length],
      region: regions[i % regions.length],
      logoColor: {
        name: color.name,
        hex: color.hex,
      },
      risk: {
        score: Math.round(riskScore),
        tier: getRiskTier(riskScore),
        confidence: getConfidence(riskScore),
      },
      exposure: Math.round(rng.next() * 1000000) + 100000,
    });

    id++;
  }

  return companies;
}

export const mockCompanies = generateCompanies();

// Derive color risk summaries
export function getColorRiskSummaries() {
  const summaries: Record<string, any> = {};

  colors.forEach((color) => {
    const companiesWithColor = mockCompanies.filter(
      (c) => c.logoColor.name === color.name
    );

    const scores = companiesWithColor.map((c) => c.risk.score);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    const tierCounts: Record<string, number> = {
      Low: 0,
      Medium: 0,
      High: 0,
      Severe: 0,
    };

    companiesWithColor.forEach((c) => {
      tierCounts[c.risk.tier]++;
    });

    summaries[color.name] = {
      colorName: color.name,
      hex: color.hex,
      avgRiskScore: avgScore,
      tier: getRiskTier(avgScore),
      confidence: getConfidence(avgScore),
      companyCount: companiesWithColor.length,
      tierBreakdown: tierCounts,
    };
  });

  return summaries;
}
