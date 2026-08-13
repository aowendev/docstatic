/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { withContext } from "./BaseProvider";

/**
 * Talks to a deployer-hosted backend/proxy — never to a paid provider's API
 * directly. The endpoint is expected to hold the real provider API key
 * server-side and normalize its response into a simple SSE stream of
 * `data: {"delta": "...", "done": false}` events, terminated by `data: [DONE]`.
 * See docs/chatbot.mdx for example proxy implementations.
 */
export class RemoteProvider {
  /** @param {{ endpoint?: string, systemPrompt?: string }} [config] */
  constructor(config = {}) {
    this.endpoint = config.endpoint || "";
    this.systemPrompt = config.systemPrompt || "";
    this.isLoaded = false;
  }

  async init(onProgress) {
    if (!this.endpoint) {
      onProgress?.({
        status: "error",
        text: "No remote endpoint configured. Set chatbot.remote.endpoint in the site settings.",
      });
      throw new Error("RemoteProvider: missing endpoint");
    }
    this.isLoaded = true;
    onProgress?.({ status: "ready", progress: 1 });
  }

  async *chat({ messages, context, signal }) {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: withContext(messages, context, this.systemPrompt),
      }),
      signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`RemoteProvider: request failed (${response.status})`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done: streamDone } = await reader.read();
      if (streamDone) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const line = event.split("\n").find((l) => l.startsWith("data:"));
        if (!line) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") {
          yield { delta: "", done: true };
          return;
        }
        try {
          const parsed = JSON.parse(data);
          yield { delta: parsed.delta || "", done: Boolean(parsed.done) };
        } catch {
          // Ignore malformed SSE chunks rather than aborting the whole stream.
        }
      }
    }
  }

  async dispose() {
    this.isLoaded = false;
  }
}
