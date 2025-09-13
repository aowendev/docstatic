import CodeBlock from "@theme-original/CodeBlock";
import DocCardList from "@theme-original/DocCardList";
import MDXComponents from "@theme-original/MDXComponents";
import TabItem from "@theme-original/TabItem";
import Tabs from "@theme-original/Tabs";
import Details from "@theme/Details";
import React from "react";

import CodeSnippet from "@site/src/components/CodeSnippet";
import ConditionalText from "@site/src/components/ConditionalText";
import Figure from "@site/src/components/Figure";
import Footnote from "@site/src/components/Footnote";
import GlossaryTerm from "@site/src/components/GlossaryTerm";
import Passthrough from "@site/src/components/Passthrough";
import Snippet from "@site/src/components/Snippet";
import VariableSet from "@site/src/components/VariableSet";

export default {
  ...MDXComponents,
  Admonition: MDXComponents.admonition,
  CodeBlock: CodeBlock,
  CodeSnippet: CodeSnippet,
  ConditionalText: ConditionalText,
  Details: Details,
  DocCardList: DocCardList,
  Figure: Figure,
  Footnote: Footnote,
  GlossaryTerm: GlossaryTerm,
  Passthrough: Passthrough,
  Snippet: Snippet,
  TabItem: TabItem,
  Tabs: Tabs,
  VariableSet: VariableSet,
};
