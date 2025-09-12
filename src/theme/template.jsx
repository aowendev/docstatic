import React from "react";
import codeFiles from "../../reuse/code-files.json";
import { slugify } from "../../util";
import { ConditionalTextBlockTemplate } from "../components/ConditionalText/template";

const AdmonitionTemplate = {
  name: "Admonition",
  ui: {
    defaultItem: {
      type: "note",
      title: "Note",
    },
    itemProps: (item) => {
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "type",
      label: "Type",
      type: "string",
      options: [
        {
          label: "Note",
          value: "note",
        },
        {
          label: "Tip",
          value: "tip",
        },
        {
          label: "Info",
          value: "info",
        },
        {
          label: "Caution",
          value: "caution",
        },
        {
          label: "Warning",
          value: "danger",
        },
      ],
    },
    {
      name: "title",
      label: "Title",
      type: "string",
      isTitle: true,
      required: true,
    },
    {
      name: "children",
      label: "Content",
      type: "rich-text",
    },
  ],
};

const DetailsTemplate = {
  name: "Details",
  fields: [
    {
      name: "summary",
      label: "Summary",
      type: "string",
      isTitle: true,
      required: true,
    },
    {
      name: "children",
      label: "Details",
      type: "rich-text",
    },
  ],
};

const CodeBlockTemplate = {
  name: "CodeSnippet",
  label: "Code Block",
  ui: {
    itemProps: (item) => {
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "title",
      label: "Title",
      type: "string",
    },
    {
      name: "language",
      label: "Language",
      type: "string",
      options: [
        // Web Technologies
        { label: "TypeScript", value: "typescript" },
        { label: "JavaScript", value: "javascript" },
        { label: "JSX", value: "jsx" },
        { label: "TSX", value: "tsx" },
        { label: "HTML", value: "html" },
        { label: "CSS", value: "css" },
        { label: "SCSS/Sass", value: "scss" },
        { label: "Less", value: "less" },
        { label: "Stylus", value: "stylus" },

        // Data Formats
        { label: "JSON", value: "json" },
        { label: "JSON5", value: "json5" },
        { label: "JSONC", value: "jsonc" },
        { label: "XML", value: "xml" },
        { label: "YAML", value: "yaml" },
        { label: "TOML", value: "toml" },
        { label: "CSV", value: "csv" },
        { label: "INI", value: "ini" },

        // Programming Languages
        { label: "Python", value: "python" },
        { label: "Java", value: "java" },
        { label: "C#", value: "csharp" },
        { label: "C++", value: "cpp" },
        { label: "C", value: "c" },
        { label: "PHP", value: "php" },
        { label: "Ruby", value: "ruby" },
        { label: "Go", value: "go" },
        { label: "Rust", value: "rust" },
        { label: "Swift", value: "swift" },
        { label: "Kotlin", value: "kotlin" },
        { label: "Scala", value: "scala" },
        { label: "R", value: "r" },
        { label: "MATLAB", value: "matlab" },
        { label: "Objective-C", value: "objectivec" },
        { label: "Dart", value: "dart" },
        { label: "Elixir", value: "elixir" },
        { label: "Erlang", value: "erlang" },
        { label: "F#", value: "fsharp" },
        { label: "Haskell", value: "haskell" },
        { label: "Lua", value: "lua" },
        { label: "Perl", value: "perl" },
        { label: "Clojure", value: "clojure" },

        // Shell & Scripting
        { label: "Bash", value: "bash" },
        { label: "Shell", value: "shell" },
        { label: "PowerShell", value: "powershell" },
        { label: "Batch", value: "batch" },
        { label: "Fish", value: "fish" },
        { label: "Zsh", value: "zsh" },

        // Database & Query Languages
        { label: "SQL", value: "sql" },
        { label: "PostgreSQL", value: "postgresql" },
        { label: "MySQL", value: "mysql" },
        { label: "SQLite", value: "sqlite" },
        { label: "MongoDB", value: "mongodb" },
        { label: "GraphQL", value: "graphql" },
        { label: "SPARQL", value: "sparql" },

        // DevOps & Infrastructure
        { label: "Dockerfile", value: "dockerfile" },
        { label: "Docker Compose", value: "docker-compose" },
        { label: "Kubernetes", value: "kubernetes" },
        { label: "Terraform", value: "terraform" },
        { label: "HCL", value: "hcl" },
        { label: "Ansible", value: "ansible" },
        { label: "Vagrant", value: "vagrant" },
        { label: "Jenkins", value: "jenkins" },

        // Configuration & Markup
        { label: "Markdown", value: "markdown" },
        { label: "MDX", value: "mdx" },
        { label: "LaTeX", value: "latex" },
        { label: "AsciiDoc", value: "asciidoc" },
        { label: "reStructuredText", value: "rst" },
        { label: "Apache Config", value: "apache" },
        { label: "Nginx", value: "nginx" },
        { label: "Makefile", value: "makefile" },
        { label: "CMake", value: "cmake" },
        { label: "Properties", value: "properties" },
        { label: "EditorConfig", value: "editorconfig" },
        { label: "Git Config", value: "gitignore" },

        // Assembly & Low Level
        { label: "Assembly x86", value: "asm6502" },
        { label: "WebAssembly", value: "wasm" },

        // Functional Languages
        { label: "Lisp", value: "lisp" },
        { label: "Scheme", value: "scheme" },
        { label: "ML", value: "ml" },
        { label: "OCaml", value: "ocaml" },

        // Template Languages
        { label: "Handlebars", value: "handlebars" },
        { label: "Mustache", value: "mustache" },
        { label: "Twig", value: "twig" },
        { label: "Smarty", value: "smarty" },
        { label: "Jinja2", value: "jinja2" },
        { label: "EJS", value: "ejs" },
        { label: "Pug", value: "pug" },
        { label: "Haml", value: "haml" },

        // Domain Specific Languages
        { label: "Regular Expression", value: "regex" },
        { label: "CSS-in-JS", value: "css-in-js" },
        { label: "Protocol Buffers", value: "protobuf" },
        { label: "Thrift", value: "thrift" },
        { label: "ANTLR", value: "antlr4" },
        { label: "BNF", value: "bnf" },
        { label: "ABNF", value: "abnf" },

        // Game Development
        { label: "GLSL", value: "glsl" },
        { label: "HLSL", value: "hlsl" },
        { label: "Godot Script", value: "gdscript" },

        // Scientific & Mathematical
        { label: "Mathematica", value: "mathematica" },
        { label: "Wolfram", value: "wolfram" },
        { label: "R Markdown", value: "rmd" },
        { label: "Jupyter", value: "jupyter" },

        // Version Control
        { label: "Git Diff", value: "diff" },
        { label: "Git Patch", value: "patch" },

        // Network & Protocols
        { label: "HTTP", value: "http" },
        { label: "DNS Zone", value: "dns-zone" },

        // Log Files
        { label: "Log Files", value: "log" },
        { label: "Apache Log", value: "apachelog" },
        { label: "Nginx Log", value: "nginxlog" },

        // Other/Misc
        { label: "Plain Text", value: "text" },
        { label: "ABNF", value: "abnf" },
        { label: "ActionScript", value: "actionscript" },
        { label: "Ada", value: "ada" },
        { label: "ApacheConf", value: "apacheconf" },
        { label: "APL", value: "apl" },
        { label: "AppleScript", value: "applescript" },
        { label: "Arduino", value: "arduino" },
        { label: "AutoHotkey", value: "autohotkey" },
        { label: "AutoIt", value: "autoit" },
        { label: "Awk", value: "awk" },
        { label: "BASIC", value: "basic" },
        { label: "Brainfuck", value: "brainfuck" },
        { label: "Bro", value: "bro" },
        { label: "CoffeeScript", value: "coffeescript" },
        { label: "Crystal", value: "crystal" },
        { label: "D", value: "d" },
        { label: "Django", value: "django" },
        { label: "Elm", value: "elm" },
        { label: "Factor", value: "factor" },
        { label: "Forth", value: "forth" },
        { label: "Fortran", value: "fortran" },
        { label: "GDScript", value: "gdscript" },
        { label: "Gherkin", value: "gherkin" },
        { label: "GLSL", value: "glsl" },
        { label: "GraphQL", value: "graphql" },
        { label: "Groovy", value: "groovy" },
        { label: "Hack", value: "hack" },
        { label: "Haxe", value: "haxe" },
        { label: "Hy", value: "hy" },
        { label: "Icon", value: "icon" },
        { label: "Inform7", value: "inform7" },
        { label: "J", value: "j" },
        { label: "Julia", value: "julia" },
        { label: "Keyman", value: "keyman" },
        { label: "LiveScript", value: "livescript" },
        { label: "LOLCODE", value: "lolcode" },
        { label: "Nim", value: "nim" },
        { label: "Nix", value: "nix" },
        { label: "OCaml", value: "ocaml" },
        { label: "Oz", value: "oz" },
        { label: "Pascal", value: "pascal" },
        { label: "PureScript", value: "purescript" },
        { label: "Q", value: "q" },
        { label: "Racket", value: "racket" },
        { label: "Reason", value: "reason" },
        { label: "Rescript", value: "rescript" },
        { label: "SAS", value: "sas" },
        { label: "Solidity", value: "solidity" },
        { label: "Stata", value: "stata" },
        { label: "Tcl", value: "tcl" },
        { label: "Vala", value: "vala" },
        { label: "VB.NET", value: "vbnet" },
        { label: "Verilog", value: "verilog" },
        { label: "VHDL", value: "vhdl" },
        { label: "Vim Script", value: "vim" },
        { label: "Visual Basic", value: "vb" },
        { label: "WebIDL", value: "webidl" },
        { label: "Zig", value: "zig" },
      ],
      ui: {
        component: "select",
        description: "Select the programming language for syntax highlighting",
      },
    },
    {
      name: "filepath",
      label: "File Path",
      type: "string",
      isTitle: true,
      required: true,
      options: codeFiles.map((file) => ({
        label: file,
        value: file,
      })),
      ui: {
        component: "select",
        description:
          "Select a file from /reuse/code/ (includes subdirectories)",
      },
    },
  ],
};

const DocCardListTemplate = {
  name: "DocCardList",
  label: "Doc Card List",
  fields: [
    {
      name: "title",
      label: "Title",
      type: "string",
    },
  ],
};

// DocStatic components follow

const GlossaryTermTemplate = {
  name: "GlossaryTerm",
  label: "Glossary Term",
  ui: {
    itemProps: (item) => {
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "termKey",
      label: "Term Key",
      type: "string",
      isTitle: true,
      required: true,
    },
  ],
};

const SnippetTemplate = {
  name: "Snippet",
  label: "Snippet",
  ui: {
    itemProps: (item) => {
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "filepath",
      label: "File Path",
      type: "string",
      isTitle: true,
      required: true,
    },
  ],
};

const VariableSetTemplate = {
  name: "VariableSet",
  label: "Variable",
  ui: {
    itemProps: (item) => {
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "setKey",
      label: "Variable Set",
      type: "string",
      required: true,
    },
    {
      name: "variableKey",
      label: "Variable",
      type: "string",
      isTitle: true,
      required: true,
    },
  ],
};

const CommentsTemplate = {
  name: "hidden",
  label: "Comment",
  match: {
    start: "<!--",
    end: "-->",
  },
  ui: {
    itemProps: (item) => {
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "comment",
      label: "Comment",
      type: "string",
      isTitle: true,
      required: true,
    },
  ],
};

const TruncateTemplate = {
  name: "truncate",
  label: "Truncate",
  match: {
    start: "<!--",
    end: "-->",
  },
  fields: [
    {
      name: "deactivate",
      label:
        "Do not modify this string or you will not be able to edit this topic in the rich text editor.",
      type: "string",
      defaultValue: "",
    },
  ],
};

// Get the last segment of the path as the slug
const usePageSlug = () => {
  if (typeof window === "undefined") return "";
  const path = window.location.pathname;
  const segments = path.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
};

const slug = usePageSlug();

const ContextHelpTemplate = {
  name: "a",
  label: "Context Help",
  ui: {
    itemProps: (item, slug) => {
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "id",
      label: "Context Help ID (<URL>/docs/<slug>#<ID>)",
      type: "string",
      isTitle: true,
      required: true,
    },
  ],
};

const FigureTemplate = {
  name: "Figure",
  label: "Figure",
  ui: {
    itemProps: (item) => {
      return { label: item?.title };
    },
  },
  fields: [
    {
      name: "img",
      label: "Image",
      type: "image",
      required: true,
    },
    {
      name: "caption",
      label: "Caption",
      type: "string",
      isTitle: true,
      required: true,
    },
    {
      name: "size",
      label: "Size",
      type: "string",
    },
  ],
};

const FootnoteTemplate = {
  name: "Footnote",
  fields: [
    {
      name: "summary",
      label: "Summary",
      type: "string",
      isTitle: true,
      required: true,
    },
    {
      name: "children",
      label: "Footnote",
      type: "rich-text",
    },
  ],
};

const TabsTemplate = {
  name: "Tabs",
  label: "Tabs",
  ui: {
    itemProps: (item) => {
      return { label: "Tabs" };
    },
  },
  fields: [
    {
      name: "children",
      label: "Tab Items",
      type: "rich-text",
      templates: [
        {
          name: "TabItem",
          label: "Tab Item",
          ui: {
            defaultItem: {
              label: "New Tab",
              value: "new-tab",
            },
            itemProps: (item) => {
              return { label: item?.label || "New Tab" };
            },
          },
          fields: [
            {
              name: "value",
              label: "Tab Value",
              type: "string",
              required: true,
              description: "Unique identifier for this tab"
            },
            {
              name: "label",
              label: "Tab Label",
              type: "string",
              required: true,
              isTitle: true,
              description: "Display text for the tab button"
            },
            {
              name: "default",
              label: "Default Tab",
              type: "boolean",
              description: "Set this tab as the default selected tab"
            },
            {
              name: "children",
              label: "Tab Content",
              type: "rich-text",
              templates: [
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const MDXTemplates = [
  AdmonitionTemplate,
  CodeBlockTemplate,
  CommentsTemplate,
  ConditionalTextBlockTemplate,
  ContextHelpTemplate,
  DetailsTemplate,
  DocCardListTemplate,
  FigureTemplate,
  FootnoteTemplate,
  GlossaryTermTemplate,
  SnippetTemplate,
  TabsTemplate,
  TruncateTemplate,
  VariableSetTemplate,
];
