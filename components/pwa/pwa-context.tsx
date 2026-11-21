"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextValue {
  isOnline: boolean;
  justReconnected: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  canInstall: boolean;
  hasUpdate: boolean;
  promptInstall: () => Promise<"accepted" | "dismissed" | "ios-instructions" | "unavailable">;
  applyUpdate: () => void;
}

const PwaContext = createContext<PwaContextValue>({
  isOnline: true,
  justReconnected: false,
  isStandalone: false,
  isIOS: false,
  canInstall: false,
  hasUpdate: false,
  promptInstall: async () => "unavailable",
  applyUpdate: () => {},
});

export function usePwa() {
  return useContext(PwaContext);
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Detect standalone (installed PWA) mode
    const checkStandalone = () => {
      const displayModeStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const iosStandalone = Boolean(
        (window.navigator as Navigator & { standalone?: boolean }).standalone
      );
      setIsStandalone(displayModeStandalone || iosStandalone);
    };
    checkStandalone();

    const displayMedia = window.matchMedia("(display-mode: standalone)");
    displayMedia.addEventListener("change", checkStandalone);

    // 2. Detect iOS Safari (which uses manual Share -> Add to Home Screen)
    const ua = window.navigator.userAgent;
    const iosDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (ua.includes("Mac") && "ontouchend" in document);
    setIsIOS(iosDevice);

    // 3. Connectivity tracking & automatic refresh on reconnect
    setIsOnline(window.navigator.onLine);
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      // Refresh active Server Component data cleanly when connectivity returns
      router.refresh();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => {
        setJustReconnected(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 4. Capture Chromium beforeinstallprompt event (Android, Windows, macOS, ChromeOS)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // 5. Register Service Worker safely
    if ("serviceWorker" in navigator) {
      const registerSw = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            updateViaCache: "none",
          });

          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
          }

          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
              }
            });
          });
        } catch (err) {
          console.warn("[Rafiki PWA] Service worker registration skipped:", err);
        }
      };

      if (document.readyState === "complete") {
        registerSw();
      } else {
        window.addEventListener("load", registerSw, { once: true });
      }
    }

    return () => {
      displayMedia.removeEventListener("change", checkStandalone);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [router]);

  const promptInstall = useCallback(async () => {
    if (isStandalone) return "unavailable" as const;

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
      return outcome;
    }

    if (isIOS) {
      return "ios-instructions" as const;
    }

    return "unavailable" as const;
  }, [deferredPrompt, isIOS, isStandalone]);

  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  }, [waitingWorker]);

  const canInstall = !isStandalone && (Boolean(deferredPrompt) || isIOS);

  return (
    <PwaContext.Provider
      value={{
        isOnline,
        justReconnected,
        isStandalone,
        isIOS,
        canInstall,
        hasUpdate: Boolean(waitingWorker),
        promptInstall,
        applyUpdate,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}
