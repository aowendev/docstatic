import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import React from "react";

let ChatBot = null;
let InputValidator = null;
let MarkdownRenderer = null;
let HtmlRenderer = null;
let LlmConnector = null;
let llmConnector = {};
let reactChatbotify = {};

if (ExecutionEnvironment.canUseDOM) {
  // imports react chatbotify core library
  const chatbotifyModule = require("react-chatbotify");
  ChatBot = chatbotifyModule.default;
  reactChatbotify = { ...chatbotifyModule };
  delete reactChatbotify.default;

  // imports rcb plugin - input validator
  InputValidator = require("@rcb-plugins/input-validator");

  // imports rcb plugin - markdown renderer
  MarkdownRenderer = require("@rcb-plugins/markdown-renderer");

  // imports rcb plugin - html renderer
  HtmlRenderer = require("@rcb-plugins/html-renderer");

  // imports rcb plugin - llm connector
  const llmConnectorModule = require("@rcb-plugins/llm-connector");
  LlmConnector = llmConnectorModule.default;
  llmConnector = { ...llmConnectorModule };
  delete llmConnector.default;
}

const ReactLiveScope = {
  React,
  ChatBot,
  ...reactChatbotify,
  InputValidator,
  MarkdownRenderer,
  HtmlRenderer,
  LlmConnector,
  ...llmConnector,
  GoogleGenerativeAI,
  OpenAI,
};

export default ReactLiveScope;
