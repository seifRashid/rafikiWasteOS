import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { MobileDrawer } from "./mobile-drawer";
import { MobileNavProvider } from "./mobile-nav-context";

import type { FullUserProfile } from "@/lib/auth/server";

interface AppShellProps {
  children: React.ReactNode;
  currentUser?: FullUserProfile;
}

export function AppShell({ children, currentUser }: AppShellProps) {
  return (
    <MobileNavProvider>
      <div className="min-h-screen bg-[#F6F8F7] flex flex-col md:flex-row antialiased">
        {/* Desktop Sidebar (hidden on mobile) */}
        <Sidebar className="hidden md:flex" currentUser={currentUser} />

        {/* Mobile Slide-over Drawer */}
        <MobileDrawer currentUser={currentUser} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <Header currentUser={currentUser} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </MobileNavProvider>
  );
}
