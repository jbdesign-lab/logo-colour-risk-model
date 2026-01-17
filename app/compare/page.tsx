"use client";

import { useMemo, useState } from "react";
import { mockCompanies, getColorRiskSummaries } from "@/data/mockData";
import { useComparisonStore } from "@/store";
import { PageHeader } from "@/components/navigation";
import { RiskBadge, ColorSwatch, ConfidenceIndicator } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { calculatePortfolioStats } from "@/lib/utils";

export default function ComparePage() {
  const { selectedCompanies, toggleCompany, clearSelected } = useComparisonStore();
  const [searchQuery, setSearchQuery] = useState("");

  const summaries = getColorRiskSummaries();

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

  // Prepare chart data
  const chartData = companiesForComparison.map((company) => ({
    name: company.name.substring(0, 12),
    risk: company.risk.score,
    industry: company.industry,
  }));

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
                  Comparing {companiesForComparison.length} compan
                  {companiesForComparison.length !== 1 ? "ies" : "y"}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border border-gray-300 rounded shadow-lg p-2 text-xs">
                            <p className="font-semibold">{data.name}</p>
                            <p>Risk Score: {data.risk}</p>
                            <p>Industry: {data.industry}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="risk" radius={4}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#EF4444" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
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
          <div className="lg:col-span-3">
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
                            confidence={company.risk.confidence}
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
                              <span className="text-sm text-gray-700">Delta</span>
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
