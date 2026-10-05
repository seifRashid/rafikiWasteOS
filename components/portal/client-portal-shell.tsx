"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Truck,
  Calendar,
  FileText,
  Leaf,
  Building2,
  LogOut,
  Menu,
  X,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";
import type { FullUserProfile } from "@/lib/auth/server";
import type { Client } from "@/server/db/schema";

interface ClientPortalShellProps {
  currentUser: FullUserProfile;
  client: Client;
  children: React.ReactNode;
}

export function ClientPortalShell({
  currentUser,
  client,
  children,
}: ClientPortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/portal",
      icon: LayoutDashboard,
      active: pathname === "/portal",
    },
    {
      name: "Collection History",
      href: "/portal/collections",
      icon: Truck,
      active: pathname.startsWith("/portal/collections"),
    },
    {
      name: "Pickup Schedule",
      href: "/portal/schedule",
      icon: Calendar,
      active: pathname.startsWith("/portal/schedule"),
    },
    {
      name: "Invoices & Billing",
      href: "/portal/invoices",
      icon: FileText,
      active: pathname.startsWith("/portal/invoices"),
    },
    {
      name: "ESG & Impact",
      href: "/portal/reports",
      icon: Leaf,
      active: pathname.startsWith("/portal/reports"),
    },
    {
      name: "Organization Profile",
      href: "/portal/profile",
      icon: Building2,
      active: pathname.startsWith("/portal/profile"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8F7] flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E3E9E5] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left Brand & Portal Pill */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/portal" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#00993F] flex items-center justify-center text-white font-black text-lg shadow-sm">
                R
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight tracking-tight">
                  Rafiki WasteOS
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#00993F] font-bold">
                  Client Portal
                </span>
              </div>
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 ml-4 pl-4 border-l border-[#E3E9E5]">
              <span className="w-2 h-2 rounded-full bg-[#00993F] animate-pulse" />
              <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">
                {client.name}
              </span>
              <span className="font-mono text-[10px] font-bold bg-[#EDF9F1] text-[#00682B] px-2 py-0.5 rounded-full border border-[#ADE4C1]">
                {client.accountNumber}
              </span>
            </div>
          </div>

          {/* Right User Bar */}
          <div className="flex items-center gap-3">
            {/* If admin is viewing */}
            {currentUser.isAdmin && (
              <Link
                href="/"
                className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#00993F] bg-slate-100 hover:bg-[#EDF9F1] px-2.5 py-1.5 rounded-nested transition-colors"
              >
                <span>Back to Internal ERP</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 bg-[#F0F4F2] px-3 py-1.5 rounded-full border border-[#E3E9E5]">
              <div className="w-6 h-6 rounded-full bg-[#00993F] text-white flex items-center justify-center text-xs font-bold">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-[#4B5563] leading-none">
                  {currentUser.roleTitle || "Client Account"}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-nested text-xs font-bold text-[#E02424] hover:bg-[#FDE8E8] border border-transparent hover:border-[#F8B4B4] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar & Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          {/* Organization Card */}
          <div className="bg-white rounded-card p-4 border border-[#E3E9E5] shadow-card-elevated">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1">
              Active Organization
            </span>
            <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{client.name}</h3>
            <p className="text-xs text-[#4B5563] mt-0.5 line-clamp-1">{client.physicalAddress}</p>
            <div className="mt-3 pt-3 border-t border-[#F0F4F2] flex items-center justify-between text-xs">
              <span className="text-[#9CA3AF]">Tier:</span>
              <span className="font-semibold capitalize text-slate-800">{client.customerType}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-[#9CA3AF]">Frequency:</span>
              <span className="font-semibold capitalize text-[#00993F]">
                {client.collectionFrequency.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="bg-white rounded-card p-3 border border-[#E3E9E5] shadow-card-elevated space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-nested text-xs font-bold transition-all",
                    item.active
                      ? "bg-[#00993F] text-white shadow-xs"
                      : "text-slate-700 hover:bg-[#F0F4F2] hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("w-4 h-4", item.active ? "text-white" : "text-[#4B5563]")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Help & Support Box */}
          <div className="bg-[#EDF9F1] rounded-card p-4 border border-[#ADE4C1] text-xs">
            <span className="font-bold text-[#00682B] block mb-1">Need Service Assistance?</span>
            <p className="text-[#4B5563] text-[11px] leading-relaxed">
              For missed pickups, container repair, or emergency runs, contact your dispatch coordinator:
            </p>
            <div className="mt-2.5 pt-2 border-t border-[#ADE4C1]/60 font-semibold text-slate-800 text-[11px]">
              📞 +254 700 800 900
              <br />
              ✉️ operations@rafikiwaste.co.ke
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full p-4 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E3E9E5]">
                  <span className="font-extrabold text-sm text-slate-900">Client Navigation</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-[#F0F4F2] p-3 rounded-nested text-xs">
                  <span className="font-bold text-slate-900 block">{client.name}</span>
                  <span className="font-mono text-[10px] text-[#00993F]">{client.accountNumber}</span>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-nested text-xs font-bold transition-all",
                          item.active
                            ? "bg-[#00993F] text-white shadow-xs"
                            : "text-slate-700 hover:bg-[#F0F4F2]"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-nested bg-[#FDE8E8] text-[#E02424] text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
