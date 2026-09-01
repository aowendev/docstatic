/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The alignment a cell is actually drawn with.
 *
 * CALS decides alignment itself, in order: the entry, then its spanspec, then
 * its colspec (see resolveAlign in calsLayout.js). Only when all three say
 * nothing does the site-wide setting get a say, and only then. That ordering
 * is the whole contract of this module - a site preference must never be able
 * to overrule what a table's own markup asked for - so it lives in one tested
 * function rather than inline in the renderer, where a later edit could
 * quietly invert it.
 *
 * The `char` value means "line the column up on a character", CALS's decimal
 * alignment. CSS has no equivalent, so it is approximated as right alignment,
 * which is what it degrades to for the numeric columns it is used on. It is
 * still a *decision* CALS made, so it outranks the site setting like any
 * other.
 */
export function cellAlign(cell, siteDefaultAlign) {
  // ?? not ||: a cell that resolved no alignment is undefined, and only that
  // case defers to the site. An empty string is a value someone stored, and
  // deferring on it would make clearing a cell's alignment in the CMS silently
  // adopt the site default instead of the browser's.
  const align = cell?.align ?? siteDefaultAlign;
  return align === "char" ? "right" : align;
}
