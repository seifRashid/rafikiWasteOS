import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { AppShell } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // If user registered as normal user and is awaiting approval, lock them out of ERP
  if (user.status === "pending_approval") {
    redirect("/pending-approval");
  }

  if (user.status === "suspended" || user.status === "inactive") {
    redirect("/login?error=suspended");
  }

  // Client users must never access internal ERP dashboard
  if (user.isClient) {
    redirect("/portal");
  }

  return <AppShell currentUser={user}>{children}</AppShell>;
}
