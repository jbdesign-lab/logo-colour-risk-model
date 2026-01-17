"use client";

import { useState, useMemo } from "react";
import { mockCompanies, getColorRiskSummaries } from "@/data/mockData";
import { PageHeader } from "@/components/navigation";
import {
  RiskBadge,
  ColorSwatch,
  StatCard,
} from "@/components/shared";
import { useFilterStore } from "@/store";
import { filterCompaniesByColorAndSearch, calculatePortfolioStats } from "@/lib/utils";
import { RiskTier } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getRiskColor } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function PortfolioPage() {
  const { selectedColors, searchQuery, toggleColor, setSearchQuery, clearFilters } =
    useFilterStore();
  const [sortBy, setSortBy] = useState<"name" | "risk" | "color">("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [scenarioColor, setScenarioColor] = useState<string | null>(null);
  const itemsPerPage = 10;

  const summaries = getColorRiskSummaries();
  const colorList = Object.keys(summaries);

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return filterCompaniesByColorAndSearch(mockCompanies, selectedColors, searchQuery);
  }, [selectedColors, searchQuery]);

  // Sort companies
  const sortedCompanies = useMemo(() => {
    const sorted = [...filteredCompanies];
    switch (sortBy) {
      case "risk":
        return sorted.sort((a, b) => b.risk.score - a.risk.score);
      case "color":
        return sorted.sort((a, b) => a.logoColor.name.localeCompare(b.logoColor.name));
      case "name":
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [filteredCompanies, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedCompanies.length / itemsPerPage);
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedCompanies.slice(startIndex, endIndex);
  }, [sortedCompanies, currentPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [selectedColors, searchQuery, sortBy]);

  // Calculate portfolio stats
  const stats = calculatePortfolioStats(filteredCompanies);

  // Scenario: simulate changing filtered companies to a selected colour
  const scenarioStats = useMemo(() => {
    if (!scenarioColor) return null;
    const summary = summaries[scenarioColor];
    const count = filteredCompanies.length;
    const breakdown: { Low: number; Medium: number; High: number; Severe: number } = {
      Low: 0,
      Medium: 0,
      High: 0,
      Severe: 0,
    };
    const t = summary.tier as RiskTier;
    breakdown[t] = count;
    const percentages = {
      Low: Math.round((breakdown.Low / Math.max(1, count)) * 100),
      Medium: Math.round((breakdown.Medium / Math.max(1, count)) * 100),
      High: Math.round((breakdown.High / Math.max(1, count)) * 100),
      Severe: Math.round((breakdown.Severe / Math.max(1, count)) * 100),
    };
    return {
      totalCompanies: count,
      avgRiskScore: summary.avgRiskScore,
      tierBreakdown: breakdown,
      percentageByTier: {
        Low: `${percentages.Low}%`,
        Medium: `${percentages.Medium}%`,
        High: `${percentages.High}%`,
        Severe: `${percentages.Severe}%`,
      },
      totalExposure: stats.totalExposure,
    };
  }, [scenarioColor, summaries, filteredCompanies, stats.totalExposure]);

  // Prepare tier distribution data
  const tierDistributionData = [
    { name: "Low", value: stats.tierBreakdown.Low, fill: "#10B981" },
    { name: "Medium", value: stats.tierBreakdown.Medium, fill: "#ffe600" },
    { name: "High", value: stats.tierBreakdown.High, fill: "#f5a733" },
    { name: "Severe", value: stats.tierBreakdown.Severe, fill: "#f53333" },
  ];

  // Scenario vs. Current comparison data
  const comparisonData = scenarioStats
    ? [
        { tier: "Low", Current: stats.tierBreakdown.Low, Scenario: scenarioStats.tierBreakdown.Low },
        { tier: "Medium", Current: stats.tierBreakdown.Medium, Scenario: scenarioStats.tierBreakdown.Medium },
        { tier: "High", Current: stats.tierBreakdown.High, Scenario: scenarioStats.tierBreakdown.High },
        { tier: "Severe", Current: stats.tierBreakdown.Severe, Scenario: scenarioStats.tierBreakdown.Severe },
      ]
    : [];

  return (
    <>
      <PageHeader
        title="Portfolio Dashboard"
        description="Filter and analyse your company portfolio by logo colour"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Key Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            label="Total Companies"
            value={stats.totalCompanies}
            subtext={
              selectedColors.length > 0
                ? `${selectedColors.length} colour${selectedColors.length > 1 ? "s" : ""} selected`
                : "All colours"
            }
          />
          <StatCard
            label="Average Risk"
            value={stats.avgRiskScore}
            subtext="out of 100"
          />
          <StatCard
            label="High/Severe Risk"
            value={stats.tierBreakdown.High + stats.tierBreakdown.Severe}
            subtext={`${Math.round(((stats.tierBreakdown.High + stats.tierBreakdown.Severe) / Math.max(1, stats.totalCompanies)) * 100)}% of portfolio`}
          />
          <StatCard
            label="Total Exposure"
            value={`£${(stats.totalExposure / 1000000).toFixed(1)}M`}
            subtext="aggregate"
          />
        </div>

        {/* Scenario Analysis */}
        {scenarioStats && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Scenario Analysis: {scenarioColor}</CardTitle>
                  <div className="text-xs text-gray-600 mt-1">Simulated impact if filtered companies changed to {scenarioColor}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setScenarioColor(null)}>Reset</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Comparison KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-semibold text-gray-700 uppercase mb-3">Current Portfolio</div>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Avg Risk" value={stats.avgRiskScore} subtext="out of 100" />
                    <StatCard
                      label="High/Severe"
                      value={stats.tierBreakdown.High + stats.tierBreakdown.Severe}
                      subtext={`${Math.round(((stats.tierBreakdown.High + stats.tierBreakdown.Severe) / Math.max(1, stats.totalCompanies)) * 100)}%`}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-700 uppercase mb-3">Scenario: {scenarioColor}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Avg Risk" value={scenarioStats.avgRiskScore} subtext="out of 100" />
                    <StatCard
                      label="High/Severe"
                      value={scenarioStats.tierBreakdown.High + scenarioStats.tierBreakdown.Severe}
                      subtext={`${Math.round(((scenarioStats.tierBreakdown.High + scenarioStats.tierBreakdown.Severe) / Math.max(1, scenarioStats.totalCompanies)) * 100)}%`}
                    />
                  </div>
                </div>
              </div>

              {/* Comparison Chart */}
              <div>
                <div className="text-xs font-semibold text-gray-700 uppercase mb-3">Risk Tier Comparison</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tier" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="Current" fill="#3B82F6" radius={4} />
                    <Bar dataKey="Scenario" fill="#8B5CF6" radius={4} fillOpacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Delta Summary */}
              <div className="flex items-center justify-between px-4 py-3 rounded bg-indigo-50 border border-indigo-200">
                <div className="text-sm font-medium text-gray-700">Average Risk Change</div>
                <div className={`text-lg font-bold ${
                  scenarioStats.avgRiskScore > stats.avgRiskScore ? "text-red-600" : "text-green-600"
                }`}>
                  {scenarioStats.avgRiskScore > stats.avgRiskScore ? "+" : ""}
                  {scenarioStats.avgRiskScore - stats.avgRiskScore} points
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Risk Distribution Chart */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Risk Tier Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={tierDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={4}>
                    {tierDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Percentage Breakdown */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.percentageByTier).map(([tier, percentage]) => (
                  <div key={tier}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{tier}</span>
                      <span className="text-sm font-bold text-gray-900">{percentage}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: percentage,
                          backgroundColor: getRiskColor(tier),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Company List */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Filters */}
          <Card className="h-fit md:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase mb-2 block">
                  Search Companies
                </label>
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Colour Filters */}
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase mb-3 block">
                  Logo Colours
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-2">
                  {colorList.map((color) => (
                    <Button
                      key={color}
                      onClick={() => toggleColor(color)}
                      variant={selectedColors.includes(color) ? "default" : "outline"}
                      className="w-full justify-start text-xs sm:text-sm"
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedColors.length > 0 || searchQuery) && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full text-sm"
                >
                  Clear Filters
                </Button>
              )}

              {/* Scenario Mode */}
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase mb-3 block">
                  Scenario Mode (simulate colour)
                </label>
                <div className="flex items-center gap-2">
                  <Select value={scenarioColor ?? undefined} onValueChange={(val) => setScenarioColor(val)}>
                    <SelectTrigger className="w-full text-xs sm:text-sm">
                      <SelectValue placeholder="Choose a colour to simulate" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorList.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {scenarioColor && (
                    <Button variant="outline" className="text-xs" onClick={() => setScenarioColor(null)}>Reset</Button>
                  )}
                </div>
                {scenarioColor && (
                  <div className="mt-2 text-xs text-gray-600">Active scenario: {scenarioColor}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Company List */}
          <Card className="md:col-span-3">
            <CardHeader className="border-b pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-lg sm:text-xl">Companies ({sortedCompanies.length})</CardTitle>
                <div className="text-xs flex items-center gap-2">
                  <label className="text-gray-600">Sort:</label>
                  <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                    <SelectTrigger className="w-30 sm:w-35 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="risk">Risk Score</SelectItem>
                      <SelectItem value="color">Colour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {sortedCompanies.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No companies match your filters.
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Colour</TableHead>
                        <TableHead>Risk</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCompanies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell className="font-medium text-gray-900">
                            {company.name}
                          </TableCell>
                          <TableCell>
                            <ColorSwatch
                              hex={company.logoColor.hex}
                              name={company.logoColor.name}
                              size="sm"
                            />
                          </TableCell>
                          <TableCell>
                            <RiskBadge
                              score={company.risk.score}
                              tier={company.risk.tier}
                              size="sm"
                            />
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {company.industry || "N/A"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Link
                              href={`/company/${company.id}`}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                            >
                              View
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination Controls */}
                  <div className="border-t border-slate-200 px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, sortedCompanies.length)} of{" "}
                      {sortedCompanies.length}
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          />
                        </PaginationItem>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page} className={Math.abs(page - currentPage) <= 1 ? "" : "hidden sm:inline"}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        {totalPages > 3 && currentPage < totalPages - 1 && (
                          <PaginationItem className="hidden sm:inline">
                            <span className="px-1">...</span>
                          </PaginationItem>
                        )}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                      <div className="sm:hidden text-xs text-gray-600">
                        Page {currentPage} of {totalPages}
                      </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
