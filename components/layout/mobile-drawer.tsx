"use client";

import React, { useState, useMemo } from "react";
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
  X,
  Search,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileNav } from "./mobile-nav-context";

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

export function MobileDrawer() {
  const { isOpen, closeMobileNav } = useMobileNav();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter sections and items based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return navSections;
    const query = searchQuery.toLowerCase().trim();

    return navSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            section.title.toLowerCase().includes(query)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [searchQuery, navSections]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMobileNav}
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] bg-white flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Mobile Navigation"
      >
        {/* Drawer Brand Header */}
        <div className="p-4 border-b border-[#E3E9E5] shrink-0 bg-white flex items-center justify-between">
          <Link
            href="/"
            onClick={closeMobileNav}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#00993F] text-white flex items-center justify-center font-black text-xl shadow-md">
              R
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base block leading-tight">
                Rafiki WasteOS
              </span>
              <span className="text-[10px] text-[#00993F] font-bold tracking-wider uppercase block">
                Circular Economy ERP
              </span>
            </div>
          </Link>

          <button
            onClick={closeMobileNav}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-[#F0F4F2] transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Menu Search */}
        <div className="px-4 py-2.5 bg-[#F6F8F7] border-b border-[#E3E9E5]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick jump in menus..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E3E9E5] rounded-full text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00993F] focus:ring-1 focus:ring-[#00993F] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Navigation Content Area */}
        <div className="p-3 space-y-3 flex-1 overflow-y-auto">
          {/* Quick Shortcuts */}
          <div className="space-y-1.5">
            {/* Dashboard Link */}
            <Link
              href="/"
              onClick={closeMobileNav}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-nested text-xs font-bold transition-all min-h-[44px]",
                pathname === "/"
                  ? "bg-[#00993F] text-white shadow-nav-active font-extrabold"
                  : "text-slate-800 hover:bg-[#F0F4F2]"
              )}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard
                  className={cn("w-4 h-4", pathname === "/" ? "text-white" : "text-[#00993F]")}
                />
                <span>Dashboard Command</span>
              </div>
              <span
                className={cn(
                  "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase",
                  pathname === "/" ? "bg-white/20 text-white" : "bg-[#EDF9F1] text-[#00682B]"
                )}
              >
                Live
              </span>
            </Link>

            {/* Field Mode Link */}
            <Link
              href="/field"
              onClick={closeMobileNav}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-nested text-xs font-bold transition-all border min-h-[44px]",
                pathname === "/field"
                  ? "bg-[#08A6BA] text-white border-[#08A6BA] shadow-sm"
                  : "bg-[#EEFBFD] text-[#056E7C] border-[#B6EEF5] hover:bg-[#D5F6FA]"
              )}
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span>Driver Field Mode</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Section Divider */}
          <div className="border-t border-[#E3E9E5] my-2" />

          {/* 7 Operational Modules */}
          {filteredSections.map((section) => {
            const isExpanded = searchQuery.trim() ? true : (openSections[section.id] ?? true);
            const isSectionActive = section.items.some(
              (item) => pathname === item.href || pathname.startsWith(item.href)
            );

            return (
              <div key={section.id} className="pt-1">
                {/* Group Header Toggle */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-2 py-2 text-[11px] font-extrabold tracking-wider text-slate-500 hover:text-slate-900 transition-colors uppercase group min-h-[38px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        isSectionActive ? "bg-[#00993F]" : "bg-slate-300"
                      )}
                    />
                    <span>{section.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
                  )}
                </button>

                {/* Sub-Items */}
                {isExpanded && (
                  <div className="mt-1 ml-2 pl-2 border-l border-[#E3E9E5] space-y-1">
                    {section.items.map((item, idx) => {
                      const isLast = idx === section.items.length - 1;
                      const isActive = pathname === item.href || pathname.startsWith(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMobileNav}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-nested text-xs font-medium transition-all min-h-[40px]",
                            isActive
                              ? "bg-[#00993F] text-white font-bold shadow-xs"
                              : "text-[#4B5563] hover:bg-[#F0F4F2] hover:text-slate-900"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={cn(
                                "text-[11px] font-mono",
                                isActive ? "text-white/70" : "text-slate-400"
                              )}
                            >
                              {isLast ? "└──" : "├──"}
                            </span>
                            <span className="truncate">{item.name}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-[#EDF9F1] text-[#00682B]"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}

                          {item.alert && (
                            <span
                              className="w-2 h-2 rounded-full bg-[#FECA36] ring-2 ring-white"
                              title="Attention"
                            />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {filteredSections.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-400">
              No menu items match &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        {/* Footer / User Profile */}
        <div className="p-3 border-t border-[#E3E9E5] shrink-0 bg-[#F6F8F7]">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-nested bg-white border border-[#E3E9E5]">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#ADE4C1]">
              <Image
                src="/avatar_camille.jpg"
                alt="User"
                width={32}
                height={32}
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
    </>
  );
}
