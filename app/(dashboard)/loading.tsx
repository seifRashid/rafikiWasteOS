import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading module">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E3E9E5]">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-[#E3E9E5] rounded-lg" />
          <div className="h-3.5 w-96 max-w-full bg-[#E3E9E5]/70 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-28 bg-[#E3E9E5] rounded-full" />
          <div className="h-9 w-36 bg-[#00993F]/20 rounded-full" />
        </div>
      </div>

      {/* KPI Stat Cards Skeleton Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-[20px] border border-[#E3E9E5] p-5 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#F0F4F2]" />
              <div className="h-5 w-14 rounded-full bg-[#EDF9F1]" />
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="h-3 w-28 bg-[#E3E9E5]/80 rounded" />
              <div className="h-7 w-32 bg-[#E3E9E5] rounded-md" />
              <div className="h-2.5 w-40 bg-[#F0F4F2] rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Pills Bar Skeleton */}
      <div className="flex items-center gap-2 overflow-hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-8 rounded-full ${
              i === 0 ? "w-24 bg-[#00993F]/20" : "w-28 bg-white border border-[#E3E9E5]"
            }`}
          />
        ))}
      </div>

      {/* Main Data Table / Content Card Skeleton */}
      <div className="bg-white rounded-[20px] border border-[#E3E9E5] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#F0F4F2] flex items-center justify-between">
          <div className="h-4 w-48 bg-[#E3E9E5] rounded" />
          <div className="h-8 w-56 bg-[#F6F8F7] rounded-full border border-[#E3E9E5]" />
        </div>
        <div className="divide-y divide-[#F0F4F2]">
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-[#F0F4F2] shrink-0" />
                <div className="space-y-1.5 flex-1 max-w-xs">
                  <div className="h-3.5 w-3/4 bg-[#E3E9E5] rounded" />
                  <div className="h-2.5 w-1/2 bg-[#F0F4F2] rounded" />
                </div>
              </div>
              <div className="hidden sm:block h-5 w-20 bg-[#EDF9F1] rounded-full" />
              <div className="h-4 w-16 bg-[#E3E9E5]/80 rounded font-mono" />
              <div className="h-7 w-24 bg-[#F0F4F2] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

