/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import chatbotConfig from "@site/config/chatbot/index.json";
import React from "react";
import { ChatWidget } from "./ChatWidget";
import { getChatbotCopy } from "./getChatbotCopy";

// Rendering this component at all (see src/theme/Root.js) already implies
// the site-owner "enabled" switch is on — this only renders the per-visitor
// launcher/panel described in useOptIn.js.
export default function Chatbot() {
  const { i18n } = useDocusaurusContext();
  const copy = getChatbotCopy(i18n.currentLocale);

  return <ChatWidget config={chatbotConfig} copy={copy} />;
}
