"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Smartphone,
  Users,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileNav } from "./mobile-nav-context";

export function MobileNav() {
  const pathname = usePathname();
  const { isOpen, toggleMobileNav } = useMobileNav();

  const links = [
    { name: "Command", href: "/", icon: LayoutDashboard },
    { name: "Jobs", href: "/operations/jobs", icon: CheckSquare },
    { name: "Field Mode", href: "/field", icon: Smartphone, highlight: true },
    { name: "Clients", href: "/customers/clients", icon: Users },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E3E9E5] px-2 py-1.5 flex items-center justify-around shadow-sm">
      {links.slice(0, 2).map((link) => {
        const isActive =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors min-w-[56px]",
              isActive ? "text-[#00993F]" : "text-[#9CA3AF] hover:text-[#4B5563]"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{link.name}</span>
          </Link>
        );
      })}

      {/* Center Highlighted Field Mode */}
      {(() => {
        const fieldLink = links[2];
        const isActive = pathname === fieldLink.href || pathname.startsWith(fieldLink.href);
        const Icon = fieldLink.icon;

        return (
          <Link
            href={fieldLink.href}
            className={cn(
              "flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full shadow-lg transition-transform",
              isActive
                ? "bg-[#08A6BA] text-white scale-110"
                : "bg-[#00993F] text-white hover:scale-105 active:scale-95"
            )}
            title="Driver Field Mode"
          >
            <Icon className="w-5 h-5" />
          </Link>
        );
      })()}

      {/* Clients Link */}
      {(() => {
        const clientLink = links[3];
        const isActive = pathname.startsWith(clientLink.href) || pathname.startsWith("/clients");
        const Icon = clientLink.icon;

        return (
          <Link
            href={clientLink.href}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors min-w-[56px]",
              isActive ? "text-[#00993F]" : "text-[#9CA3AF] hover:text-[#4B5563]"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{clientLink.name}</span>
          </Link>
        );
      })()}

      {/* Menu Drawer Toggle Button */}
      <button
        onClick={toggleMobileNav}
        className={cn(
          "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors min-w-[56px]",
          isOpen ? "text-[#00993F]" : "text-[#9CA3AF] hover:text-[#4B5563]"
        )}
        aria-label="Toggle full ERP menu"
      >
        <Menu className="w-4 h-4" />
        <span>Menu</span>
      </button>
    </nav>
  );
}
