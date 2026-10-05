"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { checkApprovalStatusAction } from "@/server/actions/auth";
import {
  Shield,
  ShieldAlert,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        setError(result.error.message || "Invalid administrator credentials.");
        setLoading(false);
        return;
      }

      // Check whether user has administrative privileges
      const statusRes = await checkApprovalStatusAction();

      if (!statusRes.authenticated) {
        setError("Session initialization failed. Please retry.");
        setLoading(false);
        return;
      }

      if (statusRes.role !== "super_admin") {
        setError(
          "Access Restricted: This account does not possess Super Administrator privileges. Please use the Staff Portal."
        );
        await authClient.signOut();
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      console.error("[Admin Login Error]:", err);
      setError("An unexpected error occurred during administrative verification.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-card border-2 border-[#111827]/10 p-6 sm:p-8 shadow-modal relative overflow-hidden">
      {/* Top Accent Strip */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#00993F] via-[#FECA36] to-[#08A6BA]" />

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-[16px] bg-[#111827] text-[#FECA36] mb-3 shadow-md">
          <Shield className="w-6 h-6" />
        </div>
        <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#111827] text-white mb-2">
          Executive Command Portal
        </div>
        <h1 className="text-2xl font-black text-[#111827] tracking-tight">Administrator Login</h1>
        <p className="text-sm text-[#4B5563] mt-1 font-medium">
          Privileged executive access to user permissions, company licensing, and full audit logs.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-[14px] bg-[#FFF8D6] border border-[#FECA36] flex items-start gap-2.5 text-xs text-[#785608] animate-in fade-in duration-200">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#FECA36]" />
          <div>
            <span className="font-bold">Security Notice:</span> {error}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1.5">
            Administrator Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@rafikiwaste.co.ke"
              className="w-full pl-10 pr-4 py-2.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-[14px] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1.5">
            Admin Master Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-[14px] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#4B5563]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-[14px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#000000] text-white font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Shield className="w-4 h-4 text-[#FECA36]" />
              <span>Verify &amp; Enter Command Center</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Fill Admin Demo Login */}
      <div className="mt-5 p-3 rounded-[14px] bg-[#111827]/5 border border-[#111827]/10 flex items-center justify-between">
        <div className="text-left">
          <p className="text-[11px] font-bold text-[#111827] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FECA36]" /> Demo Super Admin
          </p>
          <p className="text-[10px] text-[#4B5563] font-mono">admin@rafikiwaste.co.ke</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEmail("admin@rafikiwaste.co.ke");
            setPassword("RafikiDemo2026!");
          }}
          className="px-3 py-1.5 bg-[#111827] hover:bg-[#1F2937] text-white text-xs font-bold rounded-[8px] transition-colors cursor-pointer"
        >
          Auto-Fill
        </button>
      </div>

      {/* Switcher & Register Links */}
      <div className="mt-5 pt-4 border-t border-[#E3E9E5] space-y-3 text-center">
        <p className="text-xs text-[#4B5563]">
          First-time administrator setup?{" "}
          <Link href="/admin/register" className="font-bold text-[#111827] hover:underline">
            Register with Authorization Key
          </Link>
        </p>

        <div className="pt-1">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00993F] hover:underline"
          >
            <span>&larr; Return to Standard Staff Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
