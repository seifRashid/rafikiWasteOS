"use client";

import React, { useState } from "react";
import { updateClientProfileSelfAction } from "@/server/actions/client-portal";
import { User, Phone, Mail, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import type { Client } from "@/server/db/schema";

interface ClientProfileFormProps {
  client: Client;
}

export function ClientProfileForm({ client }: ClientProfileFormProps) {
  const [contactPerson, setContactPerson] = useState(client.contactPerson || "");
  const [phone, setPhone] = useState(client.phone || "");
  const [email, setEmail] = useState(client.email || "");
  const [notes, setNotes] = useState(client.notes || "");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await updateClientProfileSelfAction({
        contactPerson,
        phone,
        email,
        notes,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(res.error || "Failed to update profile.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="p-3 bg-[#EDF9F1] border border-[#ADE4C1] text-[#00682B] rounded-nested text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Contact and operational details updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#FDE8E8] border border-[#F8B4B4] text-[#E02424] rounded-nested text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-slate-700 font-bold mb-1">
            Primary Contact Person
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-2.5 text-[#9CA3AF]" />
            <input
              type="text"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 focus:outline-none focus:border-[#00993F]"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">
            Contact Telephone / WhatsApp
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3 top-2.5 text-[#9CA3AF]" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 focus:outline-none focus:border-[#00993F]"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-slate-700 font-bold mb-1">
            Billing & Operational Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#9CA3AF]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 focus:outline-none focus:border-[#00993F]"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-slate-700 font-bold mb-1">
            Internal Operations Notes / Gate Instructions
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Back gate access code, security guard contact, loading bay directions..."
            className="w-full p-3 bg-[#F6F8F7] border border-[#E3E9E5] rounded-nested text-slate-900 focus:outline-none focus:border-[#00993F]"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-[#00993F] text-white text-xs font-bold rounded-nested hover:bg-[#008235] transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Contact Information"}
        </button>
      </div>
    </form>
  );
}
