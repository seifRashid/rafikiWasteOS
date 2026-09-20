import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with emerging market (KES/USD) support
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: "KES" | "USD" = "KES",
  compact: boolean = false
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `${currency} 0`;
  }
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;

  if (compact && Math.abs(numeric) >= 1_000_000) {
    return `${currency} ${(numeric / 1_000_000).toFixed(1)}M`;
  }
  if (compact && Math.abs(numeric) >= 1_000) {
    return `${currency} ${(numeric / 1_000).toFixed(0)}k`;
  }

  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
    currencyDisplay: "narrowSymbol",
  }).format(numeric).replace("Ksh", "KES ");
}

/**
 * Format weights in kilograms or metric tonnes
 */
export function formatWeight(
  kg: number | string | null | undefined,
  unit: "kg" | "tonnes" | "auto" = "auto"
): string {
  if (kg === null || kg === undefined || isNaN(Number(kg))) {
    return "0 kg";
  }
  const numericKg = typeof kg === "string" ? parseFloat(kg) : kg;

  if (unit === "tonnes" || (unit === "auto" && Math.abs(numericKg) >= 1000)) {
    const tonnes = numericKg / 1000;
    return `${tonnes.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} t`;
  }

  return `${numericKg.toLocaleString("en-US", { maximumFractionDigits: 1 })} kg`;
}

/**
 * Format date in readable operational format (e.g., "20 Sep 2026, 08:30")
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(d);
}

/**
 * Format date only (e.g., "20 Sep 2026")
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}
