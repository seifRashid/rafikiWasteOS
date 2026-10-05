"use client";

import React, { useState } from "react";
import { provisionClientUserAction } from "@/server/actions/client-portal";
import { KeyRound, UserPlus, CheckCircle2, AlertCircle, X, Shield, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProvisionPortalModalProps {
  clientId: string;
  clientName: string;
  defaultContactPerson?: string | null;
  defaultEmail?: string | null;
  defaultPhone?: string | null;
}

export function ProvisionPortalModal({
  clientId,
  clientName,
  defaultContactPerson,
  defaultEmail,
  defaultPhone,
}: ProvisionPortalModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState(defaultContactPerson || "");
  const [email, setEmail] = useState(defaultEmail || "");
  const [phone, setPhone] = useState(defaultPhone || "");
  const [role, setRole] = useState<"client_admin" | "client_user">("client_admin");
  const [password, setPassword] = useState("RafikiDemo2026!");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleOpen = () => {
    setError(null);
    setSuccess(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await provisionClientUserAction({
        clientId,
        fullName,
        email,
        phone,
        role,
        tempPassword: password,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          router.refresh();
        }, 2000);
      } else {
        setError(res.error || "Failed to provision client portal access.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-nested bg-[#EDF9F1] text-[#00682B] text-xs font-bold border border-[#ADE4C1] hover:bg-[#D3F3DE] transition-all"
      >
        <KeyRound className="w-3.5 h-3.5" />
        <span>Provision Portal Login</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 border border-[#E3E9E5] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EDF9F1] text-[#00993F] flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Provision Client Portal Access</h3>
                  <p className="text-[11px] text-[#4B5563] truncate max-w-[260px]">{clientName}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#9CA3AF] hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {success ? (
              <div className="p-4 bg-[#EDF9F1] border border-[#ADE4C1] text-[#00682B] rounded-nested text-xs text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 mx-auto" />
                <p className="font-bold">Client Portal Access Provisioned!</p>
                <p className="text-[11px] text-[#4B5563]">
                  Credentials created in Neon Auth and linked to {clientName}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                {error && (
                  <div className="p-3 bg-[#FDE8E8] border border-[#F8B4B4] text-[#E02424] rounded-nested text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Contact Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Login Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Telephone / Mobile</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Client Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 focus:outline-none focus:border-[#00993F]"
                    >
                      <option value="client_admin">Client Admin</option>
                      <option value="client_user">Client User (Read-Only)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Initial Password</label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested font-mono text-slate-900 focus:outline-none focus:border-[#00993F]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F0F4F2] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-3 py-2 rounded-nested bg-[#F0F4F2] text-slate-700 font-semibold hover:bg-[#E3E9E5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-nested bg-[#00993F] text-white font-bold hover:bg-[#008235] disabled:opacity-50"
                  >
                    {loading ? "Provisioning..." : "Create Client Account"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
