/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Translate, { translate } from "@docusaurus/Translate";
import React, { useState } from "react";
import styles from "./ChatWidget.module.css";
import { useChatEngine } from "./useChatEngine";
import { useOptIn } from "./useOptIn";

const ChatIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

function IntroPanel({ copy, onEnable }) {
  return (
    <div className={styles.intro}>
      <p>{copy.welcomeMessage}</p>
      <p className={styles.introNote}>
        <Translate id="chatbot.intro.note">
          Enabling this downloads an AI model (several hundred MB) to your
          browser the first time. It's cached afterward, but the initial
          download may take a while.
        </Translate>
      </p>
      <button type="button" className={styles.primaryButton} onClick={onEnable}>
        <Translate id="chatbot.intro.enableButton">
          Enable AI Assistant
        </Translate>
      </button>
    </div>
  );
}

function LoadingPanel({ status }) {
  const percent = Math.round((status.progress || 0) * 100);
  return (
    <div className={styles.intro}>
      <p>
        {status.status === "error" ? (
          <Translate id="chatbot.loading.error">Something went wrong</Translate>
        ) : (
          <Translate id="chatbot.loading.inProgress">
            Loading AI assistant…
          </Translate>
        )}
      </p>
      {status.status !== "error" && (
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
      <p className={styles.introNote}>{status.text}</p>
    </div>
  );
}

function MessageList({ messages }) {
  if (messages.length === 0) {
    return (
      <p className={styles.introNote}>
        <Translate id="chatbot.messages.empty">
          Ask a question to get started.
        </Translate>
      </p>
    );
  }
  return (
    <div className={styles.messages}>
      {messages.map((message, index) => (
        <div
          key={index}
          className={
            message.role === "user"
              ? styles.messageUser
              : styles.messageAssistant
          }
        >
          {message.content || "…"}
        </div>
      ))}
    </div>
  );
}

export function ChatWidget({ config, copy }) {
  const [isOpen, setIsOpen] = useState(false);
  const { optedIn, optIn } = useOptIn();
  const { status, messages, isGenerating, load, sendMessage, stopGeneration } =
    useChatEngine(config, copy);
  const [input, setInput] = useState("");

  const handleEnable = () => {
    optIn();
    load();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!input.trim() || isGenerating) return;
    sendMessage(input);
    setInput("");
  };

  const positionClass =
    config.ui?.position === "bottom-left" ? styles.left : styles.right;

  return (
    <div className={`${styles.container} ${positionClass}`}>
      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <span>{copy.launcherLabel}</span>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setIsOpen(false)}
              aria-label={translate({
                id: "chatbot.header.closeAriaLabel",
                message: "Close chat",
              })}
            >
              <CloseIcon />
            </button>
          </div>

          <div className={styles.body}>
            {!optedIn && <IntroPanel copy={copy} onEnable={handleEnable} />}
            {optedIn &&
              status.status !== "ready" &&
              status.status !== "error" && <LoadingPanel status={status} />}
            {optedIn && status.status === "error" && (
              <LoadingPanel status={status} />
            )}
            {optedIn && status.status === "ready" && (
              <MessageList messages={messages} />
            )}
          </div>

          {optedIn && status.status === "ready" && (
            <form className={styles.inputRow} onSubmit={handleSubmit}>
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={translate({
                  id: "chatbot.input.placeholder",
                  message: "Ask a question…",
                })}
                className={styles.input}
                disabled={isGenerating}
              />
              {isGenerating ? (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={stopGeneration}
                >
                  <Translate id="chatbot.input.stop">Stop</Translate>
                </button>
              ) : (
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={!input.trim()}
                >
                  <Translate id="chatbot.input.send">Send</Translate>
                </button>
              )}
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        className={styles.launcher}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={
          isOpen
            ? translate({
                id: "chatbot.launcher.closeAriaLabel",
                message: "Close AI assistant",
              })
            : translate({
                id: "chatbot.launcher.openAriaLabel",
                message: "Open AI assistant",
              })
        }
      >
        <ChatIcon />
      </button>
    </div>
  );
}
