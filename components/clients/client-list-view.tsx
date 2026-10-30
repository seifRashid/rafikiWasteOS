"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Filter,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ChevronRight,
  Check,
  X,
  Building,
  Home,
  GraduationCap,
  Utensils,
  Landmark,
  Sparkles,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getDerivedFrequency } from "@/lib/schedule-utils";
import { createClientAction } from "@/server/actions/clients";
import type { Client } from "@/server/db/schema";

interface ClientListViewProps {
  initialClients: Client[];
}

const getTodayDateString = () => new Date().toISOString().split("T")[0];
const getFutureDateString = (monthsToAdd: number, fromDateStr?: string) => {
  const base = fromDateStr ? new Date(fromDateStr) : new Date();
  if (isNaN(base.getTime())) return "";
  const d = new Date(base);
  d.setMonth(d.getMonth() + monthsToAdd);
  return d.toISOString().split("T")[0];
};

const isClientExpired = (client: Client) => {
  if (!client.contractEndDate) return false;
  const today = new Date().toISOString().split("T")[0];
  return client.contractEndDate < today;
};

export function ClientListView({ initialClients }: ClientListViewProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Client Form State with Contract Duration
  const initialStartDate = getTodayDateString();
  const initialEndDate = getFutureDateString(12, initialStartDate);

  const [formData, setFormData] = useState({
    name: "",
    customerType: "hotel",
    contactPerson: "",
    email: "",
    phone: "",
    physicalAddress: "",
    countyRegion: "Nairobi",
    collectionDays: ["Wednesday"],
    wasteStreams: "Organic, Recyclable",
    binCount: "4 x 240L Wheeled Bins",
    monthlyFee: "35000",
    contractStartDate: initialStartDate,
    contractEndDate: initialEndDate,
  });

  const isDateRangeInvalid = Boolean(
    formData.contractStartDate &&
    formData.contractEndDate &&
    formData.contractEndDate < formData.contractStartDate
  );

  const setPresetDuration = (months: number) => {
    const start = formData.contractStartDate || getTodayDateString();
    const end = getFutureDateString(months, start);
    setFormData((prev) => ({ ...prev, contractStartDate: start, contractEndDate: end }));
  };

  const tiers = [
    { id: "all", label: "All Tiers", icon: Users },
    { id: "hotel", label: "Hotels", icon: Building },
    { id: "apartment", label: "Apartments", icon: Home },
    { id: "restaurant", label: "Restaurants", icon: Utensils },
    { id: "school", label: "Schools", icon: GraduationCap },
    { id: "business", label: "Commercial", icon: Building },
    { id: "government", label: "Government", icon: Landmark },
    { id: "household", label: "Households", icon: Home },
  ];

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.physicalAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = selectedTier === "all" || c.customerType === selectedTier;
    return matchesSearch && matchesTier;
  });

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDateRangeInvalid) {
      alert("Validation Error: Contract end date cannot be earlier than start date.");
      return;
    }

    setLoading(true);
    try {
      const res = await createClientAction({
        ...formData,
        collectionDays: formData.collectionDays.join(", "),
        monthlyFee: parseFloat(formData.monthlyFee) || 0,
      });

      if (res.success && res.data) {
        setSuccessMsg("Client registered successfully!");
        setClients([res.data as Client, ...clients]);
        setTimeout(() => {
          setSuccessMsg(null);
          setIsModalOpen(false);
          const newStart = getTodayDateString();
          setFormData({
            name: "",
            customerType: "hotel",
            contactPerson: "",
            email: "",
            phone: "",
            physicalAddress: "",
            countyRegion: "Nairobi",
            collectionDays: ["Wednesday"],
            wasteStreams: "Organic, Recyclable",
            binCount: "4 x 240L Wheeled Bins",
            monthlyFee: "35000",
            contractStartDate: newStart,
            contractEndDate: getFutureDateString(12, newStart),
          });
        }, 1200);
      } else {
        alert(res.error || "Failed to create client");
      }
    } catch {
      alert("Error occurred while saving client.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & New Client Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E9E5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Client & Contract Management
          </h1>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Manage customer accounts, waste schedules, container inventory and billing contracts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-nested bg-[#00993F] text-white text-xs font-semibold shadow-sm hover:bg-[#008235] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Client</span>
        </button>
      </div>

      {/* Tier Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tiers.map((t) => {
          const Icon = t.icon;
          const isSelected = selectedTier === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTier(t.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-[#00993F] text-white shadow-sm"
                  : "bg-white text-[#4B5563] border border-[#E3E9E5] hover:bg-[#F0F4F2]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Results Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, account number, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E3E9E5] rounded-full text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00993F]"
          />
        </div>
        <div className="text-xs font-medium text-[#4B5563]">
          Showing <strong>{filteredClients.length}</strong> of {clients.length} clients
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-card p-5 border border-[#E3E9E5] shadow-card-hoverable flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-mono text-[11px] font-bold text-[#00993F] bg-[#EDF9F1] px-2 py-0.5 rounded-full border border-[#ADE4C1]">
                    {client.accountNumber}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-2">
                    {client.name}
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge
                    variant={
                      client.customerType === "hotel"
                        ? "amber"
                        : client.customerType === "government"
                        ? "cyan"
                        : "neutral"
                    }
                  >
                    {client.customerType}
                  </Badge>

                  {isClientExpired(client) ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Contract Expired
                    </span>
                  ) : client.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF9F1] text-[#00682B] border border-[#ADE4C1]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00993F]" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Deactivated
                    </span>
                  )}
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-1.5 text-xs text-[#4B5563] mt-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                  <span className="truncate">{client.physicalAddress}, {client.countyRegion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                  <span className="font-semibold text-slate-700">
                    {getDerivedFrequency(client.collectionDays || client.collectionFrequency)}
                  </span>
                  {client.collectionDays && (
                    <span className="text-[11px] text-[#9CA3AF] truncate max-w-[120px]">
                      ({client.collectionDays})
                    </span>
                  )}
                </div>
                {client.contractStartDate && client.contractEndDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                    <span className="font-medium text-slate-600 truncate">
                      Term: {formatDate(client.contractStartDate)} &rarr; {formatDate(client.contractEndDate)}
                    </span>
                  </div>
                )}
              </div>

              {/* Waste stream & bin pill */}
              <div className="mt-4 p-2.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] text-[11px]">
                <div className="text-[#9CA3AF] font-medium">Containers & Streams:</div>
                <div className="font-semibold text-slate-800 mt-0.5 truncate">
                  {client.binCount || "Standard Bins"}
                </div>
                <div className="text-[#00993F] font-bold mt-0.5 truncate">
                  {client.wasteStreams}
                </div>
              </div>
            </div>

            {/* Card Footer: Pricing and Profile Link */}
            <div className="mt-5 pt-3 border-t border-[#F0F4F2] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#9CA3AF] uppercase font-bold block">
                  Contract Fee
                </span>
                <span className="text-sm font-bold font-mono text-slate-900">
                  {formatCurrency(client.monthlyFee, "KES")}/mo
                </span>
              </div>

              <Link
                href={`/clients/${client.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-nested bg-[#F0F4F2] hover:bg-[#E3E9E5] text-xs font-bold text-[#111827] transition-all"
              >
                <span>360° Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Onboard Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-modal border border-[#E3E9E5] animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00993F]" />
                Onboard New Client Account
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[#EDF9F1] text-[#00993F] flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-[#00682B]">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleCreateClient} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Client / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tamarind Dhow Restaurant"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#4B5563] block mb-1">
                      Customer Tier *
                    </label>
                    <select
                      value={formData.customerType}
                      onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                      className="w-full p-2.5 rounded-nested border border-[#E3E9E5] bg-white focus:outline-none focus:border-[#00993F]"
                    >
                      <option value="hotel">Hotel</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="apartment">Apartment</option>
                      <option value="school">School</option>
                      <option value="business">Business / Commercial</option>
                      <option value="government">Government / Municipal</option>
                      <option value="household">Household</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#4B5563] block mb-1">
                      County / Region *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.countyRegion}
                      onChange={(e) => setFormData({ ...formData, countyRegion: e.target.value })}
                      className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#4B5563] block mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      placeholder="Facilities Manager"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#4B5563] block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+254 712 345 678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Physical Address / GPS Details *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nyali Links Rd, Mombasa"
                    value={formData.physicalAddress}
                    onChange={(e) => setFormData({ ...formData, physicalAddress: e.target.value })}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Monthly Contract Fee (KES) *
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                  />
                </div>

                {/* Contract Duration & Expiry */}
                <div className="p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#111827] flex items-center gap-1.5 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-[#00993F]" />
                      Contract Duration &amp; Term *
                    </label>
                    <span className="text-[10px] text-[#4B5563] font-medium">Auto-deactivates upon expiry</span>
                  </div>

                  {/* Preset Duration Buttons */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1">
                      Quick Term Presets
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPresetDuration(3)}
                        className="py-1 px-1.5 rounded-nested border border-[#E3E9E5] bg-white hover:bg-[#EDF9F1] hover:text-[#00993F] text-[11px] font-bold text-slate-700 text-center transition-colors cursor-pointer"
                      >
                        3 Mos
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetDuration(6)}
                        className="py-1 px-1.5 rounded-nested border border-[#E3E9E5] bg-white hover:bg-[#EDF9F1] hover:text-[#00993F] text-[11px] font-bold text-slate-700 text-center transition-colors cursor-pointer"
                      >
                        6 Mos
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetDuration(12)}
                        className="py-1 px-1.5 rounded-nested border border-[#ADE4C1] bg-[#EDF9F1] text-[#00682B] text-[11px] font-bold text-center transition-colors cursor-pointer"
                      >
                        1 Year ★
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetDuration(24)}
                        className="py-1 px-1.5 rounded-nested border border-[#E3E9E5] bg-white hover:bg-[#EDF9F1] hover:text-[#00993F] text-[11px] font-bold text-slate-700 text-center transition-colors cursor-pointer"
                      >
                        2 Years
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#4B5563] block mb-1 text-[11px]">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.contractStartDate}
                        onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                        className="w-full p-2 rounded-nested border border-[#E3E9E5] bg-white text-xs focus:outline-none focus:border-[#00993F]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#4B5563] block mb-1 text-[11px]">
                        End Date (Expiry) *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.contractEndDate}
                        onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                        className={`w-full p-2 rounded-nested border bg-white text-xs focus:outline-none ${
                          isDateRangeInvalid
                            ? "border-red-500 text-red-700 focus:border-red-500"
                            : "border-[#E3E9E5] focus:border-[#00993F]"
                        }`}
                      />
                    </div>
                  </div>

                  {isDateRangeInvalid && (
                    <div className="p-2 rounded-[8px] bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                      <span>Contract end date cannot be earlier than start date.</span>
                    </div>
                  )}
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Quick Schedule Presets
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          collectionDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                        })
                      }
                      className="p-1.5 rounded-nested border border-[#E3E9E5] bg-[#F6F8F7] hover:bg-[#EDF9F1] text-[11px] font-semibold text-slate-700 text-left transition-colors cursor-pointer"
                    >
                      ⚡ Daily (Mon – Sat)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          collectionDays: [],
                        })
                      }
                      className="p-1.5 rounded-nested border border-[#E3E9E5] bg-[#F6F8F7] hover:bg-[#EDF9F1] text-[11px] font-semibold text-slate-700 text-left transition-colors cursor-pointer"
                    >
                      🔔 On-Demand Only
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#4B5563] block">
                      Designated Collection Days *
                    </label>
                    <span className="text-[11px] text-[#00993F] font-bold">
                      {formData.collectionDays.length} selected
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
                      const isSel = formData.collectionDays.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => {
                            const newDays = isSel
                              ? formData.collectionDays.filter((d) => d !== day)
                              : [...formData.collectionDays, day];
                            setFormData({ ...formData, collectionDays: newDays });
                          }}
                          className={`p-1.5 rounded-nested border text-[11px] font-bold transition-all text-center cursor-pointer ${
                            isSel
                              ? "bg-[#00993F] text-white border-[#00993F]"
                              : "bg-[#F6F8F7] text-slate-700 border-[#E3E9E5] hover:bg-[#EDF9F1]"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Auto-Derived Contract Frequency Display */}
                <div className="p-2.5 rounded-nested bg-[#F0FDF4] border border-[#ADE4C1] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#00993F]" />
                    <span className="text-[11px] font-bold text-[#00682B]">
                      Derived Frequency: {getDerivedFrequency(formData.collectionDays.join(", "))} Service
                    </span>
                  </div>
                  <span className="text-[9px] text-[#00682B] font-mono font-bold bg-white/80 px-2 py-0.5 rounded-full border border-[#ADE4C1]">
                    Auto-Computed
                  </span>
                </div>

                <div>
                  <label className="font-bold text-[#4B5563] block mb-1">
                    Container Allocation & Deployment
                  </label>
                  <input
                    type="text"
                    list="container-suggestions"
                    placeholder="e.g. 4 x 240L Wheeled Bins + 1 Baling Cage"
                    value={formData.binCount}
                    onChange={(e) => setFormData({ ...formData, binCount: e.target.value })}
                    className="w-full p-2.5 rounded-nested border border-[#E3E9E5] focus:outline-none focus:border-[#00993F]"
                  />
                  <datalist id="container-suggestions">
                    <option value="2 x 240L Wheeled Bins" />
                    <option value="4 x 240L Wheeled Bins" />
                    <option value="8 x 240L Wheeled Bins" />
                    <option value="16 x 240L Wheeled Bins + 2 x 1100L Skips" />
                    <option value="4 x 1100L Steel Skips" />
                    <option value="2 x 10m³ Static Heavy Roll-on Skips" />
                    <option value="12 x Static Heavy Roll-on Skips" />
                    <option value="4 x 240L Bins + 1 Baling Cage" />
                  </datalist>
                  <span className="text-[10px] text-[#9CA3AF] mt-0.5 block">
                    Allocates standard fleet containers tracked in Depot & Fleet Assets
                  </span>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#F0F4F2]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F0F4F2] rounded-nested"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 text-xs font-semibold bg-[#00993F] text-white rounded-nested hover:bg-[#008235] transition-colors disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Save Client Account"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
