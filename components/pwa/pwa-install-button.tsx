"use client";

import React, { useState } from "react";
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from "lucide-react";
import { usePwa } from "./pwa-context";

interface PwaInstallButtonProps {
  compact?: boolean;
  className?: string;
}

export function PwaInstallButton({ compact = false, className = "" }: PwaInstallButtonProps) {
  const { canInstall, isStandalone, promptInstall } = usePwa();
  const [showIosModal, setShowIosModal] = useState(false);

  if (isStandalone || !canInstall) {
    return null;
  }

  const handleInstallClick = async () => {
    const outcome = await promptInstall();
    if (outcome === "ios-instructions") {
      setShowIosModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-[#EDF9F1] hover:bg-[#D3F3DE] text-[#00682B] border border-[#ADE4C1] font-bold transition-all cursor-pointer ${
          compact ? "px-2.5 py-1.5 text-[11px] min-h-[36px]" : "px-3.5 py-2 text-xs min-h-[40px]"
        } ${className}`}
        title="Install Rafiki WasteOS as an App"
        aria-label="Install Rafiki WasteOS App"
      >
        <Download className="w-3.5 h-3.5 text-[#00993F] shrink-0" />
        <span>{compact ? "Install" : "Install App"}</span>
      </button>

      {/* iOS Safari Add to Home Screen Instructions Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-sm w-full p-6 border border-[#E3E9E5] shadow-modal space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#00993F] text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Install Rafiki WasteOS</h3>
                  <p className="text-[11px] text-[#4B5563]">iPhone &amp; iPad App Setup</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-[#F0F4F2]"
                aria-label="Close install guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="space-y-3 text-xs text-[#4B5563]">
              <li className="flex items-start gap-2.5 p-2.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
                <span className="w-5 h-5 rounded-full bg-[#00993F] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  Tap the <strong className="text-slate-900 inline-flex items-center gap-1"><Share className="w-3 h-3 text-[#08A6BA]" /> Share</strong> button in Safari&apos;s toolbar.
                </div>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
                <span className="w-5 h-5 rounded-full bg-[#00993F] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  Scroll down and tap <strong className="text-slate-900 inline-flex items-center gap-1"><PlusSquare className="w-3 h-3 text-[#00993F]" /> Add to Home Screen</strong>.
                </div>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-nested bg-[#EDF9F1] border border-[#ADE4C1] text-[#00682B]">
                <CheckCircle2 className="w-4 h-4 text-[#00993F] shrink-0 mt-0.5" />
                <span>
                  Tap <strong>Add</strong> — Rafiki WasteOS will launch in its own standalone app window!
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIosModal(false)}
              className="w-full py-2.5 min-h-[44px] rounded-full bg-[#00993F] hover:bg-[#008235] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
