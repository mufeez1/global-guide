"use client";

import { useEffect } from "react";

// Registers /sw.js in production only, so dev reloads never serve stale pages.
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
    }
  }, []);
  return null;
}
