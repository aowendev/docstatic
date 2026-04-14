/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Minimal XLIFF 2.2 helpers for exporting/importing translation bundles
// Exports title and body as JSON string in <target> so MDX/React content is preserved.

function escapeXml(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function unescapeXml(safe) {
  if (safe === null || safe === undefined) return '';
  return String(safe)
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}

export function generateXliff(documents, sourceLocale = 'en', targetLocale = 'es') {
  const xliffHeader = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="2.1" xmlns="urn:oasis:names:tc:xliff:document:2.1" srcLang="${sourceLocale}" trgLang="${targetLocale}">
  <file id="f1">
    <body>`;

  const xliffFooter = `    </body>
  </file>
</xliff>`;

  let units = '';
  let unitId = 1;

  for (const doc of documents) {
    if (doc.title) {
      units += `      <unit id="u${unitId}">
        <segment>
          <source>${escapeXml(doc.title)}</source>
          <target></target>
        </segment>
      </unit>
`;
      unitId++;
    }

    if (doc.body) {
      // Export the entire body as JSON to preserve MDX structure
      const bodyJson = JSON.stringify(doc.body);
      units += `      <unit id="u${unitId}">
        <segment>
          <source>${escapeXml(bodyJson)}</source>
          <target></target>
        </segment>
      </unit>
`;
      unitId++;
    }
  }

  return xliffHeader + units + xliffFooter;
}

export function parseXliff(xliffContent) {
  // Basic XLIFF parsing - in production you'd use a proper XML parser
  const units = [];
  const unitRegex = /<unit id="([^"]+)">(.*?)<\/unit>/gs;
  
  let match;
  while ((match = unitRegex.exec(xliffContent)) !== null) {
    const unitId = match[1];
    const unitContent = match[2];
    
    const sourceMatch = /<source>(.*?)<\/source>/s.exec(unitContent);
    const targetMatch = /<target>(.*?)<\/target>/s.exec(unitContent);
    
    if (sourceMatch && targetMatch) {
      const source = unescapeXml(sourceMatch[1]);
      const target = unescapeXml(targetMatch[1]);
      
      units.push({
        id: unitId,
        source: source,
        target: target
      });
    }
  }
  
  return units;
}