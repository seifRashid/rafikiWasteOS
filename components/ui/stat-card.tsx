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
  accentColor?: "primary" | "amber" | "cyan" | "neutral";
  className?: string;
  children?: React.ReactNode;
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
}: StatCardProps) {
  const accentBorders = {
    primary: "border-l-4 border-l-[#00993F]",
    amber: "border-l-4 border-l-[#FECA36]",
    cyan: "border-l-4 border-l-[#08A6BA]",
    neutral: "border-l-4 border-l-[#CDD8D1]",
  };

  const iconBg = {
    primary: "bg-[#EDF9F1] text-[#00993F]",
    amber: "bg-[#FFF8D6] text-[#B8870A]",
    cyan: "bg-[#EEFBFD] text-[#08A6BA]",
    neutral: "bg-[#F0F4F2] text-[#4B5563]",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-hoverable flex flex-col justify-between transition-all duration-200",
        accentBorders[accentColor],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider block">
            {title}
          </span>
          <div className="text-2xl font-bold font-mono tracking-tight text-[#111827] mt-1">
            {value}
          </div>
        </div>
        {icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-nested flex items-center justify-center shrink-0",
              iconBg[accentColor]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend || children) && (
        <div className="mt-4 pt-3 border-t border-[#F0F4F2] flex items-center justify-between text-xs">
          {trend ? (
            <div className="flex items-center gap-1.5 font-medium">
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full font-semibold",
                  trend.isPositive
                    ? "bg-[#EDF9F1] text-[#00682B]"
                    : "bg-[#FEF2F2] text-[#991B1B]"
                )}
              >
                {trend.value}
              </span>
              {trend.label && <span className="text-[#9CA3AF]">{trend.label}</span>}
            </div>
          ) : (
            <span className="text-[#4B5563] font-medium">{subtitle}</span>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
