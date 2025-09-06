import CodeBlock from "@theme-original/CodeBlock";
import DocCardList from "@theme-original/DocCardList";
import MDXComponents from "@theme-original/MDXComponents";
import TabItem from "@theme-original/TabItem";
import Tabs from "@theme-original/Tabs";
import Details from "@theme/Details";
import React from "react";

import CodeSnippet from "@site/src/components/CodeSnippet";
import Figure from "@site/src/components/Figure";
import Footnote from "@site/src/components/Footnote";
import GlossaryTerm from "@site/src/components/GlossaryTerm";
import Snippet from "@site/src/components/Snippet";
import VariableSet from "@site/src/components/VariableSet";

export default {
  ...MDXComponents,
  Details: Details,
  CodeBlock: CodeBlock,
  Tabs: Tabs,
  TabItem: TabItem,
  Admonition: MDXComponents.admonition,
  DocCardList: DocCardList,

  CodeSnippet: CodeSnippet,
  Figure: Figure,
  Footnote: Footnote,
  GlossaryTerm: GlossaryTerm,
  Snippet: Snippet,
  VariableSet: VariableSet,
};
