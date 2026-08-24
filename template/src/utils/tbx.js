/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// TBX-Basic (ISO 30042) export for the Variables collection, so terminology
// can be handed off to external CAT/TMS termbases the same way
// exportOutOfDateAsXliff hands off document content (see src/utils/xliff.js).
//
// Variables (not Glossary Terms) are the termbase source: glossary entries
// are user-facing hover definitions, while variables are the reusable
// substitution strings actually inserted into content — including per-set
// grammatical variants (e.g. plural forms as separate variables in the same
// set) — which is what a termbase is meant to track.

import { escapeXml } from "./xliff";

// conceptEntry/id must be a valid XML NCName. Combine set + key since keys
// are only unique within a set (e.g. "writing-terms" vs "languages").
function toNcName(key) {
  const cleaned = String(key || "").replace(/[^A-Za-z0-9_.-]/g, "_");
  return /^[A-Za-z_]/.test(cleaned) ? cleaned : `_${cleaned}`;
}

export function variableSetsToTbx(variableSets) {
  const sets = Array.isArray(variableSets) ? variableSets : [];

  const entries = sets
    .flatMap((set) => {
      const variables = Array.isArray(set.variables) ? set.variables : [];
      return variables.map((variable) => {
        const translations = Array.isArray(variable.translations)
          ? variable.translations
          : [];
        const langSecs = translations
          .filter((t) => t?.lang && t?.value)
          .map(
            (t) => `      <langSec xml:lang="${escapeXml(t.lang)}">
        <termSec>
          <term>${escapeXml(t.value)}</term>
        </termSec>
      </langSec>`
          )
          .join("\n");

        if (!langSecs) return "";

        const id = toNcName(`${set.name}_${variable.key}`);
        const context = set.name
          ? `
      <descripGrp>
        <descrip type="context">${escapeXml(set.name)}</descrip>
      </descripGrp>`
          : "";

        return `    <conceptEntry id="${id}">${context}
${langSecs}
    </conceptEntry>`;
      });
    })
    .filter(Boolean)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<tbx type="TBX-Basic" xml:lang="en" xmlns="urn:iso:std:iso:30042:ed-2">
  <tbxHeader>
    <fileDesc>
      <sourceDesc>
        <p>Exported from docStatic variables (reuse/variableSets)</p>
      </sourceDesc>
    </fileDesc>
  </tbxHeader>
  <text>
    <body>
${entries}
    </body>
  </text>
</tbx>
`;
}

// Fetches the variable sets document via the Tina GraphQL client (so
// unsaved-but-loaded CMS edits are reflected) and serializes it to TBX.
export async function exportVariablesAsTbx(client) {
  const result = await client.queries.variableSets({
    relativePath: "index.json",
  });
  const variableSets = result.data?.variableSets?.variableSets || [];
  return variableSetsToTbx(variableSets);
}
