import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/server";
import { getClientPortalDashboard } from "@/server/db/client-portal-queries";
import { db } from "@/server/db";
import { clients } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import {
  Leaf,
  Recycle,
  Scale,
  Award,
  Download,
  Share2,
  TreePine,
  Wind,
  ShieldCheck,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatWeight, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientReportsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  let activeClientId = user.clientId;
  if (!activeClientId && (user.isAdmin || user.role === "operations_manager")) {
    const [firstClient] = await db
      .select()
      .from(clients)
      .where(eq(clients.isDeleted, false))
      .limit(1);
    if (firstClient) activeClientId = firstClient.id;
  }

  if (!activeClientId) return null;

  const dashboardData = await getClientPortalDashboard(activeClientId);
  if (!dashboardData) return null;

  const { client, metrics } = dashboardData;

  const totalDivertedKg = metrics.organicWeightKg + metrics.recyclableWeightKg;
  const treesEquivalent = Math.max(1, Math.round((totalDivertedKg / 1000) * 16.5));
  const ghgAvoidedTonnes = ((totalDivertedKg * 0.00062)).toFixed(2);
  const landfillVolumeM3 = ((totalDivertedKg / 350)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ESG & Environmental Impact
          </h1>
          <p className="text-xs text-[#4B5563] mt-1">
            Audited circular economy metrics, landfill diversion rates, and carbon abatement credits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-xs">
            ISO 14001 & ESG Audited
          </Badge>
        </div>
      </div>

      {/* Hero Certificate Card */}
      <div className="bg-linear-to-r from-[#00993F] to-[#007A32] rounded-card p-6 text-white shadow-card-elevated relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FECA36]" />
              <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#FECA36]">
                Sustainability Verification Certificate
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{client.name}</h2>
            <p className="text-xs text-white/80 max-w-xl leading-relaxed">
              Certified that through dedicated source segregation and verified collection routines,
              your organization has achieved a <strong>{metrics.diversionRate}% landfill diversion rate</strong>.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end shrink-0">
            <span className="text-4xl font-black tracking-tight">{metrics.diversionRate}%</span>
            <span className="text-xs text-white/80 uppercase font-mono font-bold">
              Diversion Score
            </span>
          </div>
        </div>
      </div>

      {/* 4 Impact Dimensions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Diverted"
          value={formatWeight(totalDivertedKg, "auto")}
          subtitle="Saved from municipal landfill"
          icon={<Recycle className="w-5 h-5" />}
          accentColor="primary"
        />

        <StatCard
          title="GHG Avoidance"
          value={`${ghgAvoidedTonnes} tCO₂e`}
          subtitle="Methane emissions abated"
          icon={<Wind className="w-5 h-5" />}
          accentColor="cyan"
        />

        <StatCard
          title="Forest Equivalence"
          value={`~${treesEquivalent} Trees`}
          subtitle="Equivalent annual tree absorption"
          icon={<TreePine className="w-5 h-5" />}
          accentColor="primary"
        />

        <StatCard
          title="Landfill Airspace Saved"
          value={`${landfillVolumeM3} m³`}
          subtitle="Compacted waste volume diverted"
          icon={<Scale className="w-5 h-5" />}
          accentColor="neutral"
        />
      </div>

      {/* Stream Diversion Breakdown */}
      <div className="bg-white rounded-card p-6 border border-[#E3E9E5] shadow-card-elevated space-y-6">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-[#F0F4F2] flex items-center gap-2">
          <Leaf className="w-4 h-4 text-[#00993F]" />
          Material Stream Flow & Circular Routing
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Organics */}
          <div className="p-4 rounded-card bg-[#EDF9F1] border border-[#ADE4C1] space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="text-[#00682B] text-sm">Organic Kitchen & Banquet Waste</span>
              <span className="font-mono text-base text-slate-900">
                {formatWeight(metrics.organicWeightKg, "auto")}
              </span>
            </div>
            <p className="text-[#4B5563] leading-relaxed">
              Diverted directly to thermal windrow composting and black soldier fly larvae (BSFL)
              protein conversion, producing organic fertilizer.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-[#00682B]">
              Destination: Central Biological Processing Facility
            </div>
          </div>

          {/* Recyclables */}
          <div className="p-4 rounded-card bg-[#E8F8FA] border border-[#A5E7EE] space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="text-[#067A8A] text-sm">Dry Recyclables (PET, Glass, OCC)</span>
              <span className="font-mono text-base text-slate-900">
                {formatWeight(metrics.recyclableWeightKg, "auto")}
              </span>
            </div>
            <p className="text-[#4B5563] leading-relaxed">
              Transported to the Material Recovery Facility (MRF), sorted by polymer grade, and baled
              for industrial converters.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-[#067A8A]">
              Destination: Rafiki MRF Baling Hub
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
