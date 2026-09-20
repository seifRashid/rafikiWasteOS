import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Rafiki WasteOS — Design System & ERP Dashboard",
  description: "Enterprise UI/UX Design System and Telematics Dashboard for Waste Logistics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-[#F6F8F7] text-[#111827] flex flex-col">
        {children}
      </body>
    </html>
  );
}
