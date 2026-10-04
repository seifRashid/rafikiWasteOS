"use client";

import React, { useState } from "react";
import {
  Settings,
  Globe,
  Database,
  Wifi,
  Smartphone,
  Server,
  Scale,
  Save,
  CheckCircle2,
  RefreshCw,
  Clock,
  Radio,
  HardDrive,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";

export function SystemSettingsView() {
  const [saved, setSaved] = useState(false);
  const [offlineCacheCleared, setOfflineCacheCleared] = useState(false);

  const [settings, setSettings] = useState({
    countryPreset: "KE",
    timezone: "Africa/Nairobi (UTC+3)",
    weightUnit: "kg_tonnes",
    dateFormat: "DD/MM/YYYY",
    syncIntervalMinutes: 15,
    allowCellularSync: true,
    offlineRouteLimit: 10,
    weighbridgeIp: "192.168.1.150",
    weighbridgePort: "9100",
    weighbridgeBaudRate: "9600",
    weighbridgeToleranceKg: 5,
    smsGateway: "Africa's Talking (Kenya +254)",
    mpesaEnvironment: "production_daraja",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  const handleClearCache = () => {
    setOfflineCacheCleared(true);
    setTimeout(() => setOfflineCacheCleared(false), 3000);
  };

  return (
    <div className="space-y-6">
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-4 flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">System settings and hardware configurations updated.</span>
        </div>
      )}

      {offlineCacheCleared && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-4 flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="text-sm font-semibold">Offline PWA IndexedDB cache successfully cleared and re-synced.</span>
        </div>
      )}

      {/* Top Infrastructure Health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Neon Cloud Postgres"
          value="Connected"
          subtitle="Branch: staging (restless-flower)"
          icon={<Database className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="PWA Offline Sync"
          value="Enabled"
          subtitle="IndexedDB worker cache active"
          icon={<Smartphone className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="Weighbridge Bridge"
          value="Online (Port 9100)"
          subtitle="Avery Berkel & Rice Lake scales"
          icon={<Scale className="w-5 h-5 text-[#08A6BA]" />}
        />
        <StatCard
          title="M-Pesa IPN Gateway"
          value="Operational"
          subtitle="Daraja C2B instant reconciliation"
          icon={<Zap className="w-5 h-5 text-[#FECA36]" />}
        />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Multi-Country & Localization */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Multi-Country Regional Presets</h2>
              <p className="text-xs text-muted-foreground">Currency defaults, local statutory tax regulations, and timezones</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">Target Market Preset</label>
              <select
                value={settings.countryPreset}
                onChange={(e) => setSettings({ ...settings, countryPreset: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="KE">Kenya (KES • NEMA / KRA Regulations)</option>
                <option value="UG">Uganda (UGX • NEMA Uganda / URA)</option>
                <option value="TZ">Tanzania (TZS • NEMC / TRA)</option>
                <option value="RW">Rwanda (RWF • REMA / RRA)</option>
                <option value="GH">Ghana (GHS • EPA Ghana / GRA)</option>
                <option value="ZA">South Africa (ZAR • DFFE / SARS)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">Operating Timezone</label>
              <input
                type="text"
                readOnly
                value={settings.timezone}
                className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-muted/40 font-mono text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">Weight Measurement Unit</label>
              <select
                value={settings.weightUnit}
                onChange={(e) => setSettings({ ...settings, weightUnit: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="kg_tonnes">Kilograms (kg) & Metric Tonnes (T)</option>
                <option value="pounds_tons">Pounds (lbs) & Short Tons</option>
              </select>
            </div>
          </div>
        </div>

        {/* PWA Mobile Offline Sync */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">PWA Mobile Driver Offline Sync</h2>
                <p className="text-xs text-muted-foreground">Background synchronization and offline queue for field drivers</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              className="text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <HardDrive className="w-3.5 h-3.5" />
              Purge Local Cache
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">Background Sync Interval</label>
              <select
                value={settings.syncIntervalMinutes}
                onChange={(e) => setSettings({ ...settings, syncIntervalMinutes: Number(e.target.value) })}
                className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value={5}>Every 5 minutes</option>
                <option value={15}>Every 15 minutes (Recommended)</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every 1 hour</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">Pre-cached Route Manifests</label>
              <input
                type="number"
                value={settings.offlineRouteLimit}
                onChange={(e) => setSettings({ ...settings, offlineRouteLimit: Number(e.target.value) })}
                className="w-full text-sm font-mono px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2.5 text-xs font-bold text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowCellularSync}
                  onChange={(e) => setSettings({ ...settings, allowCellularSync: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
                <span>Allow GPS Photo Uploads on Mobile Data (2G/3G/4G)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Weighbridge Hardware Bridge */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Weighbridge Scale Hardware Integration</h2>
              <p className="text-xs text-muted-foreground">Serial RS-232 / TCP-IP bridge connecting depot scales to WasteOS</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">Scale IP Address</label>
              <input
                type="text"
                value={settings.weighbridgeIp}
                onChange={(e) => setSettings({ ...settings, weighbridgeIp: e.target.value })}
                className="w-full text-sm font-mono px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">Port</label>
              <input
                type="text"
                value={settings.weighbridgePort}
                onChange={(e) => setSettings({ ...settings, weighbridgePort: e.target.value })}
                className="w-full text-sm font-mono px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">Baud Rate</label>
              <input
                type="text"
                value={settings.weighbridgeBaudRate}
                onChange={(e) => setSettings({ ...settings, weighbridgeBaudRate: e.target.value })}
                className="w-full text-sm font-mono px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1">Auto-Tare Tolerance (kg)</label>
              <input
                type="number"
                value={settings.weighbridgeToleranceKg}
                onChange={(e) => setSettings({ ...settings, weighbridgeToleranceKg: Number(e.target.value) })}
                className="w-full text-sm font-mono px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-xs"
          >
            <Save className="w-4 h-4" />
            Save System Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
