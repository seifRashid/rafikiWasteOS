import React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getClientsWithStats, getFleetAndAssets, getRoutesWithAssignments } from "@/server/db/queries";
import { db } from "@/server/db";
import { collectionJobs, clients as clientsTable, vehicles as vehiclesTable } from "@/server/db/schema";
import { eq, and, or, desc } from "drizzle-orm";
import { formatDate, formatWeight } from "@/lib/utils";
import { isClientCollectedOnDay, getDerivedFrequency } from "@/lib/schedule-utils";
import { AssignTruckModal } from "@/components/operations/assign-truck-modal";
import { EditClientScheduleModal } from "@/components/operations/edit-client-schedule-modal";

export const dynamic = "force-dynamic";

export default async function OperationsSchedulePage() {
  const [clients, scheduledJobsData, fleetData, routesData] = await Promise.all([
    getClientsWithStats(),
    db
      .select({
        job: collectionJobs,
        client: clientsTable,
        vehicle: vehiclesTable,
      })
      .from(collectionJobs)
      .leftJoin(clientsTable, eq(collectionJobs.clientId, clientsTable.id))
      .leftJoin(vehiclesTable, eq(collectionJobs.vehicleId, vehiclesTable.id))
      .where(
        and(
          eq(collectionJobs.isDeleted, false),
          or(eq(collectionJobs.status, "scheduled"), eq(collectionJobs.status, "assigned"))
        )
      )
      .orderBy(desc(collectionJobs.scheduledAt)),
    getFleetAndAssets(),
    getRoutesWithAssignments(),
  ]);

  // Operating days configuration
  const weekDays = [
    { name: "Monday", shift: "06:00 - 14:00" },
    { name: "Tuesday", shift: "06:00 - 14:00" },
    { name: "Wednesday", shift: "06:00 - 14:00" },
    { name: "Thursday", shift: "06:00 - 14:00" },
    { name: "Friday", shift: "06:00 - 15:00" },
    { name: "Saturday", shift: "07:00 - 13:00" },
  ];
  const days = weekDays.map((day) => {
    const clientsOnDay = clients.filter((c) => isClientCollectedOnDay(c, day.name));
    return {
      name: day.name,
      count: clientsOnDay.length,
      shift: day.shift,
      clientNames: clientsOnDay.map((c) => c.name),
    };
  });

  // Separate on-demand requests (notes containing "[On-Demand") from routine runs
  const onDemandRequests = scheduledJobsData.filter(
    ({ job }) => job.notes && job.notes.includes("[On-Demand")
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Recurring Collection Schedule & Dispatch Plan
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Weekly pickup schedules, shift rotations, and on-demand client booking requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" dot>
            Weekly Master Manifest Active
          </Badge>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {days.map((day) => (
          <div
            key={day.name}
            className="p-3.5 rounded-card bg-white border border-[#E3E9E5] shadow-sm text-center"
          >
            <span className="text-xs font-bold text-slate-800 block">{day.name}</span>
            <span className="font-mono text-xl font-extrabold text-[#00993F] block mt-1">
              {day.count}
            </span>
            <span className="text-[10px] text-[#9CA3AF] block">Stops Booked</span>
            <span className="text-[9px] font-semibold text-[#08A6BA] mt-1 block">
              {day.shift}
            </span>
          </div>
        ))}
      </div>

      {/* On-Demand & Special Client Requests Section */}
      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="p-4 border-b border-[#F0F4F2] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FECA36]" />
              <span>On-Demand Client Pickup Requests ({onDemandRequests.length})</span>
            </h3>
            <p className="text-[11px] text-[#4B5563] mt-0.5">
              Unscheduled / extra runs submitted by clients through the Client Portal.
            </p>
          </div>

          <Link
            href="/operations/routes"
            className="text-xs font-bold text-[#00993F] hover:text-[#008235] flex items-center gap-1"
          >
            <span>Assign in Route Dispatch</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {onDemandRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
                <tr className="text-[#4B5563] font-semibold">
                  <th className="py-2.5 px-4">Job Code</th>
                  <th className="py-2.5 px-4">Client Organization</th>
                  <th className="py-2.5 px-4">Target Date & Window</th>
                  <th className="py-2.5 px-4">Stream</th>
                  <th className="py-2.5 px-4">Est. Quantity</th>
                  <th className="py-2.5 px-4">Client Notes</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F2]">
                {onDemandRequests.map(({ job, client, vehicle }) => (
                  <tr key={job.id} className="hover:bg-[#F6F8F7] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {job.jobNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{client?.name || "Client"}</div>
                      <div className="text-[11px] text-[#4B5563] truncate max-w-xs">
                        {client?.physicalAddress}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <div>{formatDate(job.scheduledAt)}</div>
                      <div className="text-[11px] text-[#08A6BA] font-semibold">
                        {new Date(job.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize font-semibold text-slate-800">
                      {job.wasteStream}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#00993F]">
                      ~{formatWeight(job.expectedQuantityKg, "kg")}
                    </td>
                    <td className="py-3 px-4 text-[#4B5563] max-w-xs truncate">
                      {job.notes?.replace("[On-Demand Request]", "").trim() || "Extra pickup requested"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <AssignTruckModal
                        job={{
                          id: job.id,
                          jobNumber: job.jobNumber,
                          clientName: client?.name || "Client Organization",
                          physicalAddress: client?.physicalAddress || "Collection Location",
                          scheduledAt: job.scheduledAt,
                          wasteStream: job.wasteStream,
                          expectedQuantityKg: job.expectedQuantityKg || "0",
                          notes: job.notes,
                          status: job.status,
                          vehicleId: job.vehicleId,
                          vehiclePlate: vehicle?.plateNumber,
                          driverName: job.driverName,
                          routeId: job.routeId,
                        }}
                        availableVehicles={fleetData.vehicles}
                        availableRoutes={routesData.map((r) => ({
                          id: r.route.id,
                          routeCode: r.route.routeCode,
                          name: r.route.name,
                          driverName: r.route.driverName,
                        }))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-[#9CA3AF]">
            <CheckCircle2 className="w-5 h-5 text-[#00993F] mx-auto mb-1" />
            <p>No pending on-demand pickup requests at this time. All stops are on regular contracted schedules.</p>
          </div>
        )}
      </div>

      {/* Client Recurring Schedules Table */}
      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="p-4 border-b border-[#F0F4F2] flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Customer Regular Contract Slots ({clients.length})
          </h3>
          <span className="text-[11px] text-[#00993F] font-semibold">
            All Contracts Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
              <tr className="text-[#4B5563] font-semibold">
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4">Collection Days</th>
                <th className="py-3 px-4">Address / Area</th>
                <th className="py-3 px-4">Containers</th>
                <th className="py-3 px-4">Assigned Route</th>
                <th className="py-3 px-4 text-right">Schedule Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-[#F6F8F7] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3 px-4 capitalize">
                    <Badge variant="neutral">{c.customerType}</Badge>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#00993F]">
                    {getDerivedFrequency(c.collectionDays || c.collectionFrequency)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {c.collectionDays ? (
                        c.collectionDays.split(",").map((d) => (
                          <span
                            key={d.trim()}
                            className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF9F1] text-[#00682B] border border-[#ADE4C1]"
                          >
                            {d.trim().slice(0, 3)}
                          </span>
                        ))
                      ) : c.collectionFrequency === "daily" ? (
                        <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF9F1] text-[#00682B] border border-[#ADE4C1]">
                          Mon - Sat (Daily)
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#9CA3AF] italic">Not set</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#4B5563] truncate max-w-xs">
                    {c.physicalAddress}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{c.binCount || "Standard Bins"}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                    RT-NAI-01 (Truck KDD 482B)
                  </td>
                  <td className="py-3 px-4 text-right">
                    <EditClientScheduleModal
                      client={{
                        id: c.id,
                        name: c.name,
                        collectionFrequency: c.collectionFrequency,
                        collectionDays: c.collectionDays || null,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

