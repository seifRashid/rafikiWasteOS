"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Smartphone,
  Recycle,
  Leaf,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { name: "Command", href: "/", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Field Mode", href: "/field", icon: Smartphone, highlight: true },
    { name: "Jobs", href: "/collections", icon: CheckSquare },
    { name: "Impact", href: "/impact", icon: Leaf },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E3E9E5] px-2 py-2 flex items-center justify-around">
      {links.map((link) => {
        const isActive =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        const Icon = link.icon;

        if (link.highlight) {
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full shadow-lg transition-transform",
                isActive
                  ? "bg-[#08A6BA] text-white scale-110"
                  : "bg-[#00993F] text-white hover:scale-105"
              )}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors",
              isActive ? "text-[#00993F]" : "text-[#9CA3AF] hover:text-[#4B5563]"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
