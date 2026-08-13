/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import chatbotConfig from "../../../config/chatbot/index.json";
import docusaurusData from "../../../config/docusaurus/index.json";
import { resolveTranslation } from "../../utils/resolveTranslations";

export function getChatbotCopy(locale) {
  return resolveTranslation(
    chatbotConfig.translations,
    locale,
    docusaurusData.languages?.default
  );
}
