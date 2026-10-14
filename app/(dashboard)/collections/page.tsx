import {
  getCollectionJobsWithDetails,
  getClientsWithStats,
  getFleetAndAssets,
} from "@/server/db/queries";
import { syncDateOperations } from "@/server/actions/routes";
import { CollectionsView } from "@/components/collections/collections-view";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  try {
    await syncDateOperations("2026-10-14");
  } catch (e) {
    console.warn("[CollectionsPage] initial syncDateOperations fallback:", e);
  }

  const [jobs, clients, fleet] = await Promise.all([
    getCollectionJobsWithDetails(),
    getClientsWithStats(),
    getFleetAndAssets(),
  ]);

  return (
    <CollectionsView
      initialJobs={jobs}
      clients={clients}
      vehicles={fleet.vehicles}
    />
  );
}
