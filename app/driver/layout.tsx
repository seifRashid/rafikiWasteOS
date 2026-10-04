import React from "react";
import Link from "next/link";
import { Truck, ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Driver & Crew Leader Portal | Rafiki WasteOS",
  description: "Mobile-first digital manifests, GPS check-ins, photo verification, and weigh scale entries.",
};

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0F172A] sm:bg-[#F1F5F3] flex flex-col justify-center items-center p-0 sm:p-4">
      {/* Container simulating native phone app shell on larger screens */}
      <div className="w-full sm:max-w-md min-h-screen sm:min-h-[844px] bg-[#F6F8F7] sm:rounded-[24px] sm:shadow-2xl sm:border sm:border-[#E3E9E5] flex flex-col overflow-hidden relative">
        {/* Driver Top Native-Style Status Bar */}
        <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#00993F] text-white flex items-center justify-center font-black text-xs shadow-xs">
              R
            </div>
            <div>
              <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Driver & Crew Portal</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-[#00993F]/20 text-[#ADE4C1] border border-[#00993F]/40 uppercase">
                  Field
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Rafiki WasteOS Mobile
              </div>
            </div>
          </div>

          {/* Supervisor Switch to Management ERP */}
          <Link
            href="/"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors border border-slate-700"
            title="Switch to Management Command Centre"
          >
            <Shield className="w-3 h-3 text-[#FECA36]" />
            <span>ERP</span>
          </Link>
        </header>

        {/* Dynamic Driver Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
