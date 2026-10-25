import { dayKey, type Session } from "@/lib/tasbeeh";
import { DEDICATION } from "@/components/Footer";

const W = 1080, PAD = 72;
const C = { bg: "#FAF8F3", card: "#FFFFFF", ink: "#1A1C1C", muted: "#6B6F6B", green: "#1B6D24", deep: "#0E3B16", gold: "#8A6D1F", goldSoft: "#EAE4B1", line: "#E4E1D8" };

// Draws the tasbeeh history as a shareable card. Width is fixed; height follows the number of sessions.
export async function drawHistoryCard(days: { day: string; total: number }[], sessions: Session[]) {
  const css = getComputedStyle(document.documentElement);
  const urdu = css.getPropertyValue("--font-nastaliq").trim() || "serif";
  const sans = "system-ui, -apple-system, 'Segoe UI', sans-serif";
  await document.fonts.load(`28px ${urdu}`, DEDICATION.ur).catch(() => {});

  // Always seven bars, oldest → today, zero for days without counts.
  const totals = new Map(days.map((d) => [d.day, d.total]));
  const week = Array.from({ length: 7 }, (_, i) => {
    const day = dayKey(Date.now() - (6 - i) * 86_400_000);
    return { day, total: totals.get(day) ?? 0 };
  });
  const weekTotal = week.reduce((s, d) => s + d.total, 0);
  const rows = sessions.slice(0, 12);

  const H = 400 + 150 + 470 + 110 + Math.max(1, rows.length) * 84 + 230;
  const canvas = Object.assign(document.createElement("canvas"), { width: W, height: H });
  const g = canvas.getContext("2d")!;
  const font = (px: number, weight = 400, fam = sans) => (g.font = `${weight} ${px}px ${fam}`);
  const text = (s: string, x: number, y: number, color = C.ink, align: CanvasTextAlign = "left") => { g.fillStyle = color; g.textAlign = align; g.fillText(s, x, y); };
  const round = (x: number, y: number, w: number, h: number, r: number, fill: string) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); };

  g.fillStyle = C.bg;
  g.fillRect(0, 0, W, H);

  // Banner with the star lattice used across the site.
  const grad = g.createLinearGradient(0, 0, W, 320);
  grad.addColorStop(0, C.deep);
  grad.addColorStop(1, C.green);
  g.fillStyle = grad;
  g.fillRect(0, 0, W, 320);
  g.strokeStyle = "rgba(255,255,255,0.12)";
  g.lineWidth = 1.5;
  for (let x = 24; x < W; x += 64) for (let y = 24; y < 320; y += 64) {
    for (const rot of [0, Math.PI / 4]) { g.save(); g.translate(x, y); g.rotate(rot); g.strokeRect(-13, -13, 26, 26); g.restore(); }
  }
  g.fillStyle = "rgba(234,228,177,0.9)";
  g.beginPath(); g.arc(W - 150, 120, 70, 0, Math.PI * 2); g.fill();
  g.fillStyle = C.green;
  g.beginPath(); g.arc(W - 122, 102, 62, 0, Math.PI * 2); g.fill();
  font(22, 700); text("TASBEEH", PAD, 110, C.goldSoft);
  font(64, 700); text("My Dhikr History", PAD, 190, "#FFFFFF");
  font(26); text(`Exported ${new Date().toLocaleDateString(undefined, { dateStyle: "long" })}`, PAD, 245, "rgba(255,255,255,0.8)");

  // Summary tiles.
  let y = 400;
  const tiles = [
    ["This week", weekTotal.toLocaleString()],
    ["Sessions", String(sessions.length)],
    ["Completed", String(sessions.filter((s) => s.completed).length)],
  ];
  const tw = (W - PAD * 2 - 40) / 3;
  tiles.forEach(([label, value], i) => {
    const x = PAD + i * (tw + 20);
    round(x, y - 40, tw, 130, 24, C.card);
    font(20, 600); text(label.toUpperCase(), x + 28, y, C.muted);
    font(48, 700); text(value, x + 28, y + 62, i === 0 ? C.green : C.ink);
  });

  // Last 7 days bar chart.
  y += 150;
  round(PAD, y, W - PAD * 2, 430, 28, C.card);
  font(30, 700); text("Last 7 days", PAD + 36, y + 62);
  const max = Math.max(1, ...week.map((d) => d.total));
  const chartTop = y + 110, chartH = 230, bw = (W - PAD * 2 - 72) / 7;
  week.forEach((d, i) => {
    const x = PAD + 36 + i * bw, h = Math.max(6, (d.total / max) * chartH);
    const today = i === 6;
    round(x + 14, chartTop + chartH - h, bw - 28, h, 12, d.total ? (today ? C.green : "#8AC793") : C.line);
    font(22, 700); text(d.total ? d.total.toLocaleString() : "–", x + bw / 2, chartTop + chartH - h - 14, d.total ? C.ink : C.muted, "center");
    font(20, today ? 700 : 500); text(today ? "Today" : new Date(d.day + "T12:00").toLocaleDateString(undefined, { weekday: "short" }), x + bw / 2, chartTop + chartH + 40, today ? C.green : C.muted, "center");
  });

  // Recent sessions.
  y += 470;
  font(30, 700); text("Recent sessions", PAD, y + 40);
  y += 70;
  if (!rows.length) { font(24); text("No completed or reset rounds yet.", PAD, y + 40, C.muted); }
  rows.forEach((s, i) => {
    const ry = y + i * 84;
    round(PAD, ry, W - PAD * 2, 72, 18, i % 2 ? C.bg : C.card);
    font(26, 600); text(s.label.length > 34 ? s.label.slice(0, 33) + "…" : s.label, PAD + 28, ry + 32);
    font(19); text(new Date(s.endedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }), PAD + 28, ry + 58, C.muted);
    font(26, 700); text(`${s.count}/${s.target}`, W - PAD - 28, ry + 36, s.completed ? C.green : C.ink, "right");
    font(18, 600); text(s.completed ? "Completed" : "Reset early", W - PAD - 28, ry + 60, s.completed ? C.green : C.muted, "right");
  });

  // Dedication footer.
  const fy = H - 190;
  round(PAD, fy, W - PAD * 2, 150, 24, "rgba(138,109,31,0.1)");
  font(24, 700); text(DEDICATION.en, W / 2, fy + 52, C.gold, "center");
  g.direction = "rtl";
  font(28, 700, urdu); text(DEDICATION.ur, W / 2, fy + 112, C.gold, "center");
  g.direction = "ltr";
  font(18); text("The Global Guide", W / 2, H - 16, C.muted, "center");

  return canvas;
}
