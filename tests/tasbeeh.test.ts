import { test } from "node:test";
import assert from "node:assert/strict";
import { PRESETS, newCounter, increment, undo, reset, addDaily, dayKey } from "../src/lib/tasbeeh.ts";

const T0 = Date.parse("2026-10-23T10:00:00");

test("tasbeeh: counting to the target completes a round and logs a session", () => {
  let c = { ...newCounter(PRESETS[0], T0), target: 3 };
  let done;
  for (let i = 1; i <= 3; i++) ({ counter: c, completed: done } = increment(c, T0 + i));
  assert.equal(c.count, 3);
  assert.equal(c.rounds, 1);
  assert.deepEqual(done && { count: done.count, completed: done.completed, startedAt: done.startedAt }, { count: 3, completed: true, startedAt: T0 + 1 });
  // Next tap starts a new round.
  ({ counter: c } = increment(c, T0 + 10));
  assert.equal(c.count, 1);
  assert.equal(c.startedAt, T0 + 10);
});

test("tasbeeh: undo steps back and un-counts a completed round, never below zero", () => {
  let c = { ...newCounter(PRESETS[0], T0), target: 2 };
  c = increment(increment(c, T0).counter, T0).counter;
  assert.equal(c.rounds, 1);
  c = undo(c, T0);
  assert.deepEqual([c.count, c.rounds], [1, 0]);
  assert.equal(undo(undo(c, T0), T0).count, 0);
});

test("tasbeeh: reset logs an unfinished round, not an empty or completed one", () => {
  let c = newCounter(PRESETS[0], T0);
  assert.equal(reset(c, T0).session, undefined);
  c = increment(c, T0).counter;
  const r = reset(c, T0 + 5);
  assert.equal(r.counter.count, 0);
  assert.deepEqual(r.session && [r.session.count, r.session.completed], [1, false]);
});

test("tasbeeh: daily totals key by local day and never go negative", () => {
  const c = newCounter(PRESETS[1], T0);
  const d = addDaily(undefined, c, 1, T0);
  assert.equal(d.id, `${dayKey(T0)}:alhamdulillah`);
  assert.equal(addDaily(d, c, -5, T0).count, 0);
});
