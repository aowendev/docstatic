/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import variableSetsData from "../../../reuse/variableSets/index.json";
import { useCurrentLocale } from "../../utils/useCurrentLocale";
import { initcapValue, resolveVariable } from "../../utils/variables";
import NotFound from "../NotFound";

const VariableSet = ({ variableSelection, lang, initcap, bold }) => {
  // The same locale chain every other reuse component uses, and the same
  // resolution rule a CALS table cell uses - see src/utils/variables.js.
  const locale = useCurrentLocale(lang);
  const value = resolveVariable(
    variableSetsData.variableSets,
    variableSelection,
    locale
  );

  // null means the set, the variable or its translation could not be resolved.
  // Say which selection failed rather than a bare "NOT FOUND": the author needs
  // to know whether the set or the variable is the part that is wrong.
  if (value === null) {
    return <NotFound name={variableSelection} />;
  }

  const displayValue = initcap ? initcapValue(value) : value;

  return (
    <span style={bold ? { fontWeight: "bold" } : undefined}>
      {displayValue}
    </span>
  );
};

export default VariableSet;
