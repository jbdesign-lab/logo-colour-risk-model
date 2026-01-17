import { RiskTier, Confidence } from "@/lib/types";
import { getTierBgColor, getTierTextColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface RiskBadgeProps {
  score: number;
  tier: RiskTier;
  confidence?: Confidence;
  size?: "sm" | "md" | "lg";
}

export function RiskBadge({
  score,
  tier,
  confidence = "Medium",
  size = "md",
}: RiskBadgeProps) {
  const bgColor = getTierBgColor(tier);
  const textColor = getTierTextColor(tier);

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2",
    lg: "text-sm px-4 py-3",
  };

  return (
    <Badge className={`${bgColor} ${textColor} ${sizeClasses[size]} font-bold border-0`}>
      <div className="flex flex-col gap-0.5">
        <span>{tier}</span>
        <span className="text-xs font-medium opacity-90">{score} pts</span>
      </div>
    </Badge>
  );
}

interface ColorSwatchProps {
  hex: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

export function ColorSwatch({ hex, name, size = "md" }: ColorSwatchProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizeClasses[size]} rounded border-2 border-gray-300 shadow-sm`}
        style={{ backgroundColor: hex }}
        title={hex}
      />
      <span className="text-sm font-semibold text-gray-800">{name}</span>
    </div>
  );
}

interface ConfidenceIndicatorProps {
  level: Confidence;
}

export function ConfidenceIndicator({ level }: ConfidenceIndicatorProps) {
  const colors = {
    Low: "bg-amber-100 text-amber-900 border-amber-200",
    Medium: "bg-blue-100 text-blue-900 border-blue-200",
    High: "bg-emerald-100 text-emerald-900 border-emerald-200",
  };

  return (
    <span className={`inline-block px-3 py-1 rounded text-xs font-bold border ${colors[level]}`}>
      {level}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, subtext, icon }: StatCardProps) {
  return (
    <Card className="p-0 border-l-4 border-l-[#005eff]">
      <CardContent className="pt-4 pb-4">
        {icon && <div className="mb-2">{icon}</div>}
        <div className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-1">
          {label}
        </div>
        <div className="text-2xl font-bold text-[#0a1264]">{value}</div>
        {subtext && <div className="text-xs text-gray-600 mt-1 font-medium">{subtext}</div>}
      </CardContent>
    </Card>
  );
}
