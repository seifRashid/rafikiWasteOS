"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { registerAdminUserAction } from "@/server/actions/auth";
import {
  ShieldCheck,
  KeyRound,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  ArrowRight,
  Shield,
  Building2,
} from "lucide-react";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Administrator password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create credentials in Neon Auth
      const authRes = await authClient.signUp.email({
        email: email.trim().toLowerCase(),
        password,
        name: fullName.trim(),
      });

      if (authRes.error) {
        setError(authRes.error.message || "Failed to create authentication credentials.");
        setLoading(false);
        return;
      }

      const authUserId = authRes.data?.user?.id;

      // 2. Register application user profile with 'super_admin' role and 'active' status
      const profileRes = await registerAdminUserAction({
        authUserId,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        adminKey: adminKey.trim(),
        depotLocation: "Executive HQ",
      });

      if (!profileRes.success) {
        setError(profileRes.error || "Failed to register administrator privileges.");
        setLoading(false);
        return;
      }

      // 3. Immediately active, redirect to Executive Dashboard
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      console.error("[Admin Register Error]:", err);
      setError("An unexpected error occurred during administrator enrollment.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-card border-2 border-[#111827]/10 p-6 sm:p-8 shadow-modal relative overflow-hidden">
      {/* Top Accent Strip */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FECA36] via-[#00993F] to-[#111827]" />

      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-[16px] bg-[#111827] text-[#FECA36] mb-3 shadow-md">
          <KeyRound className="w-6 h-6" />
        </div>
        <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#111827] text-white mb-2">
          Executive Privilege
        </div>
        <h1 className="text-2xl font-black text-[#111827] tracking-tight">Provision Administrator</h1>
        <p className="text-sm text-[#4B5563] mt-1 font-medium">
          Create a Super Administrator account with unrestricted platform control.
        </p>
      </div>

      {/* Security Disclaimer Banner */}
      <div className="mb-5 p-3 rounded-[14px] bg-[#FFF8D6] border border-[#FECA36] flex items-start gap-2.5 text-xs text-[#785608]">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#FECA36]" />
        <div>
          <span className="font-bold">Authorization Notice:</span> Admin enrollment requires the master
          organization setup key. Unauthorized attempts are logged with client IP telemetry.
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-[14px] bg-[#FEF2F2] border border-[#EF4444] flex items-start gap-2.5 text-xs text-[#991B1B] animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#EF4444]" />
          <div>
            <span className="font-bold">Enrollment Error:</span> {error}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1">
            Administrator Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Jane Omondi"
              className="w-full pl-10 pr-4 py-2.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-[14px] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1">
            Executive Email Address
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
              placeholder="j.omondi@rafikiwaste.co.ke"
              className="w-full pl-10 pr-4 py-2.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-[14px] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1">
            Contact Phone
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254 700 123456"
              className="w-full pl-10 pr-4 py-2.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-[14px] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1">
            Administrator Setup Key
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FECA36]">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter master authorization key (e.g. RAFIKI-ADMIN-2026)"
              className="w-full pl-10 pr-4 py-2.5 bg-[#FFF8D6]/30 border border-[#FECA36] rounded-[14px] text-sm font-mono text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1">
            Master Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full pl-10 pr-4 py-2.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-[14px] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-[14px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#000000] text-white font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-[#FECA36]" />
              <span>Enroll as Super Administrator</span>
            </>
          )}
        </button>
      </form>

      {/* Switcher & Links */}
      <div className="mt-5 pt-4 border-t border-[#E3E9E5] text-center space-y-2">
        <p className="text-xs text-[#4B5563]">
          Already have an administrator account?{" "}
          <Link href="/admin/login" className="font-bold text-[#111827] hover:underline">
            Admin Sign In here
          </Link>
        </p>

        <div>
          <Link href="/login" className="text-[11px] font-semibold text-[#00993F] hover:underline">
            &larr; Return to Standard Staff Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
