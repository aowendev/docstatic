/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import chatbotConfig from "@site/config/chatbot/index.json";
import React from "react";
import { ChatWidget } from "./ChatWidget";

// Rendering this component at all (see src/theme/Root.js) already implies
// the site-owner "enabled" switch is on — this only renders the per-visitor
// launcher/panel described in useOptIn.js.
export default function Chatbot() {
  return <ChatWidget config={chatbotConfig} />;
}
