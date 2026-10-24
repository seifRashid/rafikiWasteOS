import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: "primary" | "amber" | "cyan" | "neutral" | "blue" | "purple";
  className?: string;
  children?: React.ReactNode;
  progressPercent?: number;
  secondaryValue?: string | number;
}

/**
 * Circular progress ring with glowing tip indicator dot and center percentage
 * Faithfully styled after the top-right circular metric in the reference image
 */
function CircularProgressGauge({
  value,
  percent,
  isPositive,
  accentColor,
}: {
  value: string;
  percent?: number;
  isPositive?: boolean;
  accentColor: "primary" | "amber" | "cyan" | "neutral" | "blue" | "purple";
}) {
  // Extract numeric percentage
  const num = typeof percent === "number"
    ? percent
    : (() => {
        const cleaned = value.replace(/[^0-9.]/g, "");
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 35 : parsed;
      })();

  // Calculate arc fraction for visual balance (18% to 88% of circle)
  const arcFraction = (() => {
    if (num <= 5) return 0.18;
    if (num <= 15) return 0.24;
    if (num <= 30) return 0.36;
    if (num <= 50) return 0.52;
    if (num <= 75) return 0.72;
    return 0.86;
  })();

  const radius = 16;
  const circumference = 2 * Math.PI * radius; // ~100.53
  const strokeDashoffset = circumference * (1 - arcFraction);

  // Position of tip indicator dot (starts at top 12 o'clock / -90 deg)
  const angleDeg = arcFraction * 360 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;
  const dotX = 22 + radius * Math.cos(angleRad);
  const dotY = 22 + radius * Math.sin(angleRad);

  const colors = {
    primary: { stroke: "#00993F", track: "#EDF9F1", dot: "#00993F", dotGlow: "rgba(0,153,63,0.35)" },
    cyan: { stroke: "#08A6BA", track: "#EEFBFD", dot: "#08A6BA", dotGlow: "rgba(8,166,186,0.35)" },
    amber: { stroke: "#FECA36", track: "#FFF8D6", dot: "#D97706", dotGlow: "rgba(254,202,54,0.4)" },
    neutral: { stroke: "#64748B", track: "#F1F5F9", dot: "#475569", dotGlow: "rgba(100,116,139,0.3)" },
    blue: { stroke: "#2563EB", track: "#EFF6FF", dot: "#2563EB", dotGlow: "rgba(37,99,235,0.35)" },
    purple: { stroke: "#7C3AED", track: "#F5F3FF", dot: "#7C3AED", dotGlow: "rgba(124,58,237,0.35)" },
  }[accentColor] || { stroke: "#00993F", track: "#EDF9F1", dot: "#00993F", dotGlow: "rgba(0,153,63,0.35)" };

  const isNeg = isPositive === false || value.trim().startsWith("-");

  return (
    <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
      <svg className="w-11 h-11 transform -rotate-90 origin-center" viewBox="0 0 44 44">
        {/* Background Track */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={colors.track}
          strokeWidth="2.8"
        />
        {/* Active Arc */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="3.2"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
        {/* Indicator dot at tip of the arc */}
        <circle
          cx={dotX}
          cy={dotY}
          r="3"
          fill={colors.dot}
          style={{ filter: `drop-shadow(0 0 2px ${colors.dotGlow})` }}
        />
      </svg>
      {/* Centered percentage text */}
      <span
        className={cn(
          "absolute text-[10px] font-extrabold tracking-tight",
          isNeg ? "text-[#EF4444]" : "text-slate-700"
        )}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Distinctive right-edge accent notch with smooth concave curved fillets
 * Faithfully reproduces the tactile colored tab notch seen in the reference image
 */
function RightEdgeNotch({
  accentColor,
}: {
  accentColor: "primary" | "amber" | "cyan" | "neutral" | "blue" | "purple";
}) {
  const tabColors = {
    primary: "#00993F",
    cyan: "#08A6BA",
    amber: "#FECA36",
    neutral: "#64748B",
    blue: "#2563EB",
    purple: "#7C3AED",
  }[accentColor] || "#00993F";

  return (
    <svg
      className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-16 pointer-events-none transition-transform duration-200 group-hover:scale-y-110"
      viewBox="0 0 14 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M 14 0 C 14 8, 8 16, 2 20 L 2 44 C 8 48, 14 56, 14 64 L 14 0 Z"
        fill={tabColors}
      />
      <path
        d="M 14 0 C 14 8, 8 16, 2 20 L 2 44 C 8 48, 14 56, 14 64"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = "primary",
  className,
  children,
  progressPercent,
  secondaryValue,
}: StatCardProps) {
  // Support formatting splits like "200 - 42" or "3 / 4" matching the reference image typography
  const splitMatch =
    typeof value === "string" && !value.includes("KES")
      ? value.match(/^([^\s\-\/]+)\s*([-\/])\s*(.+)$/)
      : null;

  return (
    <div
      className={cn(
        "relative bg-white rounded-card p-5 sm:p-5.5 pr-6 sm:pr-7 border border-[#E3E9E5] shadow-card-hoverable flex flex-col justify-between overflow-hidden group transition-all duration-200",
        className
      )}
    >
      {/* Tactile Right-Edge Inset Tab Notch */}
      <RightEdgeNotch accentColor={accentColor} />

      {/* Top Row: Clean Minimalist Line Icon (Left) + Circular Progress Ring / Badge (Right) */}
      <div className="flex items-start justify-between gap-3">
        {icon ? (
          <div className="text-slate-800 transition-transform duration-200 group-hover:scale-105">
            {icon}
          </div>
        ) : (
          <div className="w-5 h-5" />
        )}

        {trend ? (
          <CircularProgressGauge
            value={trend.value}
            percent={progressPercent}
            isPositive={trend.isPositive}
            accentColor={accentColor}
          />
        ) : progressPercent !== undefined ? (
          <CircularProgressGauge
            value={`${progressPercent}%`}
            percent={progressPercent}
            isPositive={true}
            accentColor={accentColor}
          />
        ) : children ? (
          <div className="shrink-0">{children}</div>
        ) : null}
      </div>

      {/* Middle & Bottom: Title, Bold Split Value, and Context Subtitle */}
      <div className="mt-4">
        {/* Label */}
        <span className="text-[13px] font-medium text-slate-500 block leading-tight">
          {title}
        </span>

        {/* Large Prominent Metric */}
        <div className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mt-1 flex items-baseline gap-2 font-mono sm:font-sans">
          {secondaryValue !== undefined ? (
            <>
              <span>{value}</span>
              <span className="text-slate-400 font-bold text-lg sm:text-xl">
                - {secondaryValue}
              </span>
            </>
          ) : splitMatch ? (
            <>
              <span>{splitMatch[1]}</span>
              <span className="text-slate-400 font-bold text-lg sm:text-xl">
                {splitMatch[2]} {splitMatch[3]}
              </span>
            </>
          ) : (
            <span>{value}</span>
          )}
        </div>

        {/* Subtitle / Context Note */}
        {(subtitle || (trend?.label && !children)) && (
          <div className="text-[11px] text-slate-400 font-normal mt-1 flex items-center gap-1.5 truncate">
            {subtitle && <span>{subtitle}</span>}
            {trend?.label && (
              <span className="text-[#9CA3AF]">• {trend.label}</span>
            )}
          </div>
        )}

        {/* Extra children rendered at bottom if not in header */}
        {children && trend && <div className="mt-2.5 pt-2 border-t border-[#F0F4F2] text-xs">{children}</div>}
      </div>
    </div>
  );
}
