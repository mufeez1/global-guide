"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark as BookmarkIcon, BookmarkCheck, Copy, Share2, X, WifiOff } from "lucide-react";
import { useBookmark, type Bookmark } from "@/lib/bookmarks";
import { iconBtn } from "./ui";

// ---- Toasts: polite live region, auto-dismiss, never steals focus ----

const TOAST = "ic:toast";
export const toast = (message: string) => window.dispatchEvent(new CustomEvent(TOAST, { detail: message }));

export function Toaster() {
  const [msg, setMsg] = useState<{ text: string; id: number } | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      setMsg({ text: (e as CustomEvent<string>).detail, id: Date.now() });
      clearTimeout(timer);
      timer = setTimeout(() => setMsg(null), 3500);
    };
    window.addEventListener(TOAST, on);
    return () => { window.removeEventListener(TOAST, on); clearTimeout(timer); };
  }, []);
  return (
    <div aria-live="polite" role="status" className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] pointer-events-none">
      {msg && (
        <p key={msg.id} className="px-4 py-2.5 rounded-full bg-[var(--color-on-surface)] text-[var(--color-surface)] text-sm font-semibold shadow-lg">{msg.text}</p>
      )}
    </div>
  );
}

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  if (!offline) return null;
  return (
    <p role="status" className="no-print sticky top-[72px] z-40 flex items-center justify-center gap-2 bg-[var(--color-secondary-fixed)] text-[var(--color-on-secondary-fixed)] text-sm font-semibold py-2 px-4">
      <WifiOff size={16} aria-hidden="true" /> You&apos;re offline. Showing what&apos;s saved on this device.
    </p>
  );
}

// ---- Copy / share / bookmark ----

export async function copyText(text: string, label = "Copied") {
  try {
    await navigator.clipboard.writeText(text);
    toast(label);
  } catch {
    toast("Couldn't copy. Select the text and copy it manually.");
  }
}

export async function shareOrCopy(data: { title: string; text: string; url?: string }) {
  const url = data.url ? new URL(data.url, location.origin).toString() : location.href;
  if (navigator.share) {
    try { await navigator.share({ ...data, url }); return; } catch (e) { if ((e as Error).name === "AbortError") return; }
  }
  copyText(`${data.text}\n\n${url}`, "Link and text copied");
}

export function CopyButton({ text, label = "Copy" }: { text: string | (() => string); label?: string }) {
  return (
    <button type="button" onClick={() => copyText(typeof text === "function" ? text() : text)} aria-label={label} title={label} className={iconBtn}>
      <Copy size={18} aria-hidden="true" />
    </button>
  );
}

export function ShareButton({ title, text, url, label = "Share" }: { title: string; text: string | (() => string); url?: string; label?: string }) {
  return (
    <button type="button" onClick={() => shareOrCopy({ title, text: typeof text === "function" ? text() : text, url })} aria-label={label} title={label} className={iconBtn}>
      <Share2 size={18} aria-hidden="true" />
    </button>
  );
}

export function BookmarkButton({ item, label = "Bookmark", getText }: { item: Omit<Bookmark, "createdAt">; label?: string; getText?: () => string }) {
  const [saved, toggle] = useBookmark(item);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label.toLowerCase()}` : label}
      title={saved ? "Saved" : label}
      onClick={() => toggle(getText?.()).then((on) => toast(on ? "Saved to bookmarks" : "Removed from bookmarks")).catch(() => toast("Couldn't save on this device."))}
      className={`${iconBtn} ${saved ? "text-[var(--color-primary)]" : ""}`}
    >
      {saved ? <BookmarkCheck size={18} fill="currentColor" aria-hidden="true" /> : <BookmarkIcon size={18} aria-hidden="true" />}
    </button>
  );
}

// ---- Dialog: native <dialog> gives focus trapping, Esc and a backdrop for free ----

export function Dialog({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current!;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      aria-labelledby="dialog-title"
      className={`m-auto w-[calc(100%-2rem)] ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[85dvh] rounded-3xl p-0 bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] backdrop:bg-black/50 backdrop:backdrop-blur-sm`}
    >
      {open && (
        <div className="flex flex-col max-h-[85dvh]">
          <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[var(--color-outline-variant)]/40">
            <h2 id="dialog-title" className="font-display text-xl">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className={iconBtn}><X size={20} aria-hidden="true" /></button>
          </div>
          <div className="overflow-y-auto px-5 sm:px-6 py-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
