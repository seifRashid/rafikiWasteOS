import React from "react";
import { MessageSquare, Clock, Plus, CheckCircle2, AlertTriangle, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function CustomerRequestsPage() {
  const requests = [
    {
      id: "REQ-0192",
      client: "Safari Park Hotel & Casino",
      type: "Extra Bulk Organic Collection",
      details: "Major wedding conference catering tonight. Requesting emergency afternoon compactor run.",
      date: "Today, 10:30 AM",
      priority: "high",
      status: "pending",
    },
    {
      id: "REQ-0193",
      client: "Brookside International School",
      type: "2 Additional 240L Plastic Bins",
      details: "New term enrollment expansion. Requesting two green recycling bins for junior block.",
      date: "Yesterday, 14:15 PM",
      priority: "medium",
      status: "assigned",
    },
    {
      id: "REQ-0194",
      client: "East Africa Bottlers Logistics",
      type: "Baled Cardboard Special Clearance",
      details: "Warehouse storage capacity full. Need flatbed crane truck for 4 tonnes OCC packaging.",
      date: "18 Sep 2026",
      priority: "normal",
      status: "completed",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Customer Service Requests
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            On-demand collection bookings, additional bins, and special hazardous or bulk clearances.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 rounded-nested bg-[#00993F] text-white text-xs font-semibold shadow-sm hover:bg-[#008235]">
          <Plus className="w-4 h-4" />
          <span>New Customer Request</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="p-5 rounded-card bg-white border border-[#E3E9E5] shadow-card-hoverable flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-[#08A6BA] bg-[#EEFBFD] px-2 py-0.5 rounded-full border border-[#B6EEF5]">
                  {req.id}
                </span>
                <span className="font-bold text-slate-900 text-sm">{req.client}</span>
                <Badge
                  variant={
                    req.priority === "high"
                      ? "amber"
                      : req.priority === "medium"
                      ? "cyan"
                      : "neutral"
                  }
                >
                  {req.priority} priority
                </Badge>
              </div>

              <h4 className="font-bold text-slate-800 text-xs">{req.type}</h4>
              <p className="text-xs text-[#4B5563] mt-1 max-w-2xl">{req.details}</p>
              <div className="text-[11px] text-[#9CA3AF] mt-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Requested: {req.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant={
                  req.status === "completed"
                    ? "primary"
                    : req.status === "assigned"
                    ? "cyan"
                    : "amber"
                }
                dot
              >
                {req.status}
              </Badge>

              {req.status === "pending" && (
                <button className="px-3.5 py-1.5 bg-[#00993F] text-white rounded-nested font-bold text-xs hover:bg-[#008235] transition-all flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Dispatch Job</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
