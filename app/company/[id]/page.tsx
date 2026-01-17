"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { mockCompanies, getColorRiskSummaries } from "@/data/mockData";
import { PageHeader } from "@/components/navigation";
import { RiskBadge, ColorSwatch, StatCard, ConfidenceIndicator } from "@/components/shared";
import { calculateWhatIfRisk } from "@/lib/utils";
import Link from "next/link";
import { WhatIfResult } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params.id as string;
  const company = mockCompanies.find((c) => c.id === companyId);
  const [selectedWhatIfColor, setSelectedWhatIfColor] = useState<string | null>(null);
  const [whatIfResult, setWhatIfResult] = useState<WhatIfResult | null>(null);

  if (!company) {
    return (
      <>
        <PageHeader title="Company Not Found" />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Card>
            <CardContent className="pt-8 text-center">
              <p className="text-gray-600 mb-4">The company you're looking for doesn't exist.</p>
              <Link href="/portfolio">
                <Button variant="outline">Back to Portfolio</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const summaries = getColorRiskSummaries();
  const colorList = Object.keys(summaries);

  const handleWhatIf = (colorName: string) => {
    setSelectedWhatIfColor(colorName);
    const result = calculateWhatIfRisk(company, colorName);
    setWhatIfResult(result);
  };

  return (
    <>
      <PageHeader title={company.name} description={company.industry} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Company Profile */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <h3 className="text-xs font-semibold text-gray-700 uppercase mb-3">
                    Logo Colour
                  </h3>
                  <ColorSwatch
                    hex={company.logoColor.hex}
                    name={company.logoColor.name}
                    size="lg"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase mb-3">
                    Current Risk Profile
                  </h3>
                  <RiskBadge
                    score={company.risk.score}
                    tier={company.risk.tier}
                    confidence={company.risk.confidence}
                    size="lg"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <StatCard
                    label="Industry"
                    value={company.industry || "N/A"}
                    subtext={company.region}
                  />

                  {company.exposure && (
                    <StatCard
                      label="Exposure"
                      value={`$${(company.exposure / 1000000).toFixed(2)}M`}
                    />
                  )}

                  <StatCard
                    label="Confidence Level"
                    value={company.risk.confidence}
                    subtext="in risk assessment"
                  />
                </div>

                <Link href="/portfolio">
                  <Button variant="outline" className="w-full">
                    Back to Portfolio
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* What-If Simulation */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">What-If Colour Impact</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  Explore how changing your logo colour could impact your risk profile.
                </p>

                {/* Disclaimer */}
                <div className="mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-900">
                    <strong>Disclaimer:</strong> This is an analytical signal and should be
                    used alongside other risk factors. It does not constitute a formal risk
                    assessment or recommendation.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Colour Picker */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Select a New Colour</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                    {colorList.map((colorName) => (
                      <Button
                        key={colorName}
                        onClick={() => handleWhatIf(colorName)}
                        disabled={colorName === company.logoColor.name}
                        variant={
                          selectedWhatIfColor === colorName
                            ? "default"
                            : colorName === company.logoColor.name
                              ? "outline"
                              : "outline"
                        }
                        className={`flex flex-col items-center gap-2 h-auto py-3 ${
                          colorName === company.logoColor.name
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded border border-gray-300 shadow-sm"
                          style={{
                            backgroundColor: (summaries[colorName] as any).hex,
                          }}
                        />
                        <span className="text-xs font-medium text-gray-700 text-center">
                          {colorName}
                        </span>
                        {colorName === company.logoColor.name && (
                          <span className="text-xs text-gray-600">Current</span>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* What-If Results */}
                {whatIfResult && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Impact Analysis</h3>

                    <div className="space-y-4">
                      {/* Current State */}
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-xs font-semibold text-gray-700 uppercase mb-3">
                            Current State
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded border border-gray-300"
                                style={{ backgroundColor: whatIfResult.currentColor.hex }}
                              />
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {whatIfResult.currentColor.name}
                                </div>
                                <div className="text-xs text-gray-600">Current colour</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">
                                {whatIfResult.currentRisk}
                              </div>
                              <div className="text-xs text-gray-600">risk points</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Arrow */}
                      <div className="flex justify-center">
                        <div className="text-2xl text-gray-400">↓</div>
                      </div>

                      {/* Proposed State */}
                      <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                          <div className="text-xs font-semibold text-gray-700 uppercase mb-3">
                            Proposed State
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded border border-gray-300"
                                style={{ backgroundColor: whatIfResult.proposedColor.hex }}
                              />
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {whatIfResult.proposedColor.name}
                                </div>
                                <div className="text-xs text-gray-600">Proposed colour</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">
                                {whatIfResult.proposedRisk}
                              </div>
                              <div className="text-xs text-gray-600">risk points</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Delta */}
                      <Card
                        className={`${
                          whatIfResult.delta > 0
                            ? "border-red-200 bg-red-50"
                            : "border-green-200 bg-green-50"
                        }`}
                      >
                        <CardContent className="pt-6">
                          <div className="text-xs font-semibold text-gray-700 uppercase mb-3">
                            Impact
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div
                                className={`text-sm font-medium ${
                                  whatIfResult.delta > 0
                                    ? "text-red-900"
                                    : "text-green-900"
                                }`}
                              >
                                {whatIfResult.delta > 0
                                  ? "Risk would increase"
                                  : "Risk would decrease"}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {whatIfResult.description}
                              </p>
                            </div>
                            <div
                              className={`text-right ${
                                whatIfResult.delta > 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              <div className="text-2xl font-bold">
                                {whatIfResult.delta > 0 ? "+" : ""}
                                {whatIfResult.delta}
                              </div>
                              <div className="text-xs">points</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Confidence */}
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">
                          Prediction Confidence
                        </h4>
                        <ConfidenceIndicator level={whatIfResult.confidence} />
                        <p className="text-xs text-gray-600 mt-3">
                          Based on historical colour risk data from your portfolio.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!whatIfResult && (
                  <div className="border-t border-gray-200 pt-6 text-center">
                    <p className="text-gray-500">
                      Select a colour above to see the impact analysis.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
