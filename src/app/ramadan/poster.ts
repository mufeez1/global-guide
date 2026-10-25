import type { Day } from "@/lib/services/aladhan";
import { DEDICATION } from "@/components/Footer";

// A4 at 150 dpi.
const W = 1240,
  H = 1754;
const C = {
  bg: "#FAF8F3",
  bg2: "#EAF3E7",
  ink: "#1A1C1C",
  muted: "#5F655F",
  green: "#1B6D24",
  deep: "#0E3B16",
  gold: "#8A6D1F",
  goldLight: "#D9BE6A",
  cream: "#EAE4B1",
  white: "#FFFFFF",
};

type Lang = "en" | "ur";
type Block = {
  text: string;
  script: "ar" | "ur" | "en";
  size: number;
  color?: string;
  weight?: number;
};

const ASHRA_DUA = [
  {
    ar: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ",
    en: "O Ever-Living, O Sustainer, by Your mercy I seek help.",
    ur: "اے زندہ، اے قائم رکھنے والے! تیری رحمت کے وسیلے سے فریاد کرتا ہوں۔",
  },
  {
    ar: "أَسْتَغْفِرُ اللّٰهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ",
    en: "I seek forgiveness from Allah, my Lord, for every sin, and I turn to Him.",
    ur: "میں اپنے رب اللہ سے ہر گناہ کی معافی مانگتا ہوں اور اسی کی طرف رجوع کرتا ہوں۔",
  },
  {
    ar: "اَللّٰهُمَّ أَجِرْنِي مِنَ النَّارِ",
    en: "O Allah, save me from the Fire.",
    ur: "اے اللہ! مجھے دوزخ کی آگ سے بچا۔",
  },
];

const T = {
  en: {
    title: "RAMADAN",
    sub: "KAREEM",
    cols: ["No", "Date", "Sehri ends", "Sunrise", "Iftar"],
    ashra: [
      "Days of Mercy · 1–10",
      "Days of Forgiveness · 11–20",
      "Salvation from Hell · 21–30",
    ],
    fitr: [
      "Sadaqat al-Fitr",
      "Due on every member of the household. Give it before the Eid prayer so those in need can celebrate too.",
    ],
    niyyah: [
      "Niyyah for Fasting",
      "I intend to keep tomorrow's fast of Ramadan.",
    ],
    iftar: [
      "Dua at Iftar",
      "The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills. (Abu Dawud)",
    ],
    qadr: [
      "Laylat al-Qadr",
      "Better than a thousand months. Seek it in the odd nights of the last ten: 21, 23, 25, 27, 29.",
    ],
    sadaqah: "Sadaqah Jariyah",
    note: (m: string, tz: string) =>
      `Calculated times (${m}, ${tz}). Sehri ends at Fajr. Dates depend on local moon sighting; follow your local mosque.`,
  },
  ur: {
    title: "رمضان کریم",
    sub: "",
    cols: ["روزہ", "تاریخ", "اختتامِ سحری", "طلوعِ آفتاب", "افطار"],
    ashra: ["پہلا عشرہ · رحمت", "دوسرا عشرہ · مغفرت", "تیسرا عشرہ · نجات"],
    fitr: [
      "صدقۂ فطر",
      "گھر کے ہر فرد کی طرف سے واجب ہے۔ عید کی نماز سے پہلے ادا کریں تاکہ ضرورت مند بھی عید منا سکیں۔",
    ],
    niyyah: ["روزے کی نیت", "میں نے کل کے رمضان کے روزے کی نیت کی۔"],
    iftar: [
      "افطار کی دعا",
      "پیاس بجھ گئی، رگیں تر ہو گئیں اور ان شاء اللہ اجر ثابت ہو گیا۔ (ابو داؤد)",
    ],
    qadr: [
      "شبِ قدر",
      "ہزار مہینوں سے بہتر۔ آخری عشرے کی طاق راتوں میں تلاش کریں: ۲۱، ۲۳، ۲۵، ۲۷، ۲۹۔",
    ],
    sadaqah: "صدقۂ جاریہ",
    note: (m: string, tz: string) =>
      `حسابی اوقات (${m}، ${tz})۔ سحری کا آخری وقت فجر ہے۔ تاریخیں مقامی رویتِ ہلال پر منحصر ہیں؛ اپنی مقامی مسجد کی پیروی کریں۔`,
  },
};

export async function drawRamadanPoster(o: {
  lang: Lang;
  hYear: number;
  place: string;
  methodName: string;
  timezone: string;
  days: Day[];
  time: (iso: string) => string;
  date: (iso: string) => string;
}) {
  const css = getComputedStyle(document.documentElement);
  const fam = {
    en: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    serif: css.getPropertyValue("--font-noto-serif").trim() || "Georgia, serif",
    ar: css.getPropertyValue("--font-amiri").trim() || "serif",
    ur: css.getPropertyValue("--font-nastaliq").trim() || "serif",
  };
  await Promise.all([
    document.fonts.load(`700 40px ${fam.serif}`, "RAMADAN"),
    document.fonts.load(`24px ${fam.ar}`, "يَا حَيُّ"),
    document.fonts.load(`24px ${fam.ur}`, "رمضان کریم"),
  ]).catch(() => {});

  const t = T[o.lang],
    ur = o.lang === "ur";
  const canvas = Object.assign(document.createElement("canvas"), {
    width: W,
    height: H,
  });
  const g = canvas.getContext("2d")!;
  const setFont = (
    script: Block["script"] | "serif",
    size: number,
    weight = 400,
  ) => {
    g.font = `${weight} ${size}px ${fam[script]}`;
    g.direction = script === "ar" || script === "ur" ? "rtl" : "ltr";
  };
  const text = (
    s: string,
    x: number,
    y: number,
    color: string,
    align: CanvasTextAlign = "center",
  ) => {
    g.fillStyle = color;
    g.textAlign = align;
    g.fillText(s, x, y);
  };
  const wrap = (s: string, max: number) => {
    const lines: string[] = [];
    let line = "";
    for (const w of s.split(" ")) {
      const next = line ? `${line} ${w}` : w;
      if (line && g.measureText(next).width > max) {
        lines.push(line);
        line = w;
      } else line = next;
    }
    return line ? [...lines, line] : lines;
  };
  const rr = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: string | CanvasGradient,
  ) => {
    g.beginPath();
    g.roundRect(x, y, w, h, r);
    g.fillStyle = fill;
    g.fill();
  };
  const star = (x: number, y: number, r: number, fill: string) => {
    g.fillStyle = fill;
    for (const rot of [0, Math.PI / 4]) {
      g.save();
      g.translate(x, y);
      g.rotate(rot);
      g.fillRect(-r, -r, r * 2, r * 2);
      g.restore();
    }
  };
  const lattice = (alpha: number, color = "255,255,255") => {
    g.strokeStyle = `rgba(${color},${alpha})`;
    g.lineWidth = 1.2;
    for (let x = 0; x < W + 48; x += 48)
      for (let y = 0; y < H + 48; y += 48) {
        for (const rot of [0, Math.PI / 4]) {
          g.save();
          g.translate(x, y);
          g.rotate(rot);
          g.strokeRect(-10, -10, 20, 20);
          g.restore();
        }
      }
  };

  // Page.
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, C.bg);
  bg.addColorStop(1, C.bg2);
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  lattice(0.05, "27,109,36");

  // Arch: ogee curve rising to a point at the centre.
  const arch = (dy: number) => {
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(W, 0);
    g.lineTo(W, 250 + dy);
    g.bezierCurveTo(W * 0.8, 250 + dy, W * 0.62, 215 + dy, W / 2, 105 + dy);
    g.bezierCurveTo(W * 0.38, 215 + dy, W * 0.2, 250 + dy, 0, 250 + dy);
    g.closePath();
  };
  arch(14);
  g.fillStyle = C.goldLight;
  g.fill();
  arch(0);
  const ag = g.createLinearGradient(0, 0, 0, 250);
  ag.addColorStop(0, C.deep);
  ag.addColorStop(1, C.green);
  g.fillStyle = ag;
  g.fill();
  g.save();
  g.clip();
  lattice(0.13);
  g.restore();

  // Hanging lanterns.
  for (const [x, len] of [
    [80, 120],
    [160, 70],
    [240, 150],
    [W - 240, 150],
    [W - 160, 70],
    [W - 80, 120],
  ]) {
    g.strokeStyle = C.cream;
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, len);
    g.stroke();
    star(x, len + 14, 11, C.cream);
    g.fillStyle = C.deep;
    g.beginPath();
    g.arc(x, len + 14, 5, 0, Math.PI * 2);
    g.fill();
  }

  // Title inside the arch opening.
  if (ur) {
    setFont("ur", 84, 700);
    text(t.title, W / 2, 360, C.green);
  } else {
    setFont("serif", 92, 700);
    text(t.title, W / 2, 340, C.green);
    setFont("serif", 50, 700);
    text(t.sub, W / 2, 400, C.gold);
    g.strokeStyle = C.gold;
    g.lineWidth = 2;
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(W / 2 + s * 130, 385);
      g.lineTo(W / 2 + s * 260, 385);
      g.stroke();
      star(W / 2 + s * 272, 385, 5, C.gold);
    }
  }
  const sub = ur
    ? `${o.place} · ${o.hYear} ھ`
    : `${o.place.toUpperCase()} · ${o.hYear} AH`;
  setFont(ur ? "ur" : "en", ur ? 24 : 22, 600);
  text(sub, W / 2, ur ? 432 : 440, C.muted);

  // Timetable.
  const top = 470,
    tx = 335,
    tw = 570,
    headH = 50;
  const rowH = Math.min(
    37,
    Math.floor((H - 140 - top - headH) / o.days.length),
  );
  const colW = [60, 150, 125, 110, 125];
  const order = ur ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4];
  const colX: number[] = [];
  order.reduce((x, c) => {
    colX[c] = x + colW[c] / 2;
    return x + colW[c];
  }, tx);

  g.save();
  g.shadowColor = "rgba(14,59,22,0.18)";
  g.shadowBlur = 30;
  g.shadowOffsetY = 10;
  rr(tx, top, tw, headH + rowH * o.days.length, 22, C.white);
  g.restore();
  g.save();
  g.beginPath();
  g.roundRect(tx, top, tw, headH + rowH * o.days.length, 22);
  g.clip();
  rr(tx, top, tw, headH, 0, C.green);
  t.cols.forEach((c, i) => {
    setFont(ur ? "ur" : "en", ur ? 19 : 16, 700);
    text(ur ? c : c.toUpperCase(), colX[i], top + (ur ? 34 : 32), C.cream);
  });

  o.days.forEach((d, i) => {
    const y = top + headH + i * rowH,
      mid = y + rowH / 2 + 6;
    const qadr = d.hijri.holidays.includes("Lailat-ul-Qadr");
    g.fillStyle = qadr
      ? "rgba(217,190,106,0.28)"
      : i % 2
        ? "rgba(27,109,36,0.06)"
        : C.white;
    g.fillRect(tx, y, tw, rowH);
    if (i === 10 || i === 20) {
      g.fillStyle = C.goldLight;
      g.fillRect(tx, y - 1, tw, 2);
    }
    setFont("en", 16, 700);
    if (qadr) star(colX[0], mid - 6, 13, "rgba(138,109,31,0.25)");
    text(String(d.hijri.day), colX[0], mid, C.green);
    setFont(ur ? "ur" : "en", ur ? 16 : 16, 500);
    text(o.date(d.date), colX[1], mid, C.ink);
    setFont("en", 16, 700);
    text(o.time(d.times.Fajr), colX[2], mid, C.deep);
    setFont("en", 16, 400);
    text(o.time(d.times.Sunrise), colX[3], mid, C.muted);
    setFont("en", 16, 700);
    text(o.time(d.times.Maghrib), colX[4], mid, C.green);
  });
  g.restore();

  // Side cards, spread to fill each column.
  const lang: Block["script"] = ur ? "ur" : "en";
  const tr = (s: string): Block => ({
    text: s,
    script: lang,
    size: ur ? 17 : 16,
    color: C.muted,
  });
  const cardW = 255,
    pad = 18;
  const measure = (blocks: Block[]) =>
    blocks.map((b) => {
      setFont(b.script, b.size, b.weight);
      const lh =
        b.script === "ur"
          ? b.size * 2.1
          : b.script === "ar"
            ? b.size * 1.7
            : b.size * 1.45;
      return { ...b, lines: wrap(b.text, cardW - pad * 2), lh };
    });
  const cardH = (m: ReturnType<typeof measure>) =>
    52 + pad + m.reduce((s, b) => s + b.lines.length * b.lh, 0) + pad;
  const drawCard = (
    x: number,
    y: number,
    title: string,
    m: ReturnType<typeof measure>,
    tone: "green" | "gold",
  ) => {
    const h = cardH(m);
    rr(
      x,
      y + 20,
      cardW,
      h - 20,
      18,
      tone === "gold" ? "rgba(217,190,106,0.18)" : C.white,
    );
    g.strokeStyle = tone === "gold" ? C.goldLight : "rgba(27,109,36,0.15)";
    g.lineWidth = 1.5;
    g.beginPath();
    g.roundRect(x, y + 20, cardW, h - 20, 18);
    g.stroke();
    rr(x + 16, y, cardW - 32, 42, 21, tone === "gold" ? C.gold : C.green);
    star(x + 34, y + 21, 5, C.cream);
    star(x + cardW - 34, y + 21, 5, C.cream);
    // Shrink long titles to fit the pill between its two stars.
    const label = ur ? title : title.toUpperCase();
    let size = ur ? 18 : 15;
    do setFont(ur ? "ur" : "en", size, 700);
    while (g.measureText(label).width > cardW - 96 && --size > 10);
    text(label, x + cardW / 2, y + (ur ? 29 : 27), C.white);
    let cy = y + 52 + pad;
    for (const b of m) {
      setFont(b.script, b.size, b.weight);
      for (const line of b.lines) {
        text(line, x + cardW / 2, cy + b.lh * 0.7, b.color ?? C.ink);
        cy += b.lh;
      }
    }
  };
  const column = (
    x: number,
    cards: { title: string; blocks: Block[]; tone?: "green" | "gold" }[],
  ) => {
    const m = cards.map((c) => measure(c.blocks));
    const total = m.reduce((s, b) => s + cardH(b), 0);
    const gap = Math.max(16, (H - 140 - top - total) / (cards.length - 1));
    let y = top;
    cards.forEach((c, i) => {
      drawCard(x, y, c.title, m[i], c.tone ?? "green");
      y += cardH(m[i]) + gap;
    });
  };

  column(ur ? W - 50 - cardW : 50, [
    ...ASHRA_DUA.map((d, i) => ({
      title: t.ashra[i],
      blocks: [
        { text: d.ar, script: "ar" as const, size: 27, color: C.deep },
        tr(d[o.lang]),
      ],
    })),
    { title: t.fitr[0], blocks: [tr(t.fitr[1])] },
  ]);
  column(ur ? 50 : W - 50 - cardW, [
    {
      title: t.niyyah[0],
      blocks: [
        {
          text: "وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ",
          script: "ar",
          size: 27,
          color: C.deep,
        },
        tr(t.niyyah[1]),
      ],
    },
    {
      title: t.iftar[0],
      blocks: [
        {
          text: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللّٰهُ",
          script: "ar",
          size: 27,
          color: C.deep,
        },
        tr(t.iftar[1]),
      ],
    },
    { title: t.qadr[0], blocks: [tr(t.qadr[1])] },
    {
      title: t.sadaqah,
      tone: "gold",
      blocks: [
        {
          text: DEDICATION[o.lang],
          script: lang,
          size: ur ? 19 : 17,
          weight: 700,
          color: C.gold,
        },
      ],
    },
  ]);

  // Footer band: dedication first, then the calculation note.
  rr(0, H - 110, W, 110, 0, C.deep);
  g.save();
  g.beginPath();
  g.rect(0, H - 110, W, 110);
  g.clip();
  lattice(0.08);
  g.restore();
  g.fillStyle = C.goldLight;
  g.fillRect(0, H - 110, W, 3);
  setFont(lang, ur ? 22 : 20, 700);
  text(DEDICATION[o.lang], W / 2, H - (ur ? 72 : 72), C.cream);
  const dw = g.measureText(DEDICATION[o.lang]).width / 2;
  star(W / 2 - dw - 24, H - 79, 6, C.goldLight);
  star(W / 2 + dw + 24, H - 79, 6, C.goldLight);
  setFont(lang, ur ? 13 : 13, 400);
  text(
    wrap(t.note(o.methodName, o.timezone), W - 120)[0],
    W / 2,
    H - (ur ? 36 : 38),
    "rgba(255,255,255,0.8)",
  );
  setFont("en", 12, 600);
  text("The Global Guide", W / 2, H - 12, "rgba(234,228,177,0.8)");

  return canvas;
}
