"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { checkApprovalStatusAction } from "@/server/actions/auth";
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  ArrowRight,
  Truck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
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
        setError(result.error.message || "Invalid credentials. Please verify your email and password.");
        setLoading(false);
        return;
      }

      // Check if user account is approved or pending
      const statusRes = await checkApprovalStatusAction();

      if (statusRes.authenticated && statusRes.status === "pending_approval") {
        router.push("/pending-approval");
      } else if (statusRes.authenticated && statusRes.status === "suspended") {
        setError("Your account is currently suspended. Please contact your operations supervisor.");
        await authClient.signOut();
        setLoading(false);
        return;
      } else if (statusRes.authenticated && (statusRes.role === "client_admin" || statusRes.role === "client_user")) {
        router.push("/portal");
        router.refresh();
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("[Login Error]:", err);
      setError("An unexpected error occurred during authentication. Please retry.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-card border border-[#E3E9E5] p-6 sm:p-8 shadow-card-elevated">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-[16px] bg-[#EDF9F1] text-[#00993F] mb-3 border border-[#ADE4C1]/60">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-[#111827] tracking-tight">Staff Portal Sign In</h1>
        <p className="text-sm text-[#4B5563] mt-1 font-medium">
          Access your daily collection routes, depot weighbridge, and logistics.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-[14px] bg-[#FFF8D6] border border-[#FECA36] flex items-start gap-2.5 text-xs text-[#785608] animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#FECA36]" />
          <div>
            <span className="font-bold">Authentication Notice:</span> {error}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1.5">
            Operational Email
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
              placeholder="e.g. driver.kamau@rafikiwaste.co.ke"
              className="w-full pl-10 pr-4 py-2.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-[14px] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00993F] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563]">
              Password
            </label>
            <span className="text-[11px] text-[#08A6BA] font-semibold hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>
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
              className="w-full pl-10 pr-10 py-2.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-[14px] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00993F] focus:border-transparent transition-all"
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
          className="w-full py-3 px-4 rounded-[14px] bg-[#00993F] hover:bg-[#008235] active:bg-[#00682B] text-white font-bold text-sm tracking-wide shadow-pill shadow-[#00993F]/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In to Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Fill Demo Logins */}
      <div className="mt-5 p-3 rounded-[14px] bg-[#F6F8F7] border border-[#E3E9E5]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-[#111827] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FECA36]" /> Quick Demo Accounts
          </span>
          <span className="text-[10px] font-mono text-[#9CA3AF]">Pass: RafikiDemo2026!</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setEmail("driver@rafikiwaste.co.ke");
              setPassword("RafikiDemo2026!");
            }}
            className="px-2 py-1 text-left text-[11px] font-medium bg-white hover:bg-[#EDF9F1] hover:text-[#00993F] border border-[#E3E9E5] rounded-[8px] truncate transition-colors"
          >
            🚛 Driver
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("operations@rafikiwaste.co.ke");
              setPassword("RafikiDemo2026!");
            }}
            className="px-2 py-1 text-left text-[11px] font-medium bg-white hover:bg-[#EDF9F1] hover:text-[#00993F] border border-[#E3E9E5] rounded-[8px] truncate transition-colors"
          >
            📋 Operations
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("finance@rafikiwaste.co.ke");
              setPassword("RafikiDemo2026!");
            }}
            className="px-2 py-1 text-left text-[11px] font-medium bg-white hover:bg-[#EDF9F1] hover:text-[#00993F] border border-[#E3E9E5] rounded-[8px] truncate transition-colors"
          >
            💳 Finance
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("mrf@rafikiwaste.co.ke");
              setPassword("RafikiDemo2026!");
            }}
            className="px-2 py-1 text-left text-[11px] font-medium bg-white hover:bg-[#EDF9F1] hover:text-[#00993F] border border-[#E3E9E5] rounded-[8px] truncate transition-colors"
          >
            ⚖️ MRF / Depot
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("fleet@rafikiwaste.co.ke");
              setPassword("RafikiDemo2026!");
            }}
            className="px-2 py-1 text-left text-[11px] font-medium bg-white hover:bg-[#EDF9F1] hover:text-[#00993F] border border-[#E3E9E5] rounded-[8px] truncate transition-colors"
          >
            🔧 Fleet
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("newstaff@rafikiwaste.co.ke");
              setPassword("RafikiDemo2026!");
            }}
            className="px-2 py-1 text-left text-[11px] font-medium bg-white hover:bg-[#FFF8D6] hover:text-[#785608] border border-[#FECA36] rounded-[8px] truncate transition-colors text-[#785608]"
          >
            ⏳ Pending Staff
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("client@safaripark.co.ke");
              setPassword("RafikiDemo2026!");
            }}
            className="col-span-2 px-2 py-1.5 text-center text-[11px] font-bold bg-[#EDF9F1] hover:bg-[#D3F3DE] text-[#00682B] border border-[#ADE4C1] rounded-[8px] truncate transition-colors"
          >
            🏨 Client Portal Demo (Safari Park Hotel)
          </button>
        </div>
      </div>

      {/* Switcher & Register Links */}
      <div className="mt-5 pt-4 border-t border-[#E3E9E5] space-y-3 text-center">
        <p className="text-xs text-[#4B5563]">
          Don&apos;t have an operational account?{" "}
          <Link href="/register" className="font-bold text-[#00993F] hover:underline">
            Register as New Staff
          </Link>
        </p>

        <div className="pt-1">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#08A6BA] hover:text-[#068A9B] hover:underline"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Are you a System Administrator? Sign in here &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
