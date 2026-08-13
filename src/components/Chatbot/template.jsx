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
            "MLC prebuilt model id, e.g. Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
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
      ],
    },
  ],
};

export const ChatbotCopyCollection = {
  name: "chatbotCopy",
  label: "Chatbot Copy",
  description:
    'Deployer-authored chatbot text. One document per language — add a document named to match a configured locale code (e.g. "ja") to override the default (English) copy for that language. Falls back to the default document for any locale without its own.',
  path: "config/chatbot-copy",
  format: "json",
  ui: {
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
    {
      type: "string",
      name: "webllmSystemPrompt",
      label: "WebLLM System Prompt",
      ui: {
        component: "textarea",
      },
    },
    {
      type: "string",
      name: "remoteSystemPrompt",
      label: "Remote Provider System Prompt",
      ui: {
        component: "textarea",
      },
    },
  ],
};
