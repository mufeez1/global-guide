// Client-side file exports without a PDF library.

export function download(blob: Blob, filename: string) {
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: filename });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// Wraps one JPEG in a single-page PDF, 595pt (A4) wide with the page height following the image.
export function jpegToPdf(jpeg: Uint8Array, width: number, height: number): Uint8Array {
  const pw = 595, ph = Math.round((595 * height) / width);
  const enc = new TextEncoder();
  const content = `q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q`;
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let size = 0;
  const push = (p: string | Uint8Array) => { const b = typeof p === "string" ? enc.encode(p) : p; parts.push(b); size += b.length; };
  const obj = (body: string) => { offsets.push(size); push(`${offsets.length} 0 obj\n${body}\nendobj\n`); };

  push("%PDF-1.4\n");
  obj("<< /Type /Catalog /Pages 2 0 R >>");
  obj("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  obj(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  offsets.push(size);
  push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
  push(jpeg);
  push("\nendstream\nendobj\n");
  obj(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

  const xref = size;
  push(`xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`);
  push(`trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

  const out = new Uint8Array(size);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}
