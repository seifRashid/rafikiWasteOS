import React from "react";
import Link from "next/link";
import { Recycle, ShieldCheck, Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#F6F8F7] flex flex-col justify-between selection:bg-[#00993F]/20 selection:text-[#00993F]">
      {/* Top Brand Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[#E3E9E5]/80 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5 group transition-transform active:scale-98">
          <div className="w-10 h-10 rounded-[14px] bg-[#00993F] flex items-center justify-center text-white shadow-md shadow-[#00993F]/25 group-hover:bg-[#008235] transition-colors">
            <Recycle className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-[#111827]">
                Rafiki <span className="text-[#00993F]">WasteOS</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#EDF9F1] text-[#00993F] rounded-full border border-[#ADE4C1]">
                v1.2
              </span>
            </div>
            <p className="text-[11px] text-[#4B5563] font-medium leading-none">
              Africa&apos;s Circular Waste &amp; Logistics OS
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#4B5563]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F4F2] border border-[#E3E9E5]">
            <span className="w-2 h-2 rounded-full bg-[#00993F] animate-pulse" />
            Neon PostgreSQL Auth
          </span>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full py-4 px-6 text-center text-xs text-[#9CA3AF] border-t border-[#E3E9E5]/60 bg-white/40">
        <p className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00993F]" />
          <span>Enterprise End-to-End Encrypted Session &bull; ISO 14001 / NEMA Compliant</span>
        </p>
      </footer>
    </div>
  );
}
