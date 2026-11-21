"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Truck } from "lucide-react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    };

    if (typeof navigator !== "undefined" && navigator.onLine) {
      setIsOnline(true);
    }

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-card border border-[#E3E9E5] p-6 sm:p-8 shadow-card-elevated text-center space-y-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFF8D6] border border-[#FECA36]/60 text-[#785608] mx-auto">
          <WifiOff className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EDF9F1] border border-[#ADE4C1] text-[10px] font-bold uppercase tracking-wider text-[#00682B]">
            <Truck className="w-3 h-3" />
            <span>Rafiki WasteOS PWA</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isOnline ? "Connection Restored!" : "You Are Currently Offline"}
          </h1>
          <p className="text-xs text-[#4B5563] leading-relaxed">
            {isOnline
              ? "Reconnecting you to Rafiki WasteOS and syncing the latest operational records..."
              : "No active internet connection was detected. Your installed Rafiki WasteOS app will automatically reconnect as soon as signal returns."}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full bg-[#00993F] hover:bg-[#008235] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    </div>
  );
}
