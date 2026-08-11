/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Run async work such that only the most recent call may report a result.
 *
 * The dashboards all fetch on demand and write the outcome into React state.
 * Without this, two hazards apply: a slow first request can resolve after a
 * faster second one and overwrite newer data, and a request in flight when the
 * component unmounts still writes state afterwards.
 *
 * Deliberately framework-free so the sequencing can be tested directly. The
 * React binding is useTinaTask.js.
 */
export function createLatestOnly() {
  let currentToken = 0;
  let disposed = false;

  /**
   * @param {(ctx: { isCurrent: () => boolean }) => Promise<T>} task
   * @returns {Promise<{ status: "ok"|"error"|"stale", value?: T, error?: Error }>}
   * @template T
   */
  async function run(task) {
    currentToken += 1;
    const token = currentToken;
    const isCurrent = () => !disposed && token === currentToken;

    try {
      const value = await task({ isCurrent });
      return isCurrent() ? { status: "ok", value } : { status: "stale" };
    } catch (error) {
      return isCurrent()
        ? { status: "error", error }
        : { status: "stale", error };
    }
  }

  /** Abandon anything in flight; every later result reports as stale. */
  function dispose() {
    disposed = true;
    currentToken += 1;
  }

  /**
   * Re-arm after a dispose. React StrictMode mounts, unmounts and remounts an
   * effect in development; without this the cleanup's dispose() would kill the
   * runner permanently and every later run would report stale — leaving the
   * UI stuck on its loading state with nothing in flight.
   */
  function revive() {
    disposed = false;
    currentToken += 1;
  }

  return { run, dispose, revive, isDisposed: () => disposed };
}
