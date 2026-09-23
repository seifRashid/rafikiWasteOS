"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Bell,
  Truck,
  Recycle,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Globe,
  Sliders,
  Menu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMobileNav } from "./mobile-nav-context";

export function Header() {
  const { toggleMobileNav } = useMobileNav();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currency, setCurrency] = useState<"KES" | "USD">("KES");

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3E9E5] px-3 md:px-6 py-2.5 md:py-3 flex items-center justify-between gap-2 md:gap-4">
      {/* Mobile Hamburger & Logo */}
      <div className="flex items-center gap-2 md:hidden shrink-0">
        <button
          onClick={toggleMobileNav}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-[#F0F4F2] active:bg-[#E3E9E5] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-slate-800" />
        </button>
        <Link href="/" className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-[#00993F] text-white flex items-center justify-center font-black text-sm shadow-xs">
            R
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-sm hidden xs:inline">
            Rafiki
          </span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xs md:max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search... (⌘K)"
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F6F8F7] border border-[#E3E9E5] rounded-full text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00993F] focus:ring-1 focus:ring-[#00993F] transition-all"
          />
        </div>
      </div>

      {/* Center Live Operational Indicators */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Active Vehicles Telemetry */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEFBFD] border border-[#B6EEF5] text-xs font-semibold text-[#056E7C]">
          <span className="w-2 h-2 rounded-full bg-[#08A6BA] animate-pulse" />
          <Truck className="w-3.5 h-3.5" />
          <span>4 Trucks Operating</span>
        </div>

        {/* Live Diversion Rate Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EDF9F1] border border-[#ADE4C1] text-xs font-semibold text-[#00682B]">
          <Recycle className="w-3.5 h-3.5" />
          <span>68.4% Diversion Rate Today</span>
        </div>

        {/* Currency Switcher */}
        <button
          onClick={() => setCurrency(currency === "KES" ? "USD" : "KES")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F4F2] border border-[#E3E9E5] text-xs font-bold text-[#4B5563] hover:text-[#111827] transition-colors"
          title="Toggle Currency Display"
        >
          <Globe className="w-3.5 h-3.5 text-[#00993F]" />
          <span>{currency}</span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Mobile Field Mode Quick Switch */}
        <Link
          href="/field"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#08A6BA] text-white text-xs font-semibold shadow-sm hover:bg-[#068A9B] transition-all"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Driver View</span>
        </Link>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-full bg-[#F0F4F2] hover:bg-[#E3E9E5] text-[#4B5563] flex items-center justify-center transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#FECA36] absolute top-2 right-2 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-card shadow-modal border border-[#E3E9E5] p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Operational Alerts (3)
                </h4>
                <span className="text-[10px] text-[#00993F] font-semibold cursor-pointer">
                  Mark all read
                </span>
              </div>

              <div className="mt-3 space-y-2.5">
                <div className="flex items-start gap-2.5 p-2 rounded-nested bg-[#FFF8D6]/60 border border-[#FCE38A]">
                  <AlertTriangle className="w-4 h-4 text-[#B8870A] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-[#785608]">Truck KDD 482B</p>
                    <p className="text-[#4B5563] text-[11px]">
                      Service inspection due in 350 km.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-nested bg-[#EDF9F1]/60 border border-[#ADE4C1]">
                  <CheckCircle2 className="w-4 h-4 text-[#00993F] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-[#00682B]">Weighbridge Ticket</p>
                    <p className="text-[#4B5563] text-[11px]">
                      JOB-2026-0891 (Safari Park Hotel) intake net 1,300 kg verified.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-nested bg-[#EEFBFD]/60 border border-[#B6EEF5]">
                  <Truck className="w-4 h-4 text-[#08A6BA] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-[#056E7C]">Route Completed</p>
                    <p className="text-[#4B5563] text-[11px]">
                      Westlands Loop finished 8 of 12 stops on schedule.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#00993F] shrink-0 shadow-xs">
          <Image
            src="/avatar_camille.jpg"
            alt="Profile"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
      </div>
    </header>
  );
}
