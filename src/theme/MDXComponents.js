import CodeBlock from "@theme-original/CodeBlock";
import DocCardList from "@theme-original/DocCardList";
import MDXComponents from "@theme-original/MDXComponents";
import TabItem from "@theme-original/TabItem";
import Tabs from "@theme-original/Tabs";
import Admonition from "@theme-original/Admonition";
import Details from "@theme/Details";
import React from "react";

import CodeSnippet from "../components/CodeSnippet";
import ConditionalText from "../components/ConditionalText";
import Figure from "../components/Figure";
import Footnote from "../components/Footnote";
import GlossaryTerm from "../components/GlossaryTerm";
import RelatedTopics from "../components/RelatedTopics";
import Snippet from "../components/Snippet";
import StatusField from "../components/StatusField";
import TagsField from "../components/TagsField";
import VariableSet from "../components/VariableSet";
import YouTubeEmbed from "../components/YouTubeEmbed";

export default {
  // Re-use the default mapping
  ...MDXComponents,
  Admonition: Admonition,
  CodeBlock: CodeBlock,
  CodeSnippet: CodeSnippet,
  ConditionalText: ConditionalText,
  Details: Details,
  DocCardList: DocCardList,
  Figure: Figure,
  Footnote: Footnote,
  GlossaryTerm: GlossaryTerm,
  RelatedTopics: RelatedTopics,
  Snippet: Snippet,
  StatusField: StatusField,
  TabItem: TabItem,
  Tabs: Tabs,
  TagsField: TagsField,
  VariableSet: VariableSet,
  YouTubeEmbed: YouTubeEmbed,
};
