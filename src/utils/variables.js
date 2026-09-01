/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * What a variable reference means.
 *
 * Shared by the <VariableSet> component and by CALS table cells, which reach
 * variables through Markdown rather than through MDX (see
 * src/components/CalsTable/remarkVariables.js). One rule for resolving a
 * selection, so a variable cannot resolve one way in a paragraph and another
 * way in a table cell.
 *
 * The set data is a parameter rather than an import here, for two reasons:
 * these functions stay pure and unit-testable under `node --test`, which
 * cannot import JSON without an import attribute the site's two bundlers
 * disagree about; and the one caller that runs inside Tina's admin - a
 * separate Vite app - has to reach the file by a relative path that would be
 * wrong for the site.
 */

/** The composite value the CMS writes: "<set name>_<variable key>". */
export function splitVariableSelection(variableSelection) {
  const [setKey, variableKey] = variableSelection?.split("_") ?? [];
  return { setKey, variableKey };
}

/**
 * The variable's text in `locale`, falling back to `fallbackLocale`, or null
 * when the set, the variable or any translation of it is missing. Null rather
 * than a guess: the caller renders the NOT FOUND marker naming the selection,
 * so an author can see which half of the selection is wrong.
 */
export function resolveVariable(
  variableSets,
  variableSelection,
  locale,
  fallbackLocale = "en"
) {
  const { setKey, variableKey } = splitVariableSelection(variableSelection);
  if (!setKey || !variableKey) return null;

  const sets = Array.isArray(variableSets) ? variableSets : [];
  const set = sets.find((s) => s.name === setKey);

  const variable = Array.isArray(set?.variables)
    ? set.variables.find((v) => v.key === variableKey)
    : null;
  if (!Array.isArray(variable?.translations)) return null;

  const translation =
    variable.translations.find((t) => t.lang === locale) ||
    variable.translations.find((t) => t.lang === fallbackLocale);

  return translation ? translation.value : null;
}

/** Capitalises the first character, the `initcap` prop's whole job. */
export function initcapValue(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}
