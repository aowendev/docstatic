/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RemoteProvider } from "./RemoteProvider";
import { WebLLMProvider } from "./WebLLMProvider";

/**
 * @param {object} chatbotConfig - the parsed config/chatbot/index.json (technical settings)
 * @param {object} [copy] - the resolved, locale-appropriate config/chatbot-copy/*.json (deployer prose)
 * @returns {import("./WebLLMProvider").WebLLMProvider | import("./RemoteProvider").RemoteProvider}
 */
export function createProvider(chatbotConfig, copy) {
  if (chatbotConfig?.provider === "remote") {
    return new RemoteProvider({
      ...chatbotConfig.remote,
      systemPrompt: copy?.remoteSystemPrompt,
    });
  }
  return new WebLLMProvider({
    ...chatbotConfig?.webllm,
    systemPrompt: copy?.webllmSystemPrompt,
  });
}
