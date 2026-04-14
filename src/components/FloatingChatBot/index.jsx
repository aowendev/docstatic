/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// for settings, see: https://react-chatbotify.com/docs/v2/introduction/quickstart

import aiService from "../../services/aiService";
import React, { useId, useState, useRef, useEffect } from "react";
import ChatBot from "react-chatbotify";
import { useHistory } from "react-router-dom";

// boolean indicating if user is on desktop (otherwise treated as on mobile)
const isDesktop =
  !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

const FloatingChatBot = () => {
  const uniqueId = useId();
  const [debugInfo, setDebugInfo] = useState('');
  const history = useHistory();

  // Monitor AI service status
  const [aiStatus, setAiStatus] = useState({
    ready: aiService.isReady(),
    loading: aiService.isLoading(),
    error: aiService.hasError(),
    progress: aiService.getProgress(),
  });

  useEffect(() => {
    const updateStatus = () => {
      const newStatus = {
        ready: aiService.isReady(),
        loading: aiService.isLoading(), 
        error: aiService.hasError(),
        progress: aiService.getProgress(),
      };
      console.log('AI Service Status Update:', newStatus);
      setAiStatus(newStatus);
    };

    // Initial status
    updateStatus();

    // Listen for status changes
    const unsubscribe = aiService.onStatusChange(updateStatus);
    
    return unsubscribe;
  }, []);

  // Function to chat with AI using the service
  const chatWithAI = async (message) => {
    if (aiStatus.loading) {
      const gpuStatus = navigator.gpu ? "🚀 GPU-accelerated" : "💻 CPU-only";
      return `DocStatic AI assistant loading (${Math.round(aiStatus.progress)}%) - ${gpuStatus} mode. ${!navigator.gpu ? 'Enable WebGPU for faster responses!' : 'Almost ready to help with Docusaurus + TinaCMS questions!'}`;
    }
    
    if (aiStatus.error) {
      return "AI encountered an error during initialization. Using fallback responses for demonstration purposes.";
    }
    
    if (!aiStatus.ready) {
      return "AI is not available. Please refresh the page to try again.";
    }

    try {
      console.log('Sending message to AI service:', message);
      const response = await aiService.chat(message);
      return response;
    } catch (error) {
      console.error('Chat error:', error);
      return "Sorry, I encountered an error. This demo shows how local AI would work in a static site.";
    }
  };

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

  // Improved flow - separate states to prevent re-showing welcome message
  const flow = {
    start: {
      message: aiStatus.loading 
        ? `Hello! Loading docStatic AI assistant with documentation context in ${navigator.gpu ? '🚀 GPU-accelerated' : '💻 CPU-only'} mode... ${Math.round(aiStatus.progress)}% complete` 
        : aiStatus.error
        ? "Hello! AI had an issue loading, but I'm still here to help with docStatic questions using our documentation knowledge base."
        : aiStatus.ready 
        ? `Hi! I'm your ${navigator.gpu ? 'GPU-accelerated' : 'CPU-powered'} docStatic assistant with access to our complete documentation! I can help with Docusaurus, TinaCMS, MDX components, and documentation workflows. Everything runs locally in your browser!`
        : "Hello! I'm your docStatic documentation assistant with access to our knowledge base. How can I help with your Docusaurus + TinaCMS setup?",
      chatDisabled: false,
      path: async (params) => {
        // First user message - process and move to conversation state
        console.log('First user message:', params.userInput);
        
        const response = await chatWithAI(params.userInput);
        await params.streamMessage(response);
        return "conversation"; // Move to ongoing conversation state
      }
    },
    conversation: {
      // No message property - just handle user input
      chatDisabled: false,
      path: async (params) => {
        // Ongoing conversation - no welcome message
        console.log('User message in conversation:', params.userInput);
        
        const response = await chatWithAI(params.userInput);
        await params.streamMessage(response);
        return "conversation"; // Stay in conversation state
      }
    },
  };

  // Use a key based on AI status to re-render when status changes
  const chatBotKey = `${uniqueId}-${aiStatus.ready}-${aiStatus.loading}-${aiStatus.error}`;
  console.log('Rendering ChatBot with AI status:', aiStatus);
  
  return (
    <ChatBot
      key={chatBotKey}
      id={uniqueId}
      flow={flow}
      styles={styles}
      settings={settings}
    />
  );
};

export default FloatingChatBot;
