import type { Client } from "@/server/db/schema";

export const OPERATING_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type OperatingDay = typeof OPERATING_DAYS[number];

/**
 * Returns the English weekday name for a date (using UTC noon to prevent timezone skew)
 */
export function getWeekdayNameFromDate(dateInput: Date | string): string {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (typeof dateInput === "string") {
    // If format is YYYY-MM-DD
    const parts = dateInput.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
      return dayNames[d.getUTCDay()];
    }
  }
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return dayNames[d.getUTCDay()];
}

/**
 * Determines whether an active client is contracted/scheduled for collection on a specific day of the week
 */
export function isClientCollectedOnDay(
  client: Pick<Client, "isActive" | "isDeleted" | "collectionFrequency" | "collectionDays">,
  dayName: string
): boolean {
  if (!client.isActive || client.isDeleted) return false;

  const targetDay = dayName.trim().toLowerCase();

  // 1. If explicit collectionDays are configured on the client (e.g. "Monday, Wednesday", "Tuesday, Friday")
  if (client.collectionDays && client.collectionDays.trim()) {
    const days = client.collectionDays.split(",").map((d) => d.trim().toLowerCase());
    if (days.includes(targetDay)) return true;
    if (
      (days.includes("daily") || days.includes("all")) &&
      ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].includes(targetDay)
    ) {
      return true;
    }
    return false;
  }

  // 2. Fallback based on collectionFrequency
  const freq = client.collectionFrequency;
  if (freq === "daily") {
    return ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].includes(targetDay);
  }
  if (freq === "weekly") {
    return targetDay === "wednesday";
  }
  if (freq === "twice_weekly") {
    return targetDay === "tuesday" || targetDay === "friday";
  }
  if (freq === "bi_weekly") {
    return targetDay === "wednesday";
  }
  if (freq === "on_demand") {
    return false;
  }

  return false;
}

/**
 * Filters a list of clients to only those whose schedule includes the day of the week for targetDate
 */
export function getDueClientsForDate(clientsList: Client[], targetDateIso: string): Client[] {
  const weekday = getWeekdayNameFromDate(targetDateIso);
  return clientsList.filter((c) => isClientCollectedOnDay(c, weekday));
}

export type WasteStreamType = "organic" | "recyclable" | "residual" | "hazardous" | "electronic";

/**
 * Determines appropriate default waste stream for client based on wasteStreams field and customer type
 */
export function getClientDefaultStream(
  client: Pick<Client, "wasteStreams" | "customerType">
): WasteStreamType {
  const streams = (client.wasteStreams || "").toLowerCase();
  if (streams.includes("organic") || streams.includes("food") || streams.includes("coffee")) {
    return "organic";
  }
  if (
    streams.includes("plastic") ||
    streams.includes("pet") ||
    streams.includes("cardboard") ||
    streams.includes("paper") ||
    streams.includes("recyclable")
  ) {
    return "recyclable";
  }

  switch (client.customerType) {
    case "hotel":
    case "restaurant":
      return "organic";
    case "business":
    case "school":
    case "institution":
      return "recyclable";
    case "government":
      return "residual";
    default:
      return "organic";
  }
}

/**
 * Estimates realistic default collection quantity in kg based on customer type
 */
export function getClientDefaultExpectedKg(client: Pick<Client, "customerType">): string {
  switch (client.customerType) {
    case "government":
      return "2400.00";
    case "hotel":
      return "1200.00";
    case "business":
      return "950.00";
    case "school":
    case "institution":
      return "450.00";
    case "apartment":
      return "420.00";
    case "restaurant":
      return "350.00";
    case "household":
      return "80.00";
    default:
      return "300.00";
  }
}
