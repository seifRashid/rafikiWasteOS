"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Truck,
  Users,
  Recycle,
  DollarSign,
  BarChart3,
  Settings,
  Smartphone,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  MapPin,
  Calendar,
  Map,
  FileText,
  AlertCircle,
  MessageSquare,
  FileSpreadsheet,
  Layers,
  Scale,
  Sparkles,
  ArrowRightLeft,
  Warehouse,
  Flame,
  Wrench,
  Fuel,
  Package,
  ShieldCheck,
  Building,
  Sliders,
  Shield,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavSubItem {
  name: string;
  href: string;
  badge?: string;
  alert?: boolean;
}

interface NavSection {
  id: string;
  title: string;
  icon: React.ElementType;
  items: NavSubItem[];
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const navSections: NavSection[] = [
    {
      id: "operations",
      title: "OPERATIONS",
      icon: Truck,
      items: [
        { name: "Jobs", href: "/operations/jobs", badge: "6 Active" },
        { name: "Routes", href: "/operations/routes" },
        { name: "Collection Schedule", href: "/operations/schedule" },
        { name: "Map", href: "/operations/map" },
      ],
    },
    {
      id: "customers",
      title: "CUSTOMERS",
      icon: Users,
      items: [
        { name: "Clients", href: "/customers/clients" },
        { name: "Contracts", href: "/customers/contracts" },
        { name: "Service Requests", href: "/customers/requests", badge: "2 New" },
        { name: "Complaints", href: "/customers/complaints" },
        { name: "Invoices", href: "/customers/invoices" },
      ],
    },
    {
      id: "waste",
      title: "WASTE",
      icon: Recycle,
      items: [
        { name: "Waste Records", href: "/waste/records" },
        { name: "Materials", href: "/waste/materials" },
        { name: "Inventory", href: "/waste/inventory" },
        { name: "Processing", href: "/waste/processing" },
        { name: "Sales", href: "/waste/sales" },
      ],
    },
    {
      id: "finance",
      title: "FINANCE",
      icon: DollarSign,
      items: [
        { name: "Overview", href: "/finance/overview" },
        { name: "Invoices", href: "/finance/invoices" },
        { name: "Payments", href: "/finance/payments" },
        { name: "Expenses", href: "/finance/expenses" },
        { name: "Income", href: "/finance/income" },
        { name: "Reports", href: "/finance/reports" },
      ],
    },
    {
      id: "fleet",
      title: "FLEET & ASSETS",
      icon: Truck,
      items: [
        { name: "Vehicles", href: "/fleet/vehicles" },
        { name: "Maintenance", href: "/fleet/maintenance", alert: true },
        { name: "Fuel", href: "/fleet/fuel" },
        { name: "Assets", href: "/fleet/assets" },
      ],
    },
    {
      id: "reports",
      title: "REPORTS",
      icon: BarChart3,
      items: [
        { name: "Operations", href: "/reports/operations" },
        { name: "Waste", href: "/reports/waste" },
        { name: "Financial", href: "/reports/financial" },
        { name: "Environmental", href: "/reports/environmental" },
      ],
    },
    {
      id: "settings",
      title: "SETTINGS",
      icon: Settings,
      items: [
        { name: "Users", href: "/settings/users" },
        { name: "Roles", href: "/settings/roles" },
        { name: "Company", href: "/settings/company" },
        { name: "Waste Types", href: "/settings/waste-types" },
        { name: "System Settings", href: "/settings/system" },
      ],
    },
  ];

  // Keep open sections state. All sections can be open or toggled.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    operations: true,
    customers: true,
    waste: true,
    finance: true,
    fleet: true,
    reports: true,
    settings: true,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside
      className={cn(
        "w-68 bg-white border-r border-[#E3E9E5] flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-hidden",
        className
      )}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-[#E3E9E5] shrink-0 bg-white">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#00993F] text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
            R
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base block">
              Rafiki WasteOS
            </span>
            <span className="text-[10px] text-[#00993F] font-bold tracking-wider uppercase block">
              Circular Economy ERP
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {/* Top-level Dashboard Link */}
        <Link
          href="/"
          className={cn(
            "flex items-center justify-between px-3 py-2 rounded-nested text-xs font-bold transition-all",
            pathname === "/"
              ? "bg-[#00993F] text-white shadow-nav-active font-extrabold"
              : "text-slate-800 hover:bg-[#F0F4F2]"
          )}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className={cn("w-4 h-4", pathname === "/" ? "text-white" : "text-[#00993F]")} />
            <span>Dashboard</span>
          </div>
          <span
            className={cn(
              "text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase",
              pathname === "/" ? "bg-white/20 text-white" : "bg-[#EDF9F1] text-[#00682B]"
            )}
          >
            Live
          </span>
        </Link>

        {/* Dedicated Driver Field View Shortcut */}
        <Link
          href="/field"
          className={cn(
            "flex items-center justify-between px-3 py-2 rounded-nested text-xs font-bold transition-all border",
            pathname === "/field"
              ? "bg-[#08A6BA] text-white border-[#08A6BA] shadow-sm"
              : "bg-[#EEFBFD] text-[#056E7C] border-[#B6EEF5] hover:bg-[#D5F6FA]"
          )}
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Driver Field Mode</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        {/* 7 Operational Groups */}
        {navSections.map((section) => {
          const isOpen = openSections[section.id] ?? true;
          const isSectionActive = section.items.some((item) => pathname === item.href || pathname.startsWith(item.href));

          return (
            <div key={section.id} className="pt-1">
              {/* Group Header Toggle */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-extrabold tracking-wider text-slate-500 hover:text-slate-900 transition-colors uppercase group"
              >
                <div className="flex items-center gap-1.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full", isSectionActive ? "bg-[#00993F]" : "bg-slate-300")} />
                  <span>{section.title}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                )}
              </button>

              {/* Group Sub-Items Tree */}
              {isOpen && (
                <div className="mt-1 ml-2 pl-2 border-l border-[#E3E9E5] space-y-0.5">
                  {section.items.map((item, idx) => {
                    const isLast = idx === section.items.length - 1;
                    const isActive = pathname === item.href || pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between px-2.5 py-1.5 rounded-nested text-xs font-medium transition-all group relative",
                          isActive
                            ? "bg-[#00993F] text-white font-bold shadow-xs"
                            : "text-[#4B5563] hover:bg-[#F0F4F2] hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={cn("text-[10px] font-mono", isActive ? "text-white/70" : "text-slate-400")}>
                            {isLast ? "└──" : "├──"}
                          </span>
                          <span className="truncate">{item.name}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={cn(
                              "text-[9px] px-1.5 py-0.2 rounded-full font-bold",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-[#EDF9F1] text-[#00682B]"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}

                        {item.alert && (
                          <span className="w-2 h-2 rounded-full bg-[#FECA36] ring-2 ring-white" title="Attention" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-[#E3E9E5] shrink-0 bg-[#F6F8F7]">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-nested bg-white border border-[#E3E9E5]">
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-[#ADE4C1]">
            <Image
              src="/avatar_camille.jpg"
              alt="User"
              width={28}
              height={28}
              className="object-cover"
            />
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-xs font-bold text-slate-900 truncate">
              Camille Laurent
            </div>
            <div className="text-[10px] text-[#00993F] font-semibold truncate">
              Operations Director
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
