/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The dashboards previously wrote fetch results into React state with no
 * guard, so a slow request could overwrite newer data and an in-flight request
 * could write after unmount. createLatestOnly is what prevents both, so the
 * sequencing is tested directly.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { createLatestOnly } from "../src/components/Dashboard/lib/latestOnly.js";

const defer = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

test("a single run reports its value", async () => {
  const runner = createLatestOnly();

  const outcome = await runner.run(async () => "value");

  assert.deepEqual(outcome, { status: "ok", value: "value" });
});

test("a thrown error is reported, not propagated", async () => {
  const runner = createLatestOnly();

  const outcome = await runner.run(async () => {
    throw new Error("boom");
  });

  assert.equal(outcome.status, "error");
  assert.equal(outcome.error.message, "boom");
});

test("a slow earlier run cannot overwrite a faster later one", async () => {
  const runner = createLatestOnly();
  const slow = defer();
  const fast = defer();

  const first = runner.run(() => slow.promise);
  const second = runner.run(() => fast.promise);

  fast.resolve("second");
  assert.deepEqual(await second, { status: "ok", value: "second" });

  // The stale request finishes last, which is exactly the overwrite hazard.
  slow.resolve("first");
  assert.equal((await first).status, "stale");
});

test("isCurrent goes false for a superseded run", async () => {
  const runner = createLatestOnly();
  const gate = defer();
  let firstSawCurrent = null;

  const first = runner.run(async ({ isCurrent }) => {
    await gate.promise;
    firstSawCurrent = isCurrent();
    return "first";
  });

  await runner.run(async () => "second");
  gate.resolve();
  await first;

  assert.equal(
    firstSawCurrent,
    false,
    "the task must be able to skip its own state writes"
  );
});

test("isCurrent stays true for the only run", async () => {
  const runner = createLatestOnly();
  let sawCurrent = null;

  await runner.run(async ({ isCurrent }) => {
    sawCurrent = isCurrent();
    return null;
  });

  assert.equal(sawCurrent, true);
});

test("dispose makes an in-flight result stale", async () => {
  const runner = createLatestOnly();
  const gate = defer();

  const pending = runner.run(() => gate.promise);
  runner.dispose();
  gate.resolve("late");

  assert.equal((await pending).status, "stale");
});

test("dispose makes an in-flight rejection stale too", async () => {
  const runner = createLatestOnly();
  const gate = defer();

  const pending = runner.run(() => gate.promise);
  runner.dispose();
  gate.reject(new Error("late failure"));

  const outcome = await pending;
  assert.equal(
    outcome.status,
    "stale",
    "an unmounted component must not be shown an error"
  );
});

test("isCurrent is false inside a task after dispose", async () => {
  const runner = createLatestOnly();
  const gate = defer();
  let sawCurrent = null;

  const pending = runner.run(async ({ isCurrent }) => {
    await gate.promise;
    sawCurrent = isCurrent();
  });

  runner.dispose();
  gate.resolve();
  await pending;

  assert.equal(sawCurrent, false);
});

test("runs started after dispose are stale immediately", async () => {
  const runner = createLatestOnly();
  runner.dispose();

  const outcome = await runner.run(async () => "value");

  assert.equal(outcome.status, "stale");
  assert.equal(runner.isDisposed(), true);
});

test("the newest of several concurrent runs wins", async () => {
  const runner = createLatestOnly();
  const gates = [defer(), defer(), defer()];

  const runs = gates.map((g, i) => runner.run(() => g.promise.then(() => i)));

  // resolve out of order: middle, last, first
  gates[1].resolve();
  gates[2].resolve();
  gates[0].resolve();

  const outcomes = await Promise.all(runs);
  assert.deepEqual(
    outcomes.map((o) => o.status),
    ["stale", "stale", "ok"]
  );
  assert.equal(outcomes[2].value, 2);
});

test("revive re-arms a disposed runner (React StrictMode remount)", async () => {
  const runner = createLatestOnly();

  // StrictMode in development runs mount -> cleanup -> mount on the same
  // runner instance. Without revive() the cleanup's dispose() is permanent and
  // every later run reports stale, leaving the UI stuck on "Loading" with
  // nothing in flight.
  runner.dispose();
  assert.equal((await runner.run(async () => "x")).status, "stale");

  runner.revive();

  assert.equal(runner.isDisposed(), false);
  assert.deepEqual(await runner.run(async () => "x"), {
    status: "ok",
    value: "x",
  });
});

test("revive does not resurrect work started before it", async () => {
  const runner = createLatestOnly();
  const gate = defer();

  const pending = runner.run(() => gate.promise);
  runner.dispose();
  runner.revive();
  gate.resolve("late");

  assert.equal(
    (await pending).status,
    "stale",
    "a run from the previous lifecycle must not report into the new one"
  );
});
