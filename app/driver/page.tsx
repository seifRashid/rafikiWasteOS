import React from "react";
import { getDriverPortalData } from "@/server/db/driver-queries";
import { DriverFieldView } from "@/components/field/driver-field-view";

export const dynamic = "force-dynamic";

interface DriverPageProps {
  searchParams?: Promise<{
    driver?: string;
    routeId?: string;
    date?: string;
  }>;
}

export default async function DriverPage({ searchParams }: DriverPageProps) {
  const params = searchParams ? await searchParams : undefined;

  const initialData = await getDriverPortalData({
    driverName: params?.driver,
    routeId: params?.routeId,
    targetDate: params?.date,
  });

  return <DriverFieldView initialData={initialData} />;
}
