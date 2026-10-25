import { test } from "node:test";
import assert from "node:assert/strict";
import { jpegToPdf } from "../src/lib/export.ts";

test("export: PDF xref offsets point at each object and startxref at the table", () => {
  const fakeJpeg = new Uint8Array([0xff, 0xd8, 1, 2, 3, 0xff, 0xd9]);
  const pdf = jpegToPdf(fakeJpeg, 1080, 1600);
  const text = new TextDecoder("latin1").decode(pdf);
  assert.ok(text.startsWith("%PDF-1.4\n") && text.endsWith("%%EOF\n"));
  const offsets = [...text.matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => +m[1]);
  assert.equal(offsets.length, 5);
  offsets.forEach((o, i) => assert.ok(text.startsWith(`${i + 1} 0 obj`, o), `object ${i + 1} at ${o}`));
  const startxref = +text.match(/startxref\n(\d+)/)![1];
  assert.ok(text.startsWith("xref\n", startxref));
  assert.match(text, /\/MediaBox \[0 0 595 881\]/);
  assert.match(text, /\/Length 7 >>/);
});
