/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The marker a component renders when it cannot resolve what it was asked for -
 * a glossary term, a variable, or a citation naming a source that is not in the
 * bibliography.
 *
 * Shared rather than repeated, because it had already drifted: three components
 * grew three wordings ("NOT FOUND", "TERM NOT FOUND", "SOURCE NOT FOUND: key"),
 * only one of which said which key was missing, and only one of which could be
 * styled. One component keeps the wording and the class together.
 *
 * Naming the key is the point. "NOT FOUND" tells an author something is wrong;
 * "smith2020 NOT FOUND" tells them what to fix, which matters most where one
 * element can reference several things.
 *
 * It renders in place rather than failing the build: an unresolved reference is
 * a mistyped word in one sentence, and stopping the build for it would keep
 * anyone from previewing the rest of the site.
 */

import React from "react";

const NotFound = ({ name }) => (
  <span className="key--error">{name} NOT FOUND</span>
);

export default NotFound;
