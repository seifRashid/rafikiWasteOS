// Rafiki WasteOS Progressive Web App Service Worker
// Security-first strategy:
// - NEVER caches authentication endpoints (/api/auth/*), API responses (/api/*),
//   Next.js Server Actions, RSC dynamic data payloads, or non-GET mutations.
// - Static assets (/_next/static/*, /icons/*, fonts, images) use Cache-First.
// - Document navigations use Network-First with a branded /offline fallback.

const SW_VERSION = "rafiki-wasteos-v1";
const STATIC_CACHE = `${SW_VERSION}-static`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
  "/icons/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => {
        // Ignore precache errors during offline install
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    /\.(?:png|jpg|jpeg|webp|svg|ico|woff2?|ttf|otf|css|js)$/i.test(pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // 1. Only handle GET requests (never intercept POST/PUT/PATCH/DELETE mutations)
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // 2. Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // 3. STRICT SECURITY EXCLUSIONS:
  // Never cache auth endpoints, API routes, Server Actions, or Next.js RSC payloads
  if (
    url.pathname.startsWith("/api/") ||
    request.headers.has("Next-Action") ||
    request.headers.has("RSC") ||
    url.searchParams.has("_rsc")
  ) {
    return;
  }

  // 4. Document navigations: Network-First -> Offline Fallback
  // Never cache authenticated HTML pages in Cache Storage to prevent sensitive data leakage
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedOffline = await caches.match(OFFLINE_URL);
        if (cachedOffline) {
          return cachedOffline;
        }
        return new Response(
          "<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Offline — Rafiki WasteOS</title></head><body style='font-family:system-ui,sans-serif;background:#F6F8F7;color:#111827;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center'><div><h1 style='color:#00993F;margin-bottom:8px'>You are offline</h1><p style='color:#4B5563'>Check your internet connection and reload Rafiki WasteOS.</p></div></body></html>",
          {
            status: 503,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          }
        );
      })
    );
    return;
  }

  // 5. Static assets: Cache-First with safe caching checks
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            const cacheControl = networkResponse.headers.get("Cache-Control") || "";
            const isPrivate =
              cacheControl.includes("no-store") || cacheControl.includes("private");

            if (networkResponse.ok && !isPrivate && networkResponse.type === "basic") {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => new Response("", { status: 504 }));
      })
    );
  }
});
