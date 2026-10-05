import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getClientOrganization } from "@/server/db/client-portal-queries";
import { ClientPortalShell } from "@/components/portal/client-portal-shell";
import { db } from "@/server/db";
import { clients } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.status === "pending_approval") {
    redirect("/pending-approval");
  }

  if (user.status === "suspended" || user.status === "inactive") {
    redirect("/login?error=suspended");
  }

  let activeClientId = user.clientId;

  // If a Super Admin or internal manager navigates to /portal to test/preview
  if (!activeClientId && (user.isAdmin || user.role === "operations_manager")) {
    const [firstClient] = await db
      .select()
      .from(clients)
      .where(eq(clients.isDeleted, false))
      .limit(1);

    if (firstClient) {
      activeClientId = firstClient.id;
    }
  }

  if (!activeClientId) {
    return (
      <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center p-4">
        <div className="bg-white rounded-card p-8 border border-[#E3E9E5] max-w-md w-full text-center space-y-4 shadow-card-elevated">
          <div className="w-12 h-12 rounded-full bg-[#FDE8E8] text-[#E02424] flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Client Profile Unlinked</h2>
          <p className="text-xs text-[#4B5563] leading-relaxed">
            Your user account ({user.email}) is currently not linked to a registered client organization.
            Please reach out to Rafiki WasteOS support or your administrator.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-[#00993F] text-white text-xs font-bold rounded-nested hover:bg-[#008235]"
          >
            Return to Main Workspace
          </a>
        </div>
      </div>
    );
  }

  const client = await getClientOrganization(activeClientId);

  if (!client) {
    return (
      <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center p-4">
        <div className="bg-white rounded-card p-8 border border-[#E3E9E5] max-w-md w-full text-center space-y-4 shadow-card-elevated">
          <h2 className="text-lg font-extrabold text-slate-900">Organization Record Not Found</h2>
          <p className="text-xs text-[#4B5563]">
            Unable to retrieve the organization record associated with your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClientPortalShell currentUser={user} client={client}>
      {children}
    </ClientPortalShell>
  );
}
