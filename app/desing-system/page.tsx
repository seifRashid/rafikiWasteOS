"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Truck,
  MapPin,
  Clock,
  Calendar,
  AlertTriangle,
  ChevronDown,
  Search,
  Bell,
  CheckCircle2,
  TrendingUp,
  Layers,
  Fuel,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Compass,
  FileText,
  Users,
  Settings,
  Star,
  Copy,
  Check,
  BarChart3,
  Sliders,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Info,
  Maximize2
} from "lucide-react";

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "system">("dashboard");
  const [activeRouteFilter, setActiveRouteFilter] = useState<"collecte" | "attente" | "terminee">("collecte");
  const [systemCategory, setSystemCategory] = useState<"colors" | "typography" | "components" | "tables" | "cards">("colors");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToClipboard = (text: string, token: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-[#111827] flex flex-col">
      {/* Top Floating App Bar / Mode Switcher */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E3E9E5] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00993F] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-base">Rafiki WasteOS</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-[#EDF9F1] text-[#00682B] px-2 py-0.5 rounded-full border border-[#ADE4C1]">
                Design System v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Enterprise UI/UX Framework & Logistics ERP</p>
          </div>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center bg-[#F0F4F2] p-1 rounded-full border border-[#E3E9E5]">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "dashboard"
                ? "bg-[#00993F] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Live ERP Dashboard
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "system"
                ? "bg-[#00993F] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Design Tokens & Components
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden md:inline">Palette Brand:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#00993F] ring-2 ring-white shadow-xs" title="Primary Green #00993F (70%)" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#FECA36] ring-2 ring-white shadow-xs" title="Secondary Amber #FECA36 (15%)" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#08A6BA] ring-2 ring-white shadow-xs" title="Secondary Cyan #08A6BA (15%)" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
        {activeTab === "dashboard" ? (
          /* =========================================================================
             VIEW 1: LIVE INTERACTIVE DASHBOARD (Translating the Reference Image)
             ========================================================================= */
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Sidebar Navigation */}
            <aside className="w-full lg:w-[260px] shrink-0 bg-white rounded-[24px] p-5 border border-[#E3E9E5] shadow-[0_2px_14px_-2px_rgba(16,38,24,0.04)] flex flex-col justify-between min-h-[920px]">
              <div className="space-y-6">
                {/* User Profile Header */}
                <div className="flex items-center gap-3 pb-2 border-b border-[#F0F4F2]">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#00993F]/20">
                    <Image
                      src="/avatar_camille.jpg"
                      alt="Camille"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Bonjour,</span>
                    <span className="text-base font-bold text-slate-900 leading-tight">Camille</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Dispatcheur Principal</span>
                  </div>
                </div>

                {/* Vertical Navigation Links */}
                <nav className="space-y-1.5">
                  <a
                    href="#overview"
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-full bg-[#00993F] text-white text-xs font-semibold shadow-[0_4px_12px_rgba(0,153,63,0.28)] transition-transform hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-4 h-4" />
                      <span>Vue d&apos;ensemble</span>
                    </div>
                  </a>

                  <a
                    href="#expeditions"
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-full text-slate-600 hover:text-[#00993F] hover:bg-[#F0F6F2] text-xs font-medium transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4" />
                      <span>Collectes & Tournées</span>
                    </div>
                  </a>

                  <a
                    href="#clients"
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-full text-slate-600 hover:text-[#00993F] hover:bg-[#F0F6F2] text-xs font-medium transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4" />
                      <span>Clients & Contrats</span>
                    </div>
                  </a>

                  <a
                    href="#analyse"
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-full text-slate-600 hover:text-[#00993F] hover:bg-[#F0F6F2] text-xs font-medium transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-4 h-4" />
                      <span>Analyse & RSE</span>
                    </div>
                    <span className="w-5 h-5 rounded-full bg-[#FEE2E2] text-[#DC2626] text-[10px] font-bold flex items-center justify-center">
                      2
                    </span>
                  </a>

                  <a
                    href="#historique"
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-full text-slate-600 hover:text-[#00993F] hover:bg-[#F0F6F2] text-xs font-medium transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4" />
                      <span>Historique Pesées</span>
                    </div>
                    <span className="w-5 h-5 rounded-full bg-[#FFF8D6] text-[#785608] text-[10px] font-bold flex items-center justify-center">
                      1
                    </span>
                  </a>

                  <a
                    href="#parametres"
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-full text-slate-600 hover:text-[#00993F] hover:bg-[#F0F6F2] text-xs font-medium transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4" />
                      <span>Paramètres Flotte</span>
                    </div>
                  </a>
                </nav>
              </div>

              {/* Lower Section: Action Card + Isometric Graphic */}
              <div className="space-y-4 pt-4">
                {/* Operational Quick Card ("Dernières courses" Equivalent) */}
                <div className="bg-gradient-to-br from-[#00993F] to-[#008235] text-white rounded-[20px] p-4 shadow-[0_6px_20px_rgba(0,153,63,0.22)] relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white/90">Dernières tournées</span>
                    <a href="#voir-tout" className="text-[10px] font-medium text-white/80 hover:text-white underline">
                      Voir tout
                    </a>
                  </div>
                  <div className="space-y-1 my-2">
                    <div className="text-[11px] text-white/80 font-medium">Aujourd&apos;hui</div>
                    <div className="text-xl font-extrabold tracking-tight">32 collectes</div>
                    <div className="text-xs text-white/90 flex items-center justify-between pt-1">
                      <span>Distance totale:</span>
                      <span className="font-bold">870 km</span>
                    </div>
                    <div className="text-xs text-white/90 flex items-center justify-between">
                      <span>Temps moyen:</span>
                      <span className="font-bold">2h 45</span>
                    </div>
                  </div>
                  <button className="w-full mt-3 bg-white text-[#00993F] font-bold text-xs py-2 px-3 rounded-full hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-1.5">
                    <span>Nouvelle tournée</span>
                    <span className="text-sm font-bold">+</span>
                  </button>
                </div>

                {/* 3D Depot Visual Illustration */}
                <div className="relative h-32 rounded-[18px] overflow-hidden border border-[#E3E9E5] bg-[#F0F4F2]">
                  <Image
                    src="/depot.jpg"
                    alt="Centre de tri & Logistique"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-2.5">
                    <span className="text-[10px] font-semibold text-white bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
                      Centre de Tri Nord #04
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Dashboard Canvas */}
            <div className="flex-1 w-full space-y-6">
              {/* Header Top-Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    Tableau de bord
                  </span>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Suivi logistique
                  </h1>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Vehicle Selector Dropdown */}
                  <div className="relative">
                    <button className="flex items-center gap-2 bg-white border border-[#E3E9E5] px-4 py-2 rounded-full text-xs font-semibold text-slate-700 hover:border-[#CDD8D1] shadow-xs">
                      <span>Sélectionner un camion</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      className="bg-white border border-[#E3E9E5] rounded-full pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00993F] focus:ring-2 focus:ring-[#00993F]/20 w-44 sm:w-56 shadow-xs"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  {/* Notification Bell */}
                  <button className="relative w-9 h-9 rounded-full bg-white border border-[#E3E9E5] flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-xs">
                    <Bell className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">
                      3
                    </span>
                  </button>
                </div>
              </div>

              {/* MODULE 1: Live Route Tracking & Collection Hero Card */}
              <div className="bg-white rounded-[24px] p-6 border border-[#E3E9E5] shadow-[0_2px_14px_-2px_rgba(16,38,24,0.04)] relative overflow-hidden">
                {/* Segmented Filter Pills */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveRouteFilter("collecte")}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        activeRouteFilter === "collecte"
                          ? "bg-[#00993F] text-white shadow-xs"
                          : "bg-white border border-[#E3E9E5] text-slate-600 hover:bg-[#F6F8F7]"
                      }`}
                    >
                      En collecte
                    </button>
                    <button
                      onClick={() => setActiveRouteFilter("attente")}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        activeRouteFilter === "attente"
                          ? "bg-[#00993F] text-white shadow-xs"
                          : "bg-white border border-[#E3E9E5] text-slate-600 hover:bg-[#F6F8F7]"
                      }`}
                    >
                      En attente
                    </button>
                    <button
                      onClick={() => setActiveRouteFilter("terminee")}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        activeRouteFilter === "terminee"
                          ? "bg-[#00993F] text-white shadow-xs"
                          : "bg-white border border-[#E3E9E5] text-slate-600 hover:bg-[#F6F8F7]"
                      }`}
                    >
                      Terminée
                    </button>
                  </div>

                  <span className="text-xs font-medium text-slate-500">
                    Tournée active: <strong className="text-slate-800">TRN-4892 (Zone Ouest)</strong>
                  </span>
                </div>

                {/* Progress Readout & Metric Pills Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 space-y-4">
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Progression globale</span>
                      <div className="text-3xl font-extrabold text-slate-900 tracking-tight my-1">
                        72 %
                      </div>
                      {/* Linear Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-[#E6ECE8] overflow-hidden">
                        <div className="h-full bg-[#00993F] rounded-full w-[72%]" />
                      </div>
                    </div>

                    {/* Sub-Metric Nested Pills */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-[#F0F4F2] p-3 rounded-[14px] border border-[#E3E9E5]">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Compass className="w-3.5 h-3.5 text-[#00993F]" />
                          <span>Distance</span>
                        </div>
                        <div className="text-base font-bold text-slate-900 mt-1">540 km</div>
                      </div>

                      <div className="bg-[#F0F4F2] p-3 rounded-[14px] border border-[#E3E9E5]">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#08A6BA]" />
                          <span>Temps restant</span>
                        </div>
                        <div className="text-base font-bold text-slate-900 mt-1">1h 20 min</div>
                      </div>
                    </div>
                  </div>

                  {/* Map Route Graphic with Waypoints & Alert Card */}
                  <div className="md:col-span-8 relative h-64 bg-[#F8FAF9] rounded-[20px] border border-[#E3E9E5] overflow-hidden p-4">
                    {/* SVG Vector Map Canvas */}
                    <svg className="w-full h-full" viewBox="0 0 700 240" fill="none">
                      {/* Subtle Street / Road Grid */}
                      <path d="M 0,40 L 700,40 M 0,110 L 700,110 M 0,180 L 700,180" stroke="#E3E9E5" strokeWidth="1" strokeDasharray="4 4" />
                      <path d="M 120,0 L 120,240 M 340,0 L 340,240 M 520,0 L 520,240" stroke="#E3E9E5" strokeWidth="1" strokeDasharray="4 4" />

                      {/* Main River / Natural Contour */}
                      <path d="M 0,200 C 200,230 400,160 700,190" stroke="#EEFBFD" strokeWidth="24" strokeLinecap="round" />

                      {/* Waste Collection Route Path (Dotted Curving Polyline) */}
                      <path
                        d="M 50,180 C 180,180 220,130 350,110 C 420,95 480,50 620,40"
                        stroke="#00993F"
                        strokeWidth="3.5"
                        strokeDasharray="6 6"
                        strokeLinecap="round"
                      />

                      {/* Waypoint Nodes (Completed and Pending) */}
                      {/* Node 1: Completed */}
                      <circle cx="50" cy="180" r="7" fill="#00993F" stroke="#FFFFFF" strokeWidth="3" />
                      {/* Node 2: Completed */}
                      <circle cx="210" cy="145" r="7" fill="#00993F" stroke="#FFFFFF" strokeWidth="3" />
                      {/* Node 3: Current Position / Pulsing Vehicle */}
                      <circle cx="350" cy="110" r="14" fill="#00993F" fillOpacity="0.2" className="animate-ping" />
                      <circle cx="350" cy="110" r="9" fill="#00993F" stroke="#FFFFFF" strokeWidth="3" />
                      {/* Node 4: Scheduled Next */}
                      <circle cx="480" cy="70" r="7" fill="#FFFFFF" stroke="#00993F" strokeWidth="2.5" />
                      {/* Node 5: Destination Depot */}
                      <circle cx="620" cy="40" r="9" fill="#FFFFFF" stroke="#EF4444" strokeWidth="3" />
                      <circle cx="620" cy="40" r="4" fill="#EF4444" />
                    </svg>

                    {/* Floating Alert Card on Map */}
                    <div className="absolute top-4 right-4 max-w-[240px] bg-white/95 backdrop-blur-md rounded-[16px] p-3.5 border border-[#FEF0A8] shadow-[0_4px_16px_rgba(254,202,54,0.15)]">
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#FFF8D6] text-[#785608] flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Ralentissement prévu</div>
                          <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                            Circulation dense dans votre zone de collecte Nord.
                          </div>
                          <button className="mt-2 text-[11px] font-semibold text-white bg-[#00993F] hover:bg-[#008235] px-3 py-1 rounded-full shadow-xs transition-colors">
                            Voir les détails
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODULE 2 & 3: Trip Details & Truck Compactor Capacity */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Trip Detail Card (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-[24px] p-6 border border-[#E3E9E5] shadow-[0_2px_14px_-2px_rgba(16,38,24,0.04)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-[#F0F4F2]">
                      <h3 className="text-base font-bold text-slate-900">Détail de l&apos;expédition</h3>
                      <button className="text-xs text-slate-500 hover:text-slate-800 font-medium">
                        Plus d&apos;infos
                      </button>
                    </div>

                    {/* Driver Profile Row */}
                    <div className="flex items-center justify-between my-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#E3E9E5]">
                          <Image
                            src="/avatar_driver.jpg"
                            alt="Julien Morel"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Julien Morel</h4>
                          <span className="text-xs text-slate-500 block">ID expédition : EXP-98564</span>
                          <span className="text-[11px] font-medium text-slate-600">Camion 12 — Benne 16m³</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 font-medium block">Évaluation</span>
                        <div className="flex items-center gap-0.5 mt-0.5 text-[#FECA36]">
                          <Star className="w-3.5 h-3.5 fill-[#FECA36]" />
                          <Star className="w-3.5 h-3.5 fill-[#FECA36]" />
                          <Star className="w-3.5 h-3.5 fill-[#FECA36]" />
                          <Star className="w-3.5 h-3.5 fill-[#FECA36]" />
                          <Star className="w-3.5 h-3.5 fill-[#FECA36]" />
                        </div>
                      </div>
                    </div>

                    {/* 4-Item Telematics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                      {/* Metric 1: Bins Remaining */}
                      <div className="bg-[#F8FAF9] p-3 rounded-[16px] border border-[#E3E9E5] text-center">
                        <span className="text-[11px] text-slate-500 font-medium block">Colis / Bennes</span>
                        <div className="text-2xl font-extrabold text-[#DC2626] my-1">48</div>
                        <span className="text-[10px] text-slate-400">Bennes restantes</span>
                      </div>

                      {/* Metric 2: Load Circular Donut */}
                      <div className="bg-[#F8FAF9] p-3 rounded-[16px] border border-[#E3E9E5] text-center flex flex-col items-center">
                        <span className="text-[11px] text-slate-500 font-medium block mb-1">Chargement</span>
                        <div className="relative w-11 h-11 flex items-center justify-center">
                          <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#E6ECE8"
                              strokeWidth="3.5"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#00993F"
                              strokeWidth="3.5"
                              strokeDasharray="68, 100"
                            />
                          </svg>
                          <span className="absolute text-[10px] font-bold text-slate-800">68%</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5">En cours</span>
                      </div>

                      {/* Metric 3: Delivery Date */}
                      <div className="bg-[#F8FAF9] p-3 rounded-[16px] border border-[#E3E9E5] text-center">
                        <span className="text-[11px] text-slate-500 font-medium block">Date collecte</span>
                        <Calendar className="w-5 h-5 text-slate-400 mx-auto my-1" />
                        <span className="text-xs font-bold text-slate-800 block">25 mai 2025</span>
                      </div>

                      {/* Metric 4: Status */}
                      <div className="bg-[#F8FAF9] p-3 rounded-[16px] border border-[#E3E9E5] text-center">
                        <span className="text-[11px] text-slate-500 font-medium block">Statut</span>
                        <div className="mt-1">
                          <span className="inline-block text-[11px] font-semibold text-[#00682B] bg-[#EDF9F1] px-2.5 py-0.5 rounded-full border border-[#ADE4C1]">
                            En cours
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">Centre de tri</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Total to Invoice & Payment Badge */}
                  <div className="pt-4 border-t border-[#F0F4F2] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-medium block">Total à encaisser</span>
                      <span className="text-xl font-extrabold text-slate-900">5 860 €</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Paiement</span>
                      <span className="text-xs font-semibold text-[#00682B] bg-[#EDF9F1] px-3 py-1 rounded-full border border-[#ADE4C1]">
                        Réglé
                      </span>
                    </div>
                  </div>
                </div>

                {/* Truck Compactor Capacity Card (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-[24px] p-6 border border-[#E3E9E5] shadow-[0_2px_14px_-2px_rgba(16,38,24,0.04)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2">
                      <h3 className="text-base font-bold text-slate-900">Capacité du camion</h3>
                      <button className="text-xs text-slate-500 hover:text-slate-800 font-medium">
                        Plus d&apos;infos
                      </button>
                    </div>

                    {/* 3D Realistic Compactor Truck Graphic */}
                    <div className="relative h-44 my-2 rounded-[16px] overflow-hidden bg-gradient-to-b from-[#F8FAF9] to-white flex items-center justify-center p-2">
                      <Image
                        src="/truck.jpg"
                        alt="Camion Benne Écologique"
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Capacity Utilization Progress Bar */}
                    <div className="space-y-1.5 my-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">78 %</span>
                        <span className="text-xs text-slate-500 font-medium">Capacité utilisée</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#E6ECE8] overflow-hidden">
                        <div className="h-full bg-[#00993F] rounded-full w-[78%]" />
                      </div>
                    </div>
                  </div>

                  {/* Payload Tonnage Readouts */}
                  <div className="pt-4 border-t border-[#F0F4F2] grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-500 font-medium block">Charge actuelle</span>
                      <span className="text-base font-bold text-slate-900">14,2 t</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium block">Charge max.</span>
                      <span className="text-base font-bold text-slate-900">18,0 t</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODULE 4 & 5: 7-Day Trends & Solid Hero KPI Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 7-Day Collection Trends Line Chart (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-[24px] p-6 border border-[#E3E9E5] shadow-[0_2px_14px_-2px_rgba(16,38,24,0.04)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">Tendances des expéditions</h3>
                    <button className="flex items-center gap-1.5 text-xs text-slate-600 bg-[#F0F4F2] px-3 py-1 rounded-full border border-[#E3E9E5]">
                      <span>7 derniers jours</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>

                  {/* Interactive SVG Area Chart */}
                  <div className="h-48 w-full pt-2">
                    <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00993F" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#00993F" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      <line x1="0" y1="30" x2="500" y2="30" stroke="#F0F4F2" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="0" y1="70" x2="500" y2="70" stroke="#F0F4F2" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="0" y1="110" x2="500" y2="110" stroke="#F0F4F2" strokeWidth="1" strokeDasharray="3 3" />

                      {/* Area Fill */}
                      <path
                        d="M 30,120 Q 90,80 150,95 T 270,70 T 380,85 T 470,30 L 470,140 L 30,140 Z"
                        fill="url(#greenArea)"
                      />

                      {/* Polyline Curve */}
                      <path
                        d="M 30,120 Q 90,80 150,95 T 270,70 T 380,85 T 470,30"
                        fill="none"
                        stroke="#00993F"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Nodes */}
                      {[
                        { x: 30, y: 120, label: "19 mai" },
                        { x: 100, y: 88, label: "20 mai" },
                        { x: 170, y: 92, label: "21 mai" },
                        { x: 240, y: 75, label: "22 mai" },
                        { x: 310, y: 65, label: "23 mai" },
                        { x: 380, y: 85, label: "24 mai" },
                        { x: 470, y: 30, label: "25 mai" }
                      ].map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="4.5" fill="#FFFFFF" stroke="#00993F" strokeWidth="2.5" />
                          <text x={pt.x} y="155" textAnchor="middle" fill="#9CA3AF" fontSize="10" fontFamily="sans-serif">
                            {pt.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* SOLID HERO KPI CARD (5 cols - Replicating reference red card in Brand Forest Green) */}
                <div className="lg:col-span-5 bg-[#00993F] text-white rounded-[24px] p-6 shadow-[0_8px_28px_rgba(0,153,63,0.32)] flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white/90">Performance de livraison</span>
                    <button className="flex items-center gap-1.5 text-xs text-white bg-white/20 hover:bg-white/30 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20 transition-colors">
                      <span>Mois en cours</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="my-2">
                    <div className="text-5xl font-extrabold tracking-tight">94 %</div>
                    <span className="text-xs text-white/80 block mt-1 font-medium">Livraisons à temps</span>
                  </div>

                  {/* Sparkline Polyline on Green */}
                  <div className="h-16 w-full my-2">
                    <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
                      <path
                        d="M 10,48 Q 50,42 90,25 T 170,38 T 240,20 T 290,10"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {[
                        { x: 10, y: 48 },
                        { x: 80, y: 30 },
                        { x: 140, y: 38 },
                        { x: 200, y: 22 },
                        { x: 260, y: 24 },
                        { x: 290, y: 10 }
                      ].map((pt, i) => (
                        <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#00993F" stroke="#FFFFFF" strokeWidth="2" />
                      ))}
                    </svg>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-white/80 font-medium">Objectif : 90 %</span>
                    <button className="bg-white text-[#00993F] font-bold text-xs px-4 py-2 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
                      Voir le rapport
                    </button>
                  </div>
                </div>
              </div>

              {/* MODULE 6, 7 & 8: Triad Split (Donut, Fuel Bar, Messages) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Waste Stream Donut Breakdown */}
                <div className="bg-white rounded-[24px] p-6 border border-[#E3E9E5] shadow-[0_2px_14px_-2px_rgba(16,38,24,0.04)] flex flex-col justify-between">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Répartition des flux</h3>
                  <div className="flex items-center gap-4">
                    {/* SVG Donut Ring */}
                    <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                        {/* Segment 1: Recyclable Green (60%) */}
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#00993F" strokeWidth="5" strokeDasharray="60, 100" />
                        {/* Segment 2: Organic Cyan (25%) */}
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#08A6BA" strokeWidth="5" strokeDasharray="25, 100" strokeDashoffset="-60" />
                        {/* Segment 3: Residual Yellow (10%) */}
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#FECA36" strokeWidth="5" strokeDasharray="10, 100" strokeDashoffset="-85" />
                        {/* Segment 4: Danger Red (5%) */}
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#EF4444" strokeWidth="5" strokeDasharray="5, 100" strokeDashoffset="-95" />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-xs font-extrabold text-slate-900 block">100%</span>
                        <span className="text-[9px] text-slate-400 block uppercase">Tri</span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00993F]" />
                          <span className="text-slate-600">Recyclés</span>
                        </div>
                        <strong className="text-slate-900 font-bold">60 %</strong>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#08A6BA]" />
                          <span className="text-slate-600">Organique</span>
                        </div>
                        <strong className="text-slate-900 font-bold">25 %</strong>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FECA36]" />
                          <span className="text-slate-600">DIB / Vrac</span>
                        </div>
                        <strong className="text-slate-900 font-bold">10 %</strong>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                          <span className="text-slate-600">Spéciaux</span>
                        </div>
                        <strong className="text-slate-900 font-bold">5 %</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fuel & Energy Consumption Bar Chart */}
                <div className="bg-white rounded-[24px] p-6 border border-[#E3E9E5] shadow-[0_2px_14px_-2px_rgba(16,38,24,0.04)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-bold text-slate-900">Consommation carburant</h3>
                      <button className="flex items-center gap-1 text-[11px] text-slate-500">
                        <span>7 derniers jours</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-extrabold text-slate-900">128 L</span>
                      <span className="text-xs font-bold text-[#00682B] bg-[#EDF9F1] px-2 py-0.5 rounded-full">
                        -8%
                      </span>
                      <span className="text-[10px] text-slate-400">vs période préc.</span>
                    </div>
                  </div>

                  {/* Vertical Rounded Bars */}
                  <div className="h-28 flex items-end justify-between gap-2 pt-2">
                    {[
                      { day: "19/05", val: 50 },
                      { day: "20/05", val: 85 },
                      { day: "21/05", val: 65 },
                      { day: "22/05", val: 95 },
                      { day: "23/05", val: 70 },
                      { day: "24/05", val: 80 },
                      { day: "25/05", val: 90 }
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-[#00993F]/85 hover:bg-[#00993F] rounded-t-md transition-all cursor-pointer"
                          style={{ height: `${bar.val}%` }}
                          title={`${bar.day}: ${bar.val}L`}
                        />
                        <span className="text-[9px] text-slate-400">{bar.day.split("/")[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Driver Communication Feed / Messages */}
                <div className="bg-white rounded-[24px] p-6 border border-[#E3E9E5] shadow-[0_2px_14px_-2px_rgba(16,38,24,0.04)] flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
                    <h3 className="text-base font-bold text-slate-900">Messages</h3>
                    <a href="#messages" className="text-xs text-slate-500 hover:text-slate-800 font-medium">
                      Voir tout
                    </a>
                  </div>

                  <div className="space-y-3.5 my-2">
                    {/* Message 1 */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#00993F]/10 text-[#00993F] font-bold text-xs flex items-center justify-center shrink-0">
                          ÉL
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Équipe logistique</span>
                          <p className="text-[11px] text-slate-500 line-clamp-1">Réunion quotidienne à 11h.</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block">10:30</span>
                        <span className="w-2 h-2 rounded-full bg-[#00993F] inline-block mt-0.5" />
                      </div>
                    </div>

                    {/* Message 2 */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#08A6BA]/10 text-[#08A6BA] font-bold text-xs flex items-center justify-center shrink-0">
                          SM
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Sophie Martin</span>
                          <p className="text-[11px] text-slate-500 line-clamp-1">Veuillez confirmer la pesée #4582.</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block">09:15</span>
                        <span className="w-2 h-2 rounded-full bg-[#FECA36] inline-block mt-0.5" />
                      </div>
                    </div>

                    {/* Message 3 */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                          TB
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Thomas Bernard</span>
                          <p className="text-[11px] text-slate-500 line-clamp-1">Nouveau planning disponible.</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block">Hier</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button className="w-full py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-[#F0F4F2] hover:bg-[#E8EFEA] rounded-full transition-colors">
                      Ouvrir la messagerie
                    </button>
                  </div>
                </div>
              </div>

              {/* MODULE 9: Operational Optimization Full-Width Banner */}
              <div className="bg-[#00993F] text-white rounded-[24px] p-6 shadow-[0_6px_24px_rgba(0,153,63,0.25)] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Gardez le contrôle de vos collectes en temps réel
                    </h3>
                    <p className="text-xs text-white/85 mt-0.5 max-w-xl">
                      Suivez, analysez et optimisez chaque tournée de ramassage grâce à notre moteur de dispatch intelligent.
                    </p>
                  </div>
                </div>

                <button className="shrink-0 bg-white text-[#00993F] font-bold text-xs px-5 py-2.5 rounded-full hover:bg-slate-50 transition-transform hover:scale-[1.02] shadow-sm flex items-center gap-2">
                  <span>Optimiser mes tournées</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             VIEW 2: DESIGN TOKENS & REUSABLE COMPONENTS SPECIMEN
             ========================================================================= */
          <div className="space-y-8">
            {/* Category Navigation */}
            <div className="flex items-center gap-2 border-b border-[#E3E9E5] pb-4 overflow-x-auto">
              {[
                { id: "colors", label: "Palette & Tokens" },
                { id: "typography", label: "Typographie" },
                { id: "components", label: "Boutons & Contrôles" },
                { id: "cards", label: "Cartes & Élévation" },
                { id: "tables", label: "Grilles & Données ERP" }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSystemCategory(cat.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    systemCategory === cat.id
                      ? "bg-[#00993F] text-white shadow-xs"
                      : "bg-white border border-[#E3E9E5] text-slate-600 hover:bg-[#F6F8F7]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* TAB: COLORS & BRAND PALETTE */}
            {systemCategory === "colors" && (
              <div className="space-y-8">
                {/* Brand Ratio Distribution Bar */}
                <div className="bg-white rounded-[20px] p-6 border border-[#E3E9E5] shadow-xs">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Règle de Répartition de Marque (70 / 15 / 15)</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Le vert forêt établit l&apos;identité dominante de l&apos;ERP, tandis que le jaune et le cyan agissent comme accents de télématique, alertes et visualisations.
                  </p>
                  <div className="w-full h-8 rounded-full overflow-hidden flex border border-[#E3E9E5]">
                    <div className="bg-[#00993F] text-white text-xs font-bold flex items-center justify-center w-[70%]" title="70% Forest Green">
                      70% Vert Primaire (#00993F)
                    </div>
                    <div className="bg-[#FECA36] text-[#4D3603] text-xs font-bold flex items-center justify-center w-[15%]" title="15% Solar Amber">
                      15% Jaune
                    </div>
                    <div className="bg-[#08A6BA] text-white text-xs font-bold flex items-center justify-center w-[15%]" title="15% Cyan Hydro">
                      15% Cyan
                    </div>
                  </div>
                </div>

                {/* Primary Swatches */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Green Scale */}
                  <div className="bg-white rounded-[20px] p-5 border border-[#E3E9E5] shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F2]">
                      <span className="text-sm font-bold text-slate-900">Vert Forêt (Principal)</span>
                      <span className="text-xs font-mono font-semibold text-[#00993F]">#00993F</span>
                    </div>
                    {[
                      { name: "50", hex: "#EDF9F1", bg: "bg-[#EDF9F1]", darkText: true },
                      { name: "100", hex: "#D6F2E0", bg: "bg-[#D6F2E0]", darkText: true },
                      { name: "300", hex: "#77D19B", bg: "bg-[#77D19B]", darkText: true },
                      { name: "500 (Base)", hex: "#00993F", bg: "bg-[#00993F]", darkText: false },
                      { name: "700", hex: "#00682B", bg: "bg-[#00682B]", darkText: false },
                      { name: "900", hex: "#003D1A", bg: "bg-[#003D1A]", darkText: false }
                    ].map((c) => (
                      <div
                        key={c.name}
                        onClick={() => copyToClipboard(c.hex, c.name)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer ${c.bg} ${
                          c.darkText ? "text-slate-800" : "text-white"
                        }`}
                      >
                        <span className="text-xs font-bold">primary-{c.name}</span>
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span>{c.hex}</span>
                          {copiedToken === c.name ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Amber Scale */}
                  <div className="bg-white rounded-[20px] p-5 border border-[#E3E9E5] shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F2]">
                      <span className="text-sm font-bold text-slate-900">Ambre Solaire (Alertes)</span>
                      <span className="text-xs font-mono font-semibold text-[#FECA36]">#FECA36</span>
                    </div>
                    {[
                      { name: "50", hex: "#FFFDF0", bg: "bg-[#FFFDF0]", darkText: true },
                      { name: "100", hex: "#FFF8D6", bg: "bg-[#FFF8D6]", darkText: true },
                      { name: "300", hex: "#FEDE70", bg: "bg-[#FEDE70]", darkText: true },
                      { name: "400 (Base)", hex: "#FECA36", bg: "bg-[#FECA36]", darkText: true },
                      { name: "700", hex: "#9F7306", bg: "bg-[#9F7306]", darkText: false },
                      { name: "900", hex: "#4D3603", bg: "bg-[#4D3603]", darkText: false }
                    ].map((c) => (
                      <div
                        key={c.name}
                        onClick={() => copyToClipboard(c.hex, c.name)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer ${c.bg} ${
                          c.darkText ? "text-slate-800" : "text-white"
                        }`}
                      >
                        <span className="text-xs font-bold">amber-{c.name}</span>
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span>{c.hex}</span>
                          {copiedToken === c.name ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cyan Scale */}
                  <div className="bg-white rounded-[20px] p-5 border border-[#E3E9E5] shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F2]">
                      <span className="text-sm font-bold text-slate-900">Cyan Télématique</span>
                      <span className="text-xs font-mono font-semibold text-[#08A6BA]">#08A6BA</span>
                    </div>
                    {[
                      { name: "50", hex: "#EEFBFD", bg: "bg-[#EEFBFD]", darkText: true },
                      { name: "100", hex: "#D6F5FA", bg: "bg-[#D6F5FA]", darkText: true },
                      { name: "300", hex: "#7BDBEB", bg: "bg-[#7BDBEB]", darkText: true },
                      { name: "500 (Base)", hex: "#08A6BA", bg: "bg-[#08A6BA]", darkText: false },
                      { name: "700", hex: "#056E7C", bg: "bg-[#056E7C]", darkText: false },
                      { name: "900", hex: "#02373E", bg: "bg-[#02373E]", darkText: false }
                    ].map((c) => (
                      <div
                        key={c.name}
                        onClick={() => copyToClipboard(c.hex, c.name)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer ${c.bg} ${
                          c.darkText ? "text-slate-800" : "text-white"
                        }`}
                      >
                        <span className="text-xs font-bold">cyan-{c.name}</span>
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span>{c.hex}</span>
                          {copiedToken === c.name ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TYPOGRAPHY */}
            {systemCategory === "typography" && (
              <div className="bg-white rounded-[24px] p-6 border border-[#E3E9E5] shadow-xs space-y-6">
                <div className="border-b border-[#F0F4F2] pb-3">
                  <h3 className="text-base font-bold text-slate-900">Échelle Typographique</h3>
                  <p className="text-xs text-slate-500 font-medium">Police principale: Plus Jakarta Sans / Inter. Chiffres à haute lisibilité.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#F0F4F2] pb-4">
                    <span className="text-xs font-mono text-slate-400 w-36">KPI Value (32px / 800)</span>
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      5 860 € — 14,2 tonnes
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#F0F4F2] pb-4">
                    <span className="text-xs font-mono text-slate-400 w-36">Page Title (24px / 700)</span>
                    <span className="text-2xl font-bold text-slate-900">
                      Suivi logistique &amp; Flotte
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#F0F4F2] pb-4">
                    <span className="text-xs font-mono text-slate-400 w-36">Card Heading (18px / 600)</span>
                    <span className="text-lg font-semibold text-slate-900">
                      Détail de l&apos;expédition &amp; Capacité camion
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#F0F4F2] pb-4">
                    <span className="text-xs font-mono text-slate-400 w-36">Body Medium (14px / 500)</span>
                    <span className="text-sm font-medium text-slate-700">
                      Julien Morel — Camion 12 (Benne 16m³ compactée)
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#F0F4F2] pb-4">
                    <span className="text-xs font-mono text-slate-400 w-36">Label / Caption (12px / 500)</span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Distance parcourue — Temps restant estimé
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                    <span className="text-xs font-mono text-slate-400 w-36">Micro Badge (11px / 600)</span>
                    <span className="text-[11px] font-semibold text-[#00682B] bg-[#EDF9F1] px-2.5 py-0.5 rounded-full border border-[#ADE4C1]">
                      En cours — Réglé
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: COMPONENTS & BUTTONS */}
            {systemCategory === "components" && (
              <div className="space-y-6">
                <div className="bg-white rounded-[24px] p-6 border border-[#E3E9E5] shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Styles de Boutons &amp; Variantes d&apos;Actions</h3>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button className="bg-[#00993F] hover:bg-[#008235] text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-xs transition-colors">
                      Bouton Primaire Vert
                    </button>

                    <button className="border border-[#00993F] text-[#00993F] hover:bg-[#EDF9F1] font-semibold text-xs px-5 py-2.5 rounded-full transition-colors">
                      Bouton Contour Vert
                    </button>

                    <button className="bg-white border border-[#E3E9E5] hover:border-[#CDD8D1] text-slate-700 font-semibold text-xs px-5 py-2.5 rounded-full shadow-xs transition-colors">
                      Pill Action Neutre
                    </button>

                    <button className="bg-[#FECA36] hover:bg-[#E5B01E] text-[#4D3603] font-bold text-xs px-5 py-2.5 rounded-full shadow-xs transition-colors">
                      Bouton Alerte Jaune
                    </button>

                    <button className="bg-[#08A6BA] hover:bg-[#068A9B] text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-xs transition-colors">
                      Bouton Télématique Cyan
                    </button>

                    <button className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-xs transition-colors">
                      Action Destructive
                    </button>
                  </div>
                </div>

                {/* Status Badges Matrix */}
                <div className="bg-white rounded-[24px] p-6 border border-[#E3E9E5] shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Pills de Statuts &amp; Indicateurs</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00682B] bg-[#EDF9F1] px-3 py-1 rounded-full border border-[#ADE4C1]">
                      <span className="w-2 h-2 rounded-full bg-[#00993F]" />
                      Validé / Réglé
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#056E7C] bg-[#EEFBFD] px-3 py-1 rounded-full border border-[#B0EBF4]">
                      <span className="w-2 h-2 rounded-full bg-[#08A6BA]" />
                      En transit / Télématique active
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#785608] bg-[#FFF8D6] px-3 py-1 rounded-full border border-[#FEDE70]">
                      <span className="w-2 h-2 rounded-full bg-[#FECA36]" />
                      En attente de pesée
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#991B1B] bg-[#FEF2F2] px-3 py-1 rounded-full border border-[#FECACA]">
                      <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                      Anomalie / Débordement
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      Planifié / Brouillon
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TABLES & ENTERPRISE DATA */}
            {systemCategory === "tables" && (
              <div className="bg-white rounded-[24px] border border-[#E3E9E5] shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#F0F4F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Registre des Pesées &amp; Manifestes Déchets</h3>
                    <p className="text-xs text-slate-500">Traçabilité réglementaire et bordereaux de suivi</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="bg-[#00993F] text-white font-semibold text-xs px-4 py-2 rounded-full shadow-xs">
                      + Nouveau Bordereau
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F8FAF9] border-b border-[#E3E9E5] text-slate-500 uppercase font-semibold">
                        <th className="py-3.5 px-4">Ticket ID</th>
                        <th className="py-3.5 px-4">Date / Heure</th>
                        <th className="py-3.5 px-4">Véhicule</th>
                        <th className="py-3.5 px-4">Flux Déchet</th>
                        <th className="py-3.5 px-4">Poids Net</th>
                        <th className="py-3.5 px-4">Statut</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F4F2]">
                      {[
                        { id: "TK-84920", date: "25/05 10:14", truck: "Camion 12 (Julien M.)", stream: "Carton Recyclable (20 01 01)", net: "4 820 kg", status: "Validé", stColor: "green" },
                        { id: "TK-84921", date: "25/05 09:45", truck: "Camion 04 (Marc R.)", stream: "Bio-déchets / Organique", net: "2 140 kg", status: "En cours", stColor: "cyan" },
                        { id: "TK-84922", date: "25/05 09:05", truck: "Benne 08 (Alex B.)", stream: "DIB Industriel Mélangé", net: "6 300 kg", status: "Attente Pesée 2", stColor: "amber" },
                        { id: "TK-84923", date: "24/05 17:30", truck: "Camion 12 (Julien M.)", stream: "Plastique Polyéthylène", net: "3 450 kg", status: "Validé", stColor: "green" }
                      ].map((row) => (
                        <tr key={row.id} className="hover:bg-[#F2F7F4] transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.id}</td>
                          <td className="py-3 px-4 text-slate-600">{row.date}</td>
                          <td className="py-3 px-4 font-medium text-slate-800">{row.truck}</td>
                          <td className="py-3 px-4 text-slate-600">{row.stream}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{row.net}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                row.stColor === "green"
                                  ? "bg-[#EDF9F1] text-[#00682B] border border-[#ADE4C1]"
                                  : row.stColor === "cyan"
                                  ? "bg-[#EEFBFD] text-[#056E7C] border border-[#B0EBF4]"
                                  : "bg-[#FFF8D6] text-[#785608] border border-[#FEDE70]"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button className="text-slate-400 hover:text-slate-700 font-medium">Détails</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: CARDS & ELEVATIONS */}
            {systemCategory === "cards" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[20px] p-6 border border-[#E3E9E5] shadow-[0_2px_14px_-2px_rgba(16,38,24,0.04)]">
                  <span className="text-xs font-mono text-slate-400">.card-standard</span>
                  <h4 className="text-base font-bold text-slate-900 mt-2">Carte Standard Blanche</h4>
                  <p className="text-xs text-slate-500 mt-1">Rayon 20px, bordure subtile #E3E9E5, ombre diffuse.</p>
                </div>

                <div className="bg-[#F0F4F2] rounded-[14px] p-6 border border-[#E3E9E5]">
                  <span className="text-xs font-mono text-slate-400">.card-nested</span>
                  <h4 className="text-base font-bold text-slate-900 mt-2">Micro-Conteneur Pilule</h4>
                  <p className="text-xs text-slate-500 mt-1">Rayon 14px, fond doux #F0F4F2 pour métriques imbriquées.</p>
                </div>

                <div className="bg-[#00993F] text-white rounded-[20px] p-6 shadow-[0_8px_28px_rgba(0,153,63,0.32)]">
                  <span className="text-xs font-mono text-white/70">.card-hero-primary</span>
                  <h4 className="text-base font-bold text-white mt-2">Carte Hero Inversée</h4>
                  <p className="text-xs text-white/80 mt-1">Fond Vert Forêt plein, contraste textuel pur blanc.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Specification Reference */}
      <footer className="bg-white border-t border-[#E3E9E5] py-4 px-6 text-center text-xs text-slate-500">
        Rafiki WasteOS Design System — Compliant with <code className="font-mono text-[#00993F]">DESIGN.md</code> specification. Built for modern high-performance waste logistics.
      </footer>
    </div>
  );
}
