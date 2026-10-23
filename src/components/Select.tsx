"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export type Option<V extends string | number> = { value: V; label: string; group?: string; disabled?: boolean };

type Props<V extends string | number> = {
  label: string;
  hideLabel?: boolean;
  options: Option<V>[];
  value?: V; // controlled
  defaultValue?: V; // uncontrolled (e.g. inside a GET form, with `name`)
  onChange?: (v: V) => void;
  name?: string;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  dir?: "rtl" | "ltr";
  lang?: string;
};

// Select-only combobox (WAI-ARIA pattern): focus stays on the button, options are announced
// via aria-activedescendant. The list is portalled so overflow, blur and dialogs never clip it.
export default function Select<V extends string | number>({
  label, hideLabel, options, value, defaultValue, onChange, name, placeholder = "Select…", className = "", buttonClassName, dir, lang,
}: Props<V>) {
  const id = useId();
  const btn = useRef<HTMLButtonElement>(null);
  const [inner, setInner] = useState<V | undefined>(defaultValue);
  const current = value !== undefined ? value : inner;
  const selectedIndex = options.findIndex((o) => o.value === current);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState<React.CSSProperties>({});
  const [host, setHost] = useState<Element | null>(null);
  const typed = useRef({ text: "", at: 0 });

  const enabled = (i: number) => i >= 0 && i < options.length && !options[i].disabled;
  const step = (from: number, dir: 1 | -1) => {
    for (let i = from + dir; i >= 0 && i < options.length; i += dir) if (enabled(i)) return i;
    return from;
  };

  const show = () => {
    const r = btn.current!.getBoundingClientRect();
    const below = innerHeight - r.bottom;
    const up = below < 280 && r.top > below;
    const width = Math.max(r.width, 176);
    setPos({
      position: "fixed",
      left: Math.max(8, Math.min(r.left, innerWidth - width - 8)),
      width,
      maxWidth: innerWidth - 16,
      ...(up ? { bottom: innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
      maxHeight: Math.min(320, (up ? r.top : below) - 16),
    });
    setHost(btn.current!.closest("dialog") ?? document.body);
    setActive(enabled(selectedIndex) ? selectedIndex : step(-1, 1));
    setOpen(true);
  };

  const choose = (i: number) => {
    if (!enabled(i)) return;
    const v = options[i].value;
    setInner(v);
    setOpen(false);
    if (v !== current) onChange?.(v);
  };

  // Close on outside press, page scroll or resize.
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      const t = e.target as Node;
      if (btn.current?.contains(t) || document.getElementById(`${id}-list`)?.contains(t)) return;
      setOpen(false);
    };
    const resize = () => setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("scroll", close, true);
    window.addEventListener("resize", resize);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("scroll", close, true); window.removeEventListener("resize", resize); };
  }, [open, id]);

  useLayoutEffect(() => {
    if (open && active >= 0) document.getElementById(`${id}-o${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, id]);

  const onKey = (e: React.KeyboardEvent) => {
    const k = e.key;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(k)) { e.preventDefault(); show(); }
      return;
    }
    if (k === "ArrowDown") { e.preventDefault(); setActive((a) => step(a, 1)); }
    else if (k === "ArrowUp") { e.preventDefault(); setActive((a) => step(a, -1)); }
    else if (k === "Home") { e.preventDefault(); setActive(step(-1, 1)); }
    else if (k === "End") { e.preventDefault(); setActive(step(options.length, -1)); }
    else if (k === "PageDown") { e.preventDefault(); setActive((a) => Math.min(options.length - 1, a + 8)); }
    else if (k === "PageUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 8)); }
    else if (k === "Enter" || k === " ") { e.preventDefault(); choose(active); }
    else if (k === "Escape") { e.preventDefault(); e.stopPropagation(); setOpen(false); }
    else if (k === "Tab") setOpen(false);
    else if (k.length === 1) {
      // Type to jump: matches the start of a label, accumulating quick keystrokes.
      const now = Date.now();
      typed.current = { text: (now - typed.current.at < 600 ? typed.current.text : "") + k.toLowerCase(), at: now };
      const q = typed.current.text;
      const start = q.length === 1 ? active + 1 : active;
      const order = [...options.keys()].map((i) => (start + i) % options.length);
      const hit = order.find((i) => enabled(i) && options[i].label.toLowerCase().startsWith(q));
      if (hit !== undefined) setActive(hit);
    }
  };

  const groups = options.reduce<{ name?: string; items: number[] }[]>((acc, o, i) => {
    const last = acc.at(-1);
    if (last && last.name === o.group) last.items.push(i);
    else acc.push({ name: o.group, items: [i] });
    return acc;
  }, []);

  const renderOption = (i: number) => {
    const o = options[i];
    const sel = i === selectedIndex;
    return (
      <li
        key={i}
        id={`${id}-o${i}`}
        role="option"
        aria-selected={sel}
        aria-disabled={o.disabled || undefined}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => choose(i)}
        onPointerMove={() => enabled(i) && setActive(i)}
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm cursor-pointer ${i === active ? "bg-[var(--color-surface-container)]" : ""} ${sel ? "font-semibold text-[var(--color-primary)]" : "text-[var(--color-on-surface)]"} ${o.disabled ? "opacity-45 cursor-not-allowed" : ""}`}
      >
        <span className="flex-1 min-w-0">{o.label}</span>
        {sel && <Check size={16} aria-hidden="true" className="shrink-0" />}
      </li>
    );
  };

  return (
    <div className={`text-sm ${className}`}>
      <span id={`${id}-label`} className={hideLabel ? "sr-only" : "block mb-1 font-semibold"}>{label}</span>
      {name && current !== undefined && <input type="hidden" name={name} value={current} />}
      <button
        ref={btn}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-activedescendant={open && active >= 0 ? `${id}-o${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKey}
        onBlur={() => setOpen(false)}
        className={buttonClassName ?? "w-full min-h-11 flex items-center gap-2 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/70 rounded-xl pl-3.5 pr-3 py-2 text-[15px] text-left cursor-pointer hover:border-[var(--color-primary)]/50 aria-expanded:border-[var(--color-primary)] transition-colors"}
      >
        <span id={`${id}-value`} dir={dir} lang={lang} className={`flex-1 min-w-0 truncate ${selectedIndex < 0 ? "opacity-55" : ""}`}>
          {selectedIndex >= 0 ? options[selectedIndex].label : placeholder}
        </span>
        <ChevronDown size={16} aria-hidden="true" className={`shrink-0 opacity-60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && host && createPortal(
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          dir={dir}
          lang={lang}
          style={pos}
          className="z-[90] overflow-y-auto overscroll-contain p-1.5 rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)]"
        >
          {groups.map((g, gi) =>
            g.name ? (
              <li key={gi} role="presentation">
                <p aria-hidden="true" className="px-3 pt-2.5 pb-1 text-[11px] font-bold uppercase tracking-widest text-[var(--color-on-surface)]/50">{g.name}</p>
                <ul role="group" aria-label={g.name}>{g.items.map(renderOption)}</ul>
              </li>
            ) : g.items.map(renderOption)
          )}
        </ul>,
        host
      )}
    </div>
  );
}
