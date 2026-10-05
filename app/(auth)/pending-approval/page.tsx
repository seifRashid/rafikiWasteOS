"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { checkApprovalStatusAction } from "@/server/actions/auth";
import {
  Clock,
  ShieldCheck,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Mail,
  User,
  ArrowRight,
} from "lucide-react";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    authenticated: boolean;
    status?: string;
    role?: string;
    email?: string;
    fullName?: string;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const checkStatus = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const res = await checkApprovalStatusAction();
      setUserInfo(res);

      if (!res.authenticated) {
        router.push("/login");
        return;
      }

      if (res.status === "active") {
        setMessage("Congratulations! Your account has been approved and activated. Redirecting...");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1500);
      } else {
        setMessage("Account status checked: Still awaiting administrator approval and role assignment.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to verify status. Please retry.");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <div className="bg-white rounded-card border border-[#E3E9E5] p-6 sm:p-8 shadow-card-elevated text-center">
      {/* Icon Badge */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-[#FFF8D6] text-[#FECA36] mb-4 border border-[#FECA36]/40 shadow-sm">
        <Clock className="w-8 h-8 text-[#785608] animate-pulse" />
      </div>

      <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFF8D6] text-[#785608] border border-[#FECA36] mb-2">
        Awaiting Administrator Approval
      </div>

      <h1 className="text-2xl font-black text-[#111827] tracking-tight">
        Registration Received
      </h1>

      <p className="text-sm text-[#4B5563] mt-2 font-medium max-w-sm mx-auto">
        Your account has been registered. Before you can access operational manifests and waste logs, an
        administrator must verify your credentials and assign your system role.
      </p>

      {/* Account Details Card */}
      {userInfo?.authenticated && (
        <div className="my-6 p-4 rounded-[16px] bg-[#F6F8F7] border border-[#E3E9E5] text-left text-xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3E9E5]">
            <span className="text-[#4B5563] font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#00993F]" /> Staff Member
            </span>
            <span className="font-bold text-[#111827]">{userInfo.fullName || "Registered User"}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-[#E3E9E5]">
            <span className="text-[#4B5563] font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#08A6BA]" /> Email
            </span>
            <span className="font-mono text-[#111827]">{userInfo.email}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#4B5563] font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FECA36]" /> Assigned Role
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FFF8D6] text-[#785608] border border-[#FECA36]">
              {userInfo.role === "unassigned" ? "Pending Role Assignment" : userInfo.role}
            </span>
          </div>
        </div>
      )}

      {message && (
        <div className="mb-5 p-3 rounded-[12px] bg-[#EDF9F1] border border-[#ADE4C1] text-xs font-semibold text-[#00993F] animate-in fade-in">
          {message}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <button
          onClick={checkStatus}
          disabled={checking}
          className="w-full py-3 px-4 rounded-[14px] bg-[#00993F] hover:bg-[#008235] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-pill shadow-[#00993F]/25 cursor-pointer disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
          <span>{checking ? "Checking Approval Status..." : "Refresh Approval Status"}</span>
        </button>

        <button
          onClick={handleSignOut}
          className="w-full py-2.5 px-4 rounded-[14px] bg-white border border-[#E3E9E5] hover:bg-[#F6F8F7] text-[#4B5563] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out / Switch Account</span>
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-[#E3E9E5] text-[11px] text-[#9CA3AF]">
        Need rapid activation? Contact your Regional Depot Supervisor or send an internal message to{" "}
        <span className="font-semibold text-[#4B5563]">admin@rafikiwaste.co.ke</span>.
      </div>
    </div>
  );
}
