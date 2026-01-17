"use client";

import { useState } from "react";
import { getColorRiskSummaries } from "@/data/mockData";
import { PageHeader } from "@/components/navigation";
import { RiskBadge, ColorSwatch, StatCard, ConfidenceIndicator } from "@/components/shared";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ColorRiskSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OverviewPage() {
  const summaries = getColorRiskSummaries();
  const [selectedColor, setSelectedColor] = useState<ColorRiskSummary | null>(null);

  // Sort by risk score descending
  const sortedColors = Object.values(summaries).sort(
    (a, b) => b.avgRiskScore - a.avgRiskScore
  ) as ColorRiskSummary[];

  const selectedColorData = selectedColor || sortedColors[0];

  // Prepare data for distribution chart
  const chartData = sortedColors.map((color) => ({
    name: color.colorName,
    "Avg Risk": color.avgRiskScore,
    "Company Count": color.companyCount,
  }));

  // Risk distribution by tier for selected color
  const tierDistribution = [
    { name: "Low", value: selectedColorData.tierBreakdown.Low },
    { name: "Medium", value: selectedColorData.tierBreakdown.Medium },
    { name: "High", value: selectedColorData.tierBreakdown.High },
    { name: "Severe", value: selectedColorData.tierBreakdown.Severe },
  ];

  return (
    <>
      <PageHeader
        title="Colour Risk Explorer"
        description="View insurance risk levels associated with different logo colours"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Risk Distribution Chart */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Average Risk Score by Colour</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Avg Risk" fill="#EF4444" />
                <Bar dataKey="Company Count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Left: Ranked List */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Ranked Colours by Risk</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {sortedColors.map((color) => (
                    <li
                      key={color.colorName}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-4 cursor-pointer transition-colors ${
                        selectedColorData.colorName === color.colorName
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <ColorSwatch
                            hex={color.hex}
                            name={color.colorName}
                            size="md"
                          />
                          <div className="flex-1">
                            <div className="text-sm text-gray-600">
                              {color.companyCount} companies
                            </div>
                          </div>
                        </div>
                        <RiskBadge
                          score={color.avgRiskScore}
                          tier={color.tier}
                          confidence={color.confidence}
                          size="sm"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right: Detail Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded border border-gray-300"
                    style={{ backgroundColor: selectedColorData.hex }}
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedColorData.colorName}
                    </h3>
                    <p className="text-xs text-gray-500">{selectedColorData.hex}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatCard
                  label="Risk Score"
                  value={selectedColorData.avgRiskScore}
                  subtext={selectedColorData.tier}
                />

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700 uppercase">
                      Confidence
                    </span>
                    <ConfidenceIndicator level={selectedColorData.confidence} />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">
                    Risk Tier Distribution
                  </h4>
                  <div className="space-y-2">
                    {tierDistribution.map((tier) => (
                      <div key={tier.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">{tier.name}</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {tier.value} companies
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (tier.value / selectedColorData.companyCount) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <StatCard label="Total Companies" value={selectedColorData.companyCount} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
