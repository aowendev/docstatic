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

  const computed = getComputedStyle(document.documentElement);
  const settings = {
    general: {
      primaryColor: computed.getPropertyValue("--ifm-color-primary-lightest"),
      secondaryColor: computed.getPropertyValue("--ifm-color-primary-darkest"),
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

  // Dynamically inherit styles from Docusaurus ifm CSS variables
  const [styles, setStyles] = React.useState({});

  React.useEffect(() => {
    function updateStyles() {
      const computed = getComputedStyle(document.documentElement);
      setStyles({
        bodyStyle: {
          backgroundColor: computed.getPropertyValue("--ifm-background-color"),
        },
        chatHistoryButtonStyle: {
          backgroundColor: computed.getPropertyValue("--ifm-background-color"),
          color: computed.getPropertyValue("--ifm-font-color-base"),
        },
        chatHistoryButtonHoveredStyle: {
          backgroundColor: computed.getPropertyValue(
            "--ifm-color-primary-lightest"
          ),
          color: "white",
        },
        chatInputContainerStyle: {
          backgroundColor: computed.getPropertyValue("--ifm-background-color"),
        },
        chatInputAreaStyle: {
          backgroundColor: computed.getPropertyValue("--ifm-background-color"),
          color: computed.getPropertyValue("--ifm-font-color-base"),
        },
        botBubbleStyle: {
          backgroundColor: computed.getPropertyValue(
            "--ifm-color-secondary-lightest"
          ),
          color: "black",
        },
        userBubbleStyle: {
          backgroundColor: computed.getPropertyValue(
            "--ifm-color-primary-lightest"
          ),
          color: "white",
        },
        botOptionStyle: {
          backgroundColor: computed.getPropertyValue("--ifm-background-color"),
          color: computed.getPropertyValue("--ifm-font-color-base"),
        },
        botOptionHoveredStyle: {
          backgroundColor: computed.getPropertyValue(
            "--ifm-color-primary-lightest"
          ),
          color: "white",
        },
        sendButtonStyle: {
          backgroundColor: computed.getPropertyValue("--ifm-color-primary"),
        },
        sendButtonHoveredStyle: {
          backgroundColor: computed.getPropertyValue(
            "--ifm-color-primary-darkest"
          ),
        },
      });
    }
    updateStyles();
    const observer = new MutationObserver(updateStyles);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    window.addEventListener("storage", updateStyles);
    window.addEventListener("docusaurus.themeChanged", updateStyles);
    return () => {
      observer.disconnect();
      window.removeEventListener("storage", updateStyles);
      window.removeEventListener("docusaurus.themeChanged", updateStyles);
    };
  }, []);

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
          model: "gemini-2.0-flash",
          responseFormat: "stream",
          apiKey: apiKey,
        }),
        outputType: "character",
      },
    },
  };

  // Use a key based on a hash of the styles object to force re-mount on theme change
  const stylesKey = JSON.stringify(styles);
  return (
    <ChatBot
      key={stylesKey}
      id={uniqueId}
      flow={flow}
      styles={styles}
      settings={settings}
    />
  );
};

export default FloatingChatBot;
