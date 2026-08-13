/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { withContext } from "./BaseProvider";

const DEFAULT_MODEL = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";

/**
 * In-browser inference via WebLLM (WebGPU). Runs on the main thread for now —
 * see docs/chatbot.mdx for the Web Worker upgrade path.
 */
export class WebLLMProvider {
  /** @param {{ model?: string, systemPrompt?: string }} [config] */
  constructor(config = {}) {
    this.model = config.model || DEFAULT_MODEL;
    this.systemPrompt = config.systemPrompt || "";
    this.engine = null;
    this.isLoaded = false;
  }

  async init(onProgress) {
    if (this.isLoaded) return;
    onProgress?.({
      status: "downloading",
      progress: 0,
      text: "Starting download…",
    });

    const { CreateMLCEngine } = await import("@mlc-ai/web-llm");

    this.engine = await CreateMLCEngine(this.model, {
      initProgressCallback: (report) => {
        onProgress?.({
          status: report.progress >= 1 ? "loading" : "downloading",
          progress: report.progress,
          text: report.text,
        });
      },
    });

    this.isLoaded = true;
    onProgress?.({ status: "ready", progress: 1, text: "Ready" });
  }

  async *chat({ messages, context, signal }) {
    if (!this.isLoaded || !this.engine) {
      throw new Error("WebLLMProvider.chat() called before init() completed");
    }

    const onAbort = () => this.engine.interruptGenerate();
    signal?.addEventListener("abort", onAbort);

    try {
      const stream = await this.engine.chat.completions.create({
        messages: withContext(messages, context, this.systemPrompt),
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content || "";
        const done = Boolean(chunk.choices?.[0]?.finish_reason);
        if (delta || done) {
          yield { delta, done };
        }
      }
    } finally {
      signal?.removeEventListener("abort", onAbort);
    }
  }

  async dispose() {
    if (this.engine) {
      await this.engine.unload();
    }
    this.engine = null;
    this.isLoaded = false;
  }
}
