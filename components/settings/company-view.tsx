"use client";

import React, { useState } from "react";
import {
  Building2,
  ShieldCheck,
  Award,
  FileText,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Save,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Truck,
  Scale,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CompanyView() {
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "Rafiki WasteOS Logistics Ltd.",
    tradingName: "Rafiki WasteOS",
    registrationNumber: "CPR/2024/89124",
    taxPin: "P051892341M",
    vatRegistered: true,
    nemaLicenseNumber: "NEMA/WTL/2026/0481",
    nemaExpiry: "2026-12-31",
    countyPermit: "NCC/ENV/2026-9921",
    countyExpiry: "2026-12-31",
    epraPermit: "EPRA/FLT/2025-012",
    address: "Enterprise Road, Industrial Area, Plot 48",
    city: "Nairobi",
    country: "Kenya",
    postalCode: "00501",
    dispatchPhone: "+254 700 123 456",
    billingEmail: "accounts@rafikiwaste.co.ke",
    supportEmail: "support@rafikiwaste.co.ke",
    primaryCurrency: "KES",
  });

  const [depots, setDepots] = useState([
    {
      id: "depot-1",
      name: "Central Transfer Station & Weighbridge",
      address: "Thika Road, Kasarani, Nairobi",
      type: "Depot & 60T Weighbridge",
      activeVehicles: 5,
      capacityTons: 120,
    },
    {
      id: "depot-2",
      name: "Dandora Material Recovery Facility (MRF)",
      address: "Dandora Phase 2, Nairobi",
      type: "Sorting & Baling Hub",
      activeVehicles: 3,
      capacityTons: 85,
    },
    {
      id: "depot-3",
      name: "Mombasa Waterfront Recovery Hub",
      address: "Shimanzi Industrial Area, Mombasa",
      type: "Marine Plastic & Scrap Depot",
      activeVehicles: 2,
      capacityTons: 40,
    },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="space-y-6">
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-4 flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">Company profile and regulatory licenses saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Legal Entity & Registration</h2>
                <p className="text-xs text-muted-foreground">Corporate identification, tax information, and business premises</p>
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-xs self-start sm:self-auto"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">Company Legal Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">Operating Brand Name</label>
              <input
                type="text"
                value={formData.tradingName}
                onChange={(e) => setFormData({ ...formData, tradingName: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">Incorporation / Reg No.</label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full text-sm font-mono px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">KRA PIN / Tax Identifier</label>
              <input
                type="text"
                value={formData.taxPin}
                onChange={(e) => setFormData({ ...formData, taxPin: e.target.value })}
                className="w-full text-sm font-mono px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">Primary Operating Currency</label>
              <select
                value={formData.primaryCurrency}
                onChange={(e) => setFormData({ ...formData, primaryCurrency: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="KES">Kenyan Shilling (KES)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="UGX">Ugandan Shilling (UGX)</option>
                <option value="TZS">Tanzanian Shilling (TZS)</option>
                <option value="GHS">Ghanaian Cedi (GHS)</option>
                <option value="ZAR">South African Rand (ZAR)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">Dispatch Hotline</label>
              <input
                type="text"
                value={formData.dispatchPhone}
                onChange={(e) => setFormData({ ...formData, dispatchPhone: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">Billing & Invoicing Email</label>
              <input
                type="email"
                value={formData.billingEmail}
                onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">Physical Headquarters</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Regulatory Licenses & Compliance */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Environmental & Waste Transport Licenses</h2>
              <p className="text-xs text-muted-foreground">National and municipal statutory permits required for waste operations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* NEMA Card */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">NEMA Kenya</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Verified Active
                </span>
              </div>
              <p className="text-xs font-bold text-foreground">Waste Transportation Licence</p>
              <input
                type="text"
                value={formData.nemaLicenseNumber}
                onChange={(e) => setFormData({ ...formData, nemaLicenseNumber: e.target.value })}
                className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-emerald-200 rounded-md font-semibold text-foreground"
              />
              <p className="text-[11px] text-muted-foreground">Expires: {formData.nemaExpiry}</p>
            </div>

            {/* County Permit Card */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">County Government</span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Renewed 2026
                </span>
              </div>
              <p className="text-xs font-bold text-foreground">Waste Handler & Collection Permit</p>
              <input
                type="text"
                value={formData.countyPermit}
                onChange={(e) => setFormData({ ...formData, countyPermit: e.target.value })}
                className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-blue-200 rounded-md font-semibold text-foreground"
              />
              <p className="text-[11px] text-muted-foreground">Expires: {formData.countyExpiry}</p>
            </div>

            {/* EPRA Card */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">EPRA Transport</span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Fleet Clearance
                </span>
              </div>
              <p className="text-xs font-bold text-foreground">Heavy Commercial Vehicle Haulage</p>
              <input
                type="text"
                value={formData.epraPermit}
                onChange={(e) => setFormData({ ...formData, epraPermit: e.target.value })}
                className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-amber-200 rounded-md font-semibold text-foreground"
              />
              <p className="text-[11px] text-muted-foreground">Status: Annual inspection certified</p>
            </div>
          </div>
        </div>

        {/* Operational Depots & MRF Hubs */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Operational Depots & MRFs</h2>
                <p className="text-xs text-muted-foreground">Fixed sorting facilities, weighbridges, and vehicle parking yards</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {depots.map((depot) => (
              <div key={depot.id} className="p-4 rounded-xl border border-border bg-muted/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary font-mono">{depot.type}</span>
                  <span className="text-[10px] font-semibold bg-white border border-border px-2 py-0.5 rounded-full">
                    {depot.capacityTons}T Daily Cap
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground">{depot.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                  {depot.address}
                </p>
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    {depot.activeVehicles} Trucks Stationed
                  </span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Scale className="w-3 h-3" />
                    Scale Online
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
