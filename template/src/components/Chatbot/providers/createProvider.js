/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RemoteProvider } from "./RemoteProvider";
import { WebLLMProvider } from "./WebLLMProvider";

/**
 * @param {object} chatbotConfig - the parsed config/chatbot/index.json
 * @returns {import("./WebLLMProvider").WebLLMProvider | import("./RemoteProvider").RemoteProvider}
 */
export function createProvider(chatbotConfig) {
  if (chatbotConfig?.provider === "remote") {
    return new RemoteProvider(chatbotConfig.remote);
  }
  return new WebLLMProvider(chatbotConfig?.webllm);
}
