"use client";

import React from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { usePwa } from "./pwa-context";

export function PwaStatusBanner() {
  const { isOnline, justReconnected, hasUpdate, applyUpdate } = usePwa();

  if (isOnline && !justReconnected && !hasUpdate) {
    return null;
  }

  return (
    <div className="w-full z-50">
      {/* Offline Warning Banner (Solar Amber with high-contrast dark text) */}
      {!isOnline && (
        <div
          role="status"
          aria-live="assertive"
          className="bg-[#FFF8D6] border-b border-[#FECA36] text-[#785608] px-4 py-2 text-xs font-bold flex items-center justify-center gap-2"
        >
          <WifiOff className="w-3.5 h-3.5 shrink-0 text-[#B8870A]" />
          <span>
            You are offline — showing cached interface. Changes require an active connection to sync.
          </span>
        </div>
      )}

      {/* Reconnected Toast Banner */}
      {isOnline && justReconnected && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#EDF9F1] border-b border-[#ADE4C1] text-[#00682B] px-4 py-2 text-xs font-bold flex items-center justify-center gap-2"
        >
          <Wifi className="w-3.5 h-3.5 shrink-0 text-[#00993F]" />
          <span>Back online — refreshing live Rafiki WasteOS operational data...</span>
        </div>
      )}

      {/* Service Worker Update Ready Banner */}
      {isOnline && hasUpdate && (
        <div
          role="status"
          className="bg-[#EEFBFD] border-b border-[#B6EEF5] text-[#056E7C] px-4 py-2 text-xs font-semibold flex items-center justify-center gap-3"
        >
          <span>A new version of Rafiki WasteOS is ready.</span>
          <button
            type="button"
            onClick={applyUpdate}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#08A6BA] hover:bg-[#068A9B] text-white text-[11px] font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Update Now</span>
          </button>
        </div>
      )}
    </div>
  );
}
