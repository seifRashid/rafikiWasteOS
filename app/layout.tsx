import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { PwaProvider } from "@/components/pwa/pwa-context";
import { PwaStatusBanner } from "@/components/pwa/pwa-status-banner";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#00993F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  applicationName: "Rafiki WasteOS",
  title: "Rafiki WasteOS — Waste & Circular Economy Management Platform",
  description:
    "Enterprise Circular Economy ERP & Field Operations for Waste Haulers, Recyclers, and Environmental Organisations",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rafiki WasteOS",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${mono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full font-sans bg-[#F6F8F7] text-[#111827] flex flex-col"
      >
        <PwaProvider>
          <PwaStatusBanner />
          {children}
        </PwaProvider>
      </body>
    </html>
  );
}
