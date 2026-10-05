"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { registerNormalUserAction } from "@/server/actions/auth";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Info,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [depotLocation, setDepotLocation] = useState("Central Transfer Station");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(false);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create account in Neon Auth (Managed Better Auth)
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

      // 2. Register application user profile with 'pending_approval' status
      const profileRes = await registerNormalUserAction({
        authUserId,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        depotLocation,
      });

      if (!profileRes.success) {
        setError(profileRes.error || "Failed to finalize staff profile.");
        setLoading(false);
        return;
      }

      // 3. User is registered as normal user, now routed to pending approval status screen
      router.push("/pending-approval");
    } catch (err: unknown) {
      console.error("[Register Error]:", err);
      setError("An unexpected error occurred during account creation. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-card border border-[#E3E9E5] p-6 sm:p-8 shadow-card-elevated">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-[16px] bg-[#EDF9F1] text-[#00993F] mb-3 border border-[#ADE4C1]/60">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-[#111827] tracking-tight">Staff Registration</h1>
        <p className="text-sm text-[#4B5563] mt-1 font-medium">
          Create an operational account for Rafiki WasteOS haulage &amp; MRF modules.
        </p>
      </div>

      {/* Admin Approval Notice Banner */}
      <div className="mb-5 p-3.5 rounded-[14px] bg-[#F0F4F2] border border-[#ADE4C1] flex items-start gap-2.5 text-xs text-[#111827]">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#00993F]" />
        <div>
          <span className="font-bold text-[#00993F]">Account Approval Policy:</span> Newly registered
          accounts are enrolled as <span className="font-semibold text-[#4B5563]">Normal Users</span> and
          remain pending until reviewed and assigned an operational role by a system administrator.
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-[14px] bg-[#FFF8D6] border border-[#FECA36] flex items-start gap-2.5 text-xs text-[#785608] animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#FECA36]" />
          <div>
            <span className="font-bold">Registration Alert:</span> {error}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1">
            Full Name
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
              placeholder="e.g. Samuel Mutiso"
              className="w-full pl-10 pr-4 py-2.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-[14px] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00993F] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1">
            Work Email Address
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
              placeholder="s.mutiso@rafikiwaste.co.ke"
              className="w-full pl-10 pr-4 py-2.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-[14px] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00993F] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1">
              Mobile Phone
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
                placeholder="+254 712 345678"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-[14px] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00993F] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1">
              Primary Depot
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                <Building2 className="w-4 h-4" />
              </div>
              <select
                value={depotLocation}
                onChange={(e) => setDepotLocation(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-[14px] text-xs font-medium text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00993F] focus:border-transparent transition-all"
              >
                <option value="Central Transfer Station">Central Transfer Station</option>
                <option value="Eastlands MRF Hub">Eastlands MRF Hub</option>
                <option value="Industrial Area Depot">Industrial Area Depot</option>
                <option value="Kilimani Sorting Facility">Kilimani Sorting Facility</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1">
            Choose Password
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
              className="w-full pl-10 pr-4 py-2.5 bg-[#F6F8F7] border border-[#E3E9E5] rounded-[14px] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00993F] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-[14px] bg-[#00993F] hover:bg-[#008235] active:bg-[#00682B] text-white font-bold text-sm tracking-wide shadow-pill shadow-[#00993F]/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Submit Registration</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switcher & Links */}
      <div className="mt-5 pt-4 border-t border-[#E3E9E5] text-center space-y-2">
        <p className="text-xs text-[#4B5563]">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-[#00993F] hover:underline">
            Sign In here
          </Link>
        </p>

        <div>
          <Link
            href="/admin/register"
            className="text-[11px] font-semibold text-[#08A6BA] hover:underline"
          >
            Looking for Administrator Provisioning? Click here &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
