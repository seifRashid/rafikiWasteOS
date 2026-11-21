import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Rafiki WasteOS — Waste & Circular Economy ERP",
    short_name: "Rafiki WasteOS",
    description:
      "One simple system to manage waste, people, money and impact. Enterprise Circular Economy ERP & Field Operations for Waste Haulers and Recyclers.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "any",
    background_color: "#F6F8F7",
    theme_color: "#00993F",
    lang: "en",
    dir: "ltr",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Collections",
        short_name: "Collections",
        description: "View and update today's waste collection jobs",
        url: "/operations/collections",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Routes & Dispatch",
        short_name: "Routes",
        description: "Manage daily route manifests and trucks",
        url: "/operations/routes",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Material Inventory",
        short_name: "Inventory",
        description: "Track recyclable batches and scrap sales",
        url: "/waste/inventory",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Driver Portal",
        short_name: "Driver",
        description: "Open the mobile field driver terminal",
        url: "/driver",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
