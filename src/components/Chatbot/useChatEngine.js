/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useCallback, useRef, useState } from "react";
import { createProvider } from "./providers/createProvider";
import { buildContext } from "./retrieval/buildContext";
import { fetchSearchIndex } from "./retrieval/fetchSearchIndex";
import { rankChunks } from "./retrieval/rankChunks";

/**
 * Owns the provider instance, streaming state, and message history for the
 * chat widget. The provider is only ever created/initialized by calling
 * `load()`, which the widget wires to the visitor's explicit opt-in click —
 * never on mount.
 */
export function useChatEngine(chatbotConfig) {
  const { siteConfig } = useDocusaurusContext();
  const providerRef = useRef(null);
  const historyRef = useRef([]);
  const abortRef = useRef(null);

  const [status, setStatus] = useState({
    status: "idle",
    progress: 0,
    text: "",
  });
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const load = useCallback(async () => {
    if (providerRef.current) return;
    const provider = createProvider(chatbotConfig);
    providerRef.current = provider;
    try {
      await provider.init((progress) => setStatus(progress));
    } catch (err) {
      setStatus({ status: "error", progress: 0, text: err.message });
    }
  }, [chatbotConfig]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const sendMessage = useCallback(
    async (question) => {
      const provider = providerRef.current;
      const trimmed = question.trim();
      if (!provider?.isLoaded || !trimmed || isGenerating) return;

      const providerMessages = [
        ...historyRef.current,
        { role: "user", content: trimmed },
      ];
      setMessages((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: "" },
      ]);
      setIsGenerating(true);

      const controller = new AbortController();
      abortRef.current = controller;

      let assistantText = "";
      try {
        const index = await fetchSearchIndex(siteConfig.baseUrl);
        const chunks = rankChunks(trimmed, index);
        const context = buildContext(chunks);

        for await (const chunk of provider.chat({
          messages: providerMessages,
          context,
          signal: controller.signal,
        })) {
          if (chunk.delta) {
            assistantText += chunk.delta;
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                role: "assistant",
                content: assistantText,
              };
              return next;
            });
          }
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          assistantText =
            assistantText || `Sorry, something went wrong: ${err.message}`;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              role: "assistant",
              content: assistantText,
            };
            return next;
          });
        }
      } finally {
        historyRef.current = [
          ...providerMessages,
          { role: "assistant", content: assistantText },
        ];
        setIsGenerating(false);
        abortRef.current = null;
      }
    },
    [isGenerating, siteConfig.baseUrl]
  );

  return { status, messages, isGenerating, load, sendMessage, stopGeneration };
}
