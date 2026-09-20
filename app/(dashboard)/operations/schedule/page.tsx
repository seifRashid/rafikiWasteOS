import React from "react";
import { Calendar, Clock, MapPin, Truck, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getClientsWithStats } from "@/server/db/queries";

export const dynamic = "force-dynamic";

export default async function OperationsSchedulePage() {
  const clients = await getClientsWithStats();

  const days = [
    { name: "Monday", count: 8, shift: "06:00 - 14:00" },
    { name: "Tuesday", count: 6, shift: "06:00 - 14:00" },
    { name: "Wednesday", count: 9, shift: "06:00 - 14:00" },
    { name: "Thursday", count: 7, shift: "06:00 - 14:00" },
    { name: "Friday", count: 11, shift: "06:00 - 15:00" },
    { name: "Saturday", count: 5, shift: "07:00 - 13:00" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Recurring Collection Schedule
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Weekly pickup schedules, shift rotations, and automated service reminders.
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

      {/* Client Recurring Schedules Table */}
      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="p-4 border-b border-[#F0F4F2] flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Customer Regular Collection Slots ({clients.length})
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
                <th className="py-3 px-4">Address / Area</th>
                <th className="py-3 px-4">Containers</th>
                <th className="py-3 px-4">Assigned Route</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-[#F6F8F7] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3 px-4 capitalize">
                    <Badge variant="neutral">{c.customerType}</Badge>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#00993F] capitalize">
                    {c.collectionFrequency.replace("_", " ")}
                  </td>
                  <td className="py-3 px-4 text-[#4B5563] truncate max-w-xs">
                    {c.physicalAddress}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{c.binCount || "Standard Bins"}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                    RT-NAI-01 (Truck KDD 482B)
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00682B]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00993F]" />
                      <span>On Schedule</span>
                    </span>
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
