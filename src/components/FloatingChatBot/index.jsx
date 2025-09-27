/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import LlmConnector, { GeminiProvider } from "@rcb-plugins/llm-connector";
import React, { useId } from "react";
import ChatBot from "react-chatbotify";
import { useHistory } from "react-router-dom";

// boolean indicating if user is on desktop (otherwise treated as on mobile)
const isDesktop =
  !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

const FloatingChatBot = () => {
  const uniqueId = useId();

  // gemini api key, required since we're using 'direct' mode for testing
  const apiKey = "";

  // initialize the plugin
  const plugins = [LlmConnector()];

  const history = useHistory();
  const navigatePage = (page, params) => {
    if (page.startsWith("https")) {
      if (isDesktop) {
        window.open(page);
      } else {
        window.location.href = page;
      }
    } else {
      if (!isDesktop) {
        params.toggleChatWindow(false);
      }
      history.push(page);
    }
  };
  const helpOptions = ["Introduction", "Features"];

  const settings = {
    general: {
      primaryColor: "#005eb8",
      secondaryColor: "#0099ff",
      showFooter: false,
    },
    tooltip: {
      mode: "NEVER",
    },
    header: {
      title: "docBot",
      showAvatar: false,
    },
    notification: {
      disabled: true,
    },
  };

  // example flow for testing
  const flow = {
    start: {
      message:
        "Hello! Make sure you've set your API key before getting started!",
      options: ["I am ready!"],
      chatDisabled: true,
      path: async (params) => {
        if (!apiKey) {
          await params.simulateStreamMessage("You have not set your API key!");
          return "start";
        }
        await params.simulateStreamMessage("Ask away!");
        return "gemini";
      },
    },
    gemini: {
      llmConnector: {
        // provider configuration guide:
        // https://github.com/React-ChatBotify-Plugins/llm-connector/blob/main/docs/providers/Gemini.md
        provider: new GeminiProvider({
          mode: "direct",
          model: "gemini-1.5-flash",
          responseFormat: "stream",
          apiKey: apiKey,
        }),
        outputType: "character",
      },
    },
  };
  return <ChatBot id={uniqueId} flow={flow} settings={settings} />;
};

export default FloatingChatBot;
