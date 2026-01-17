"use client";

import { useEffect, useMemo, useState } from "react";
import { mockCompanies, getColorRiskSummaries } from "@/data/mockData";
import { useComparisonStore } from "@/store";
import { PageHeader } from "@/components/navigation";
import { RiskBadge, ColorSwatch, ConfidenceIndicator } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { calculatePortfolioStats, calculateWhatIfRisk, getRiskColor } from "@/lib/utils";
import { RiskTier } from "@/lib/types";

export default function ComparePage() {
  const { selectedCompanies, toggleCompany, clearSelected } = useComparisonStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [whatIfSelections, setWhatIfSelections] = useState<Record<string, string | null>>({});

  const summaries = getColorRiskSummaries();

  // Responsive breakpoint detection for chart/ticks
  useEffect(() => {
    const onResize = () => setIsSmallScreen(window.innerWidth < 640); // Tailwind 'sm' breakpoint
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Get selected company objects
  const companiesForComparison = useMemo(() => {
    return selectedCompanies
      .map((id) => mockCompanies.find((c) => c.id === id))
      .filter(Boolean) as typeof mockCompanies;
  }, [selectedCompanies]);

  // Filter companies for selection
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return mockCompanies;
    const query = searchQuery.toLowerCase();
    return mockCompanies.filter((c) => c.name.toLowerCase().includes(query));
  }, [searchQuery]);

  // Calculate portfolio stats for comparison
  const portfolioAverage = calculatePortfolioStats(mockCompanies);

  type ChartItem = {
    name: string;
    risk: number;
    industry?: string;
    simulated: boolean;
    tier: RiskTier;
  };

  // Prepare chart data (reflect simulations if present)
  const chartData: ChartItem[] = companiesForComparison.map((company) => {
    const selectedColor = whatIfSelections[company.id];
    if (selectedColor) {
      const result = calculateWhatIfRisk(company, selectedColor);
      const summary = summaries[selectedColor];
      return {
        name: company.name.substring(0, 12),
        risk: result.proposedRisk,
        industry: company.industry,
        simulated: true,
        tier: summary.tier,
      };
    }
    return {
      name: company.name.substring(0, 12),
      risk: company.risk.score,
      industry: company.industry,
      simulated: false,
      tier: company.risk.tier,
    };
  });

  const xAxisAngle = isSmallScreen ? 0 : -45;
  const xAxisHeight = isSmallScreen ? 30 : 80;
  const xAxisAnchor = isSmallScreen ? "middle" : "end";

  return (
    <>
      <PageHeader
        title="Compare Companies"
        description="Select companies to compare their risk profiles side-by-side"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Comparison Chart (if companies selected) */}
        {companiesForComparison.length > 0 && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="text-lg sm:text-xl">Risk Score Comparison</CardTitle>
                <div className="text-xs sm:text-sm text-gray-600">
                  {`Comparing ${companiesForComparison.length} ${
                    companiesForComparison.length !== 1 ? "companies" : "company"
                  }`}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-55 sm:h-65 md:h-75">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={xAxisAngle}
                      textAnchor={xAxisAnchor}
                      height={xAxisHeight}
                      tick={{ fontSize: isSmallScreen ? 11 : 12 }}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: isSmallScreen ? 11 : 12 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border border-gray-300 rounded shadow-lg p-2 text-xs">
                              <p className="font-semibold">{data.name}</p>
                              <p>Risk Score: {data.risk}</p>
                              <p>Industry: {data.industry}</p>
                              {data.simulated && <p className="text-indigo-600">Simulated</p>}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="risk" radius={4}>
                      {chartData.map((entry: ChartItem, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getRiskColor(entry.tier)}
                          fillOpacity={entry.simulated ? 0.55 : 1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Selector */}
          <Card className="h-fit md:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Select Companies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <Input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm"
              />

              {/* Count Badge */}
              {selectedCompanies.length > 0 && (
                <Badge variant="secondary" className="w-full justify-center py-2">
                  {selectedCompanies.length} selected
                </Badge>
              )}

              {/* Company List */}
              <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto">
                {filteredCompanies.map((company) => (
                  <Button
                    key={company.id}
                    onClick={() => toggleCompany(company.id)}
                    variant={selectedCompanies.includes(company.id) ? "default" : "outline"}
                    className="w-full justify-start h-auto py-2"
                  >
                    <div className="text-left">
                      <div className="font-medium">{company.name}</div>
                      <div className="text-xs opacity-70">{company.industry}</div>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Clear Button */}
              {selectedCompanies.length > 0 && (
                <Button
                  onClick={clearSelected}
                  variant="outline"
                  className="w-full"
                >
                  Clear Selection
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Comparison Cards */}
          <div className="md:col-span-3 lg:col-span-3">
            {companiesForComparison.length === 0 ? (
              <Card className="text-center">
                <CardContent className="py-8">
                  <p className="text-gray-500 mb-4">
                    Select companies from the left panel to compare them.
                  </p>
                  <p className="text-sm text-gray-400">
                    You can select multiple companies to view side-by-side.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companiesForComparison.map((company) => {
                  const companyRiskDelta = company.risk.score - portfolioAverage.avgRiskScore;
                  const isAboveAverage = companyRiskDelta > 0;
                  const selectedColor = whatIfSelections[company.id];
                  const whatIf = selectedColor
                    ? calculateWhatIfRisk(company, selectedColor)
                    : null;
                  const simulatedTier = selectedColor ? summaries[selectedColor].tier : null;

                  return (
                    <Card key={company.id}>
                      <CardContent className="pt-6">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {company.name}
                            </h3>
                            <p className="text-sm text-gray-600">{company.industry}</p>
                          </div>
                          <Button
                            onClick={() => toggleCompany(company.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            title="Remove from comparison"
                          >
                            ✕
                          </Button>
                        </div>

                        {/* Logo Color */}
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <ColorSwatch
                            hex={company.logoColor.hex}
                            name={company.logoColor.name}
                            size="md"
                          />
                        </div>

                        {/* Risk Info */}
                        <div className="mb-4">
                          <div className="text-xs font-semibold text-gray-700 uppercase mb-2">
                            Risk Profile
                          </div>
                          <RiskBadge
                            score={company.risk.score}
                            tier={company.risk.tier}
                            size="md"
                          />
                        </div>

                        {/* Portfolio Comparison */}
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <div className="text-xs font-semibold text-gray-700 uppercase mb-2">
                            vs Portfolio Average
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">Your Risk</span>
                              <span className="font-semibold text-gray-900">
                                {company.risk.score}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">Portfolio Avg</span>
                              <span className="font-semibold text-gray-900">
                                {portfolioAverage.avgRiskScore}
                              </span>
                            </div>
                            <div
                              className={`flex items-center justify-between px-2 py-1 rounded ${
                                isAboveAverage ? "bg-red-50" : "bg-green-50"
                              }`}
                            >
                              <span className="text-sm text-gray-700">Difference from Avg</span>
                              <span
                                className={`font-semibold ${
                                  isAboveAverage ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {isAboveAverage ? "+" : ""}
                                {companyRiskDelta}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* What-if: Change Logo Colour */}
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <div className="text-xs font-semibold text-gray-700 uppercase mb-2">
                            Simulate Logo Colour Change
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Select
                              value={selectedColor ?? undefined}
                              onValueChange={(value) =>
                                setWhatIfSelections((prev) => ({ ...prev, [company.id]: value }))
                              }
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Choose a colour" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(summaries).map((colorName) => (
                                  <SelectItem key={colorName} value={colorName}>
                                    {colorName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {selectedColor && (
                              <Button
                                variant="outline"
                                onClick={() =>
                                  setWhatIfSelections((prev) => ({ ...prev, [company.id]: null }))
                                }
                              >
                                Reset
                              </Button>
                            )}
                          </div>

                          {whatIf && simulatedTier && (
                            <div className="mt-3 space-y-2">
                              <div className="text-xs text-gray-600">
                                Proposed colour: <span className="font-medium">{whatIf.proposedColor.name}</span>
                              </div>
                              <RiskBadge score={whatIf.proposedRisk} tier={simulatedTier} size="sm" />
                              <div
                                className={`flex items-center justify-between px-2 py-1 rounded ${
                                  whatIf.delta > 0 ? "bg-red-50" : "bg-green-50"
                                }`}
                              >
                                <span className="text-sm text-gray-700">Change vs Current</span>
                                <span
                                  className={`font-semibold ${
                                    whatIf.delta > 0 ? "text-red-600" : "text-green-600"
                                  }`}
                                >
                                  {whatIf.delta > 0 ? "+" : ""}
                                  {Math.abs(whatIf.delta)}
                                </span>
                              </div>
                              <ConfidenceIndicator level={whatIf.confidence} />
                            </div>
                          )}
                        </div>

                        {/* Confidence */}
                        <div>
                          <div className="text-xs font-semibold text-gray-700 uppercase mb-2">
                            Confidence
                          </div>
                          <ConfidenceIndicator level={company.risk.confidence} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
