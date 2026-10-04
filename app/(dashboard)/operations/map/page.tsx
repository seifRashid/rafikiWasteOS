import React from "react";
import { Map, Navigation, Truck, MapPin, Gauge, Fuel, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function OperationsMapPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Live Fleet & Corridor GIS Telematics
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Real-time GPS coordinate telemetry, route corridors and live stop completions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="cyan" dot>
            3 Vehicles Streaming Telematics
          </Badge>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="bg-[#111827] rounded-card border border-[#E3E9E5] overflow-hidden shadow-2xl relative h-[520px] flex flex-col justify-between p-6">
        {/* Top Controls Overlay */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs text-white font-medium flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#08A6BA] animate-ping" />
            <span>Live GPS Satellites: 11 Linked</span>
          </div>

          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/10 text-xs">
            <span className="px-3 py-1 bg-[#00993F] text-white rounded-full font-bold">
              Nairobi Central
            </span>
            <span className="px-3 py-1 text-white/70 hover:text-white font-medium">
              Mombasa Coastal
            </span>
          </div>
        </div>

        {/* Vector SVG Map Rendering */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00993F_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

          <svg className="w-full h-full" viewBox="0 0 600 360">
            {/* Main Corridor Highway */}
            <path
              d="M 60,300 C 140,240 200,320 280,180 S 440,140 540,60"
              fill="none"
              stroke="#08A6BA"
              strokeWidth="4"
              strokeDasharray="8,6"
              className="opacity-80"
            />

            {/* Secondary Loop */}
            <path
              d="M 180,240 Q 240,110 360,190 T 480,220"
              fill="none"
              stroke="#00993F"
              strokeWidth="3"
              strokeDasharray="4,4"
              className="opacity-60"
            />

            {/* Depot Pin */}
            <g transform="translate(60, 300)">
              <circle r="12" fill="#00993F" fillOpacity="0.3" className="animate-ping" />
              <circle r="8" fill="#00993F" />
              <text x="14" y="5" fill="#FFFFFF" fontSize="12" fontWeight="bold">
                Central Depot & Scales
              </text>
            </g>

            {/* Stops Completed */}
            <circle cx="160" cy="255" r="7" fill="#00993F" />
            <text x="175" y="260" fill="#ADE4C1" fontSize="11">Safari Park Hotel (Completed)</text>

            <circle cx="280" cy="180" r="7" fill="#00993F" />
            <text x="295" y="185" fill="#ADE4C1" fontSize="11">Brookside School (Completed)</text>

            {/* In Transit Active Vehicle Pin */}
            <g transform="translate(390, 150)">
              <circle r="16" fill="#FECA36" fillOpacity="0.25" className="animate-ping" />
              <circle r="10" fill="#FECA36" stroke="#000" strokeWidth="2" />
              <rect x="-65" y="-36" width="130" height="26" rx="6" fill="#1F2937" stroke="#FECA36" strokeWidth="1" />
              <text x="0" y="-20" fill="#FECA36" fontSize="10" fontWeight="bold" textAnchor="middle">
                🚚 Truck KDD 482B (38 km/h)
              </text>
            </g>

            {/* Destination Weighbridge Pin */}
            <g transform="translate(540, 60)">
              <circle r="10" fill="#08A6BA" />
              <text x="-160" y="5" fill="#08A6BA" fontSize="12" fontWeight="bold">
                MRF Baling & Sorting Facility
              </text>
            </g>
          </svg>
        </div>

        {/* Bottom Telemetry Card Row */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-nested bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs">
            <span className="text-white/60 text-[10px] uppercase font-bold block">Active Vehicle</span>
            <span className="font-bold text-base text-[#FECA36]">KDD 482B (Isuzu 20m³)</span>
            <div className="text-[11px] text-white/80 mt-1">Driver: Mohammed Bakari • 8/12 stops</div>
          </div>

          <div className="p-3 rounded-nested bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs">
            <span className="text-white/60 text-[10px] uppercase font-bold block">Current Telemetry</span>
            <span className="font-mono text-base font-bold text-[#00993F]">Speed: 38 km/h</span>
            <div className="text-[11px] text-white/80 mt-1">Odometer: 118,650 km • Fuel: 68%</div>
          </div>

          <div className="p-3 rounded-nested bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs">
            <span className="text-white/60 text-[10px] uppercase font-bold block">Next Destination</span>
            <span className="font-bold text-base text-[#08A6BA]">East Africa Bottlers Dock</span>
            <div className="text-[11px] text-white/80 mt-1">ETA: 14:15 • 2.8 Tonnes Expected</div>
          </div>
        </div>
      </div>
    </div>
  );
}
