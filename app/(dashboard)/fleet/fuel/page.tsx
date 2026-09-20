import React from "react";
import { Fuel, TrendingUp, Truck, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function FleetFuelPage() {
  const fuelLogs = [
    {
      date: "18 Sep 2026",
      vehicle: "KDD 482B (Isuzu 20m³)",
      litres: "65.0 L",
      station: "TotalEnergies Industrial Area",
      cost: "14,300.00",
      odometer: "118,520 km",
      efficiency: "2.3 km/L",
    },
    {
      date: "17 Sep 2026",
      vehicle: "KDE 912K (FAW Flatbed)",
      litres: "45.0 L",
      station: "Rubis Kilimani",
      cost: "9,900.00",
      odometer: "84,110 km",
      efficiency: "3.1 km/L",
    },
    {
      date: "16 Sep 2026",
      vehicle: "KDA 304M (Cargo Tuk-Tuk)",
      litres: "12.0 L",
      station: "Shell Mombasa Waterfront",
      cost: "2,640.00",
      odometer: "19,340 km",
      efficiency: "18.5 km/L",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Fleet Fuel & Energy Monitoring
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Diesel consumption logging, station receipts, and km per litre route efficiency.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 rounded-nested bg-[#00993F] text-white text-xs font-semibold shadow-sm hover:bg-[#008235]">
          <Plus className="w-4 h-4" />
          <span>Log Fuel Refill</span>
        </button>
      </div>

      <div className="bg-white rounded-card border border-[#E3E9E5] shadow-card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8F7] border-b border-[#E3E9E5]">
              <tr className="text-[#4B5563] font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Fuel Volume</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">Odometer</th>
                <th className="py-3 px-4">Efficiency</th>
                <th className="py-3 px-4 text-right">Cost (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2]">
              {fuelLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-[#F6F8F7] transition-colors">
                  <td className="py-3.5 px-4 font-medium text-[#4B5563]">{log.date}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{log.vehicle}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#00993F]">{log.litres}</td>
                  <td className="py-3.5 px-4 text-[#4B5563]">{log.station}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">{log.odometer}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant="cyan">{log.efficiency}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(log.cost, "KES")}
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
