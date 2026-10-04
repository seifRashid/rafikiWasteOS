import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "amber" | "cyan" | "neutral" | "danger" | "outline";
  dot?: boolean;
}

export function Badge({
  children,
  className,
  variant = "primary",
  dot = false,
  ...props
}: BadgeProps) {
  const variantStyles = {
    primary: "bg-[#EDF9F1] text-[#00682B] border-[#ADE4C1]",
    amber: "bg-[#FFF8D6] text-[#785608] border-[#FCE38A]",
    cyan: "bg-[#EEFBFD] text-[#056E7C] border-[#B6EEF5]",
    neutral: "bg-[#F0F4F2] text-[#4B5563] border-[#E3E9E5]",
    danger: "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]",
    outline: "bg-transparent text-[#111827] border-[#CDD8D1]",
  };

  const dotColors = {
    primary: "bg-[#00993F]",
    amber: "bg-[#FECA36]",
    cyan: "bg-[#08A6BA]",
    neutral: "bg-[#9CA3AF]",
    danger: "bg-[#EF4444]",
    outline: "bg-[#4B5563]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />}
      {children}
    </span>
  );
}
