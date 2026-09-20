import React from "react";
import { getCollectionJobsWithDetails } from "@/server/db/queries";
import { CollectionsView } from "@/components/collections/collections-view";

export const dynamic = "force-dynamic";

export default async function OperationsJobsPage() {
  const jobs = await getCollectionJobsWithDetails();
  return <CollectionsView initialJobs={jobs} />;
}
