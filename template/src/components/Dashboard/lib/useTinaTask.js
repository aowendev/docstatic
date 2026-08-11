/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createLatestOnly } from "./latestOnly";
import { getTinaClient } from "./tinaClient";

/**
 * Shared data-fetching plumbing for the dashboards: owns loading and error
 * state, hands the task a ready Tina client, and drops the result of any run
 * that has been superseded or whose component has unmounted.
 *
 * Replaces the copy of this logic that each dashboard carried, none of which
 * cancelled on unmount.
 *
 *   const { loading, error, setError, run } = useTinaTask();
 *   const load = () =>
 *     run(async ({ client, isCurrent }) => {
 *       const res = await client.queries.docConnection({ first: 100 });
 *       if (isCurrent()) setDocs(res.data.docConnection.edges);
 *     });
 */
export function useTinaTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const runnerRef = useRef(null);

  if (runnerRef.current === null) {
    runnerRef.current = createLatestOnly();
  }

  useEffect(() => {
    const runner = runnerRef.current;
    // revive() matters under StrictMode, which runs mount -> cleanup -> mount.
    runner.revive();
    return () => runner.dispose();
  }, []);

  const run = useCallback(async (task) => {
    const runner = runnerRef.current;

    setLoading(true);
    setError(null);

    const outcome = await runner.run(async ({ isCurrent }) => {
      const client = await getTinaClient();
      return task({ client, isCurrent });
    });

    // A superseded or unmounted run must not touch state — that is the whole
    // point of routing through createLatestOnly.
    if (outcome.status === "stale") return outcome;

    if (outcome.status === "error") {
      setError(outcome.error?.message || String(outcome.error));
    }
    setLoading(false);
    return outcome;
  }, []);

  return { loading, error, setError, setLoading, run };
}
