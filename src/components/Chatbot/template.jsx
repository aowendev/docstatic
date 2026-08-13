/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const ChatbotCollection = {
  name: "chatbot",
  label: "Chatbot",
  path: "config/chatbot",
  format: "json",
  ui: {
    global: true,
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  fields: [
    {
      type: "string",
      label: "Label",
      name: "label",
      required: true,
      isTitle: true,
      ui: {
        component: "hidden",
      },
    },
    {
      type: "boolean",
      name: "enabled",
      label: "Enable Chatbot",
      description:
        "Master switch. When off, no chatbot code or UI ships to visitors at all. Off by default.",
      ui: {
        component: "button-toggle",
      },
    },
    {
      type: "string",
      name: "provider",
      label: "AI Provider",
      ui: {
        component: "select",
      },
      options: [
        { value: "webllm", label: "WebLLM (in-browser, free)" },
        { value: "remote", label: "Remote API (deployer-hosted proxy)" },
      ],
    },
    {
      type: "object",
      name: "webllm",
      label: "WebLLM Settings",
      fields: [
        {
          type: "string",
          name: "model",
          label: "Model",
          description:
            "MLC prebuilt model id, e.g. Llama-3.2-1B-Instruct-q4f16_1-MLC",
        },
        {
          type: "string",
          name: "systemPrompt",
          label: "System Prompt",
          ui: {
            component: "textarea",
          },
        },
      ],
    },
    {
      type: "object",
      name: "remote",
      label: "Remote Provider Settings",
      fields: [
        {
          type: "string",
          name: "endpoint",
          label: "Proxy Endpoint URL",
          description:
            "Your own backend/serverless URL that holds the real provider API key server-side. Never put a real API key in this file — it ships in the public site bundle.",
        },
        {
          type: "string",
          name: "systemPrompt",
          label: "System Prompt",
          ui: {
            component: "textarea",
          },
        },
      ],
    },
    {
      type: "object",
      name: "ui",
      label: "Widget",
      fields: [
        {
          type: "string",
          name: "position",
          label: "Position",
          ui: {
            component: "button-toggle",
          },
          options: [
            { label: "Bottom Right", value: "bottom-right" },
            { label: "Bottom Left", value: "bottom-left" },
          ],
        },
        {
          type: "string",
          name: "launcherLabel",
          label: "Launcher Button Label",
        },
        {
          type: "string",
          name: "welcomeMessage",
          label: "Welcome Message",
          ui: {
            component: "textarea",
          },
        },
      ],
    },
  ],
};
