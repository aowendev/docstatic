/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import { ImageField, ReferenceField, TextField } from "tinacms";
import CollapsibleField from "../CollapsibleField";
import HelpButton from "../HelpButton";

const WarningIcon = (props) => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M11.001 10h2v5h-2zM11 16h2v2h-2z" />
      <path d="M13.768 4.2C13.42 3.545 12.742 3.138 12 3.138s-1.42.407-1.768 1.063L2.894 18.064a1.986 1.986 0 0 0 .054 1.968A1.984 1.984 0 0 0 4.661 21h14.678c.708 0 1.349-.362 1.714-.968a1.989 1.989 0 0 0 .054-1.968L13.768 4.2zM4.661 19 12 5.137 19.344 19H4.661z" />
    </svg>
  );
};

const RestartWarning = () => {
  return (
    <div className="rounded-lg border shadow px-4 py-2.5 bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 mb-4">
      <div className="flex items-center gap-2">
        <WarningIcon className={"w-6 h-auto flex-shrink-0 text-yellow-400"} />
        <div className={"flex-1 text-sm text-yellow-700 whitespace-normal	"}>
          To see settings changes reflected on your site, restart the Tina CLI
          after saving <em>(local development only)</em>.
        </div>
      </div>
    </div>
  );
};

// Navbar item fields live inside an object list, so each component receives a
// `field.name` such as "navbar.items.3.docLink". Which of the link-detail
// fields is shown depends on the sibling `link` value on the same item.
// (`doc` intentionally shows two: the reference picker and the anchor id.)
const showWhenLinkIs = (expected, Field) => (props) => {
  const link = React.useMemo(() => {
    const fieldName = props.field.name;
    const parentPath =
      fieldName.substring(0, fieldName.lastIndexOf(".")) || fieldName;
    // Guarded walk: an incomplete path used to throw and take the whole
    // settings form down.
    const parent = parentPath
      .split(".")
      .reduce(
        (o, key) => (o == null ? undefined : o[key]),
        props.tinaForm.values
      );
    return parent?.link;
  }, [props.tinaForm.values, props.field.name]);

  if (link !== expected) {
    return null;
  }

  return Field(props);
};

const NavbarItemFields = [
  {
    name: "label",
    label: "Label",
    type: "string",
    isTitle: true,
    required: true,
  },
  {
    name: "link",
    label: "Link",
    type: "string",
    options: [
      {
        label: "None",
        value: "none",
      },
      {
        label: "Document",
        value: "doc",
      },
      {
        label: "Page",
        value: "page",
      },
      {
        label: "Blog",
        value: "blog",
      },
      {
        label: "External",
        value: "external",
      },
      {
        label: "Manual Path",
        value: "manualPath",
      },
      {
        label: "Locale Dropdown",
        value: "localeDropdown",
      },
      {
        label: "Docs Version Dropdown",
        value: "docsVersionDropdown",
      },
      {
        label: "Dropdown",
        value: "dropdown",
      },
      {
        label: "Search",
        value: "search",
      },
    ],
  },
  {
    name: "docLink",
    label: "Document",
    type: "reference",
    collections: ["doc"],
    ui: {
      component: showWhenLinkIs("doc", ReferenceField),
    },
  },
  {
    name: "pageLink",
    label: "Page",
    type: "reference",
    collections: ["pages"],
    ui: {
      component: showWhenLinkIs("page", ReferenceField),
    },
  },
  {
    name: "externalLink",
    label: "URL",
    type: "string",
    ui: {
      component: showWhenLinkIs("external", TextField),
    },
  },
  {
    name: "manualPath",
    label: "Manual Path",
    type: "string",
    ui: {
      component: showWhenLinkIs("manualPath", TextField),
    },
  },
  {
    name: "docId",
    label: "Document ID",
    type: "string",
    ui: {
      component: showWhenLinkIs("doc", TextField),
    },
  },
  {
    name: "position",
    label: "Position",
    type: "string",
    required: true,
    options: [
      {
        label: "Left",
        value: "left",
      },
      {
        label: "Right",
        value: "right",
      },
    ],
    ui: {
      component: "button-toggle",
    },
  },
];

const NavbarSubitemProps = {
  name: "items",
  label: "Items",
  type: "object",
  list: true,
  ui: {
    itemProps: (item) => ({
      label: item.label,
    }),
  },
};

export const SettingsCollection = {
  label: "Settings",
  name: "settings",
  path: "config/docusaurus",
  format: "json",
  ui: {
    global: true,
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  fields: [
    {
      type: "boolean",
      name: "help",
      label: "Help",
      required: false,
      ui: {
        component: (props) => (
          <HelpButton
            url="https://docstatic.com/docs/configuration"
            {...props}
          />
        ),
      },
    },
    {
      type: "string",
      name: "_warning",
      ui: {
        component: () => {
          return <RestartWarning />;
        },
      },
    },
    {
      type: "string",
      label: "Label",
      name: "label",
      required: true,
      isTitle: true,
      ui: {
        component: "hidden",
      },
    },
    {
      type: "string",
      label: "Title",
      name: "title",
      required: true,
      ui: {
        component: (props) => (
          <CollapsibleField
            {...props}
            FieldComponent={TextField}
            defaultCollapsed={true}
          />
        ),
      },
    },
    {
      type: "string",
      label: "Tagline",
      name: "tagline",
      ui: {
        component: (props) => (
          <CollapsibleField
            {...props}
            FieldComponent={TextField}
            defaultCollapsed={true}
          />
        ),
      },
    },
    {
      type: "image",
      label: "Favicon",
      name: "favicon",
      ui: {
        component: (props) => (
          <CollapsibleField
            {...props}
            FieldComponent={ImageField}
            defaultCollapsed={true}
          />
        ),
      },
    },
    {
      type: "string",
      label: "GraphQL Schema URL",
      name: "graphql",
      ui: {
        component: (props) => (
          <CollapsibleField
            {...props}
            FieldComponent={TextField}
            defaultCollapsed={true}
          />
        ),
      },
    },
    {
      type: "object",
      label: "Color Mode",
      name: "colorMode",
      fields: [
        {
          type: "string",
          label: "Default Mode",
          name: "defaultMode",
          description: "The color mode that is applied by default",
          options: [
            {
              label: "Light",
              value: "light",
            },
            {
              label: "Dark",
              value: "dark",
            },
            {
              label: "System",
              value: "system",
            },
          ],
          ui: {
            component: "button-toggle",
          },
        },
        {
          type: "boolean",
          label: "Hide Switch",
          name: "disableSwitch",
          description: "Hide the switch in the navbar",
        },
        {
          type: "boolean",
          label: "Respect Prefers Color Scheme",
          name: "respectPrefersColorScheme",
          description: "Use prefers-color-scheme CSS media feature",
        },
      ],
    },
    {
      type: "object",
      label: "Footer",
      name: "footer",
      fields: [
        {
          name: "style",
          label: "Style",
          type: "string",
          options: [
            {
              label: "Dark",
              value: "dark",
            },
            {
              label: "Light",
              value: "light",
            },
          ],
          ui: {
            component: "button-toggle",
          },
        },
        {
          type: "object",
          label: "Categories",
          name: "links",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item.title,
            }),
          },
          fields: [
            {
              type: "string",
              label: "Title",
              name: "title",
            },
            {
              type: "object",
              label: "Links",
              name: "items",
              list: true,
              templates: [
                {
                  name: "internal",
                  label: "Internal",
                  ui: {
                    itemProps: (item) => ({
                      label: item.label,
                    }),
                  },
                  fields: [
                    {
                      type: "string",
                      label: "Label",
                      name: "label",
                    },
                    {
                      type: "reference",
                      label: "Page",
                      name: "to",
                      collections: ["doc", "pages", "post"],
                    },
                  ],
                },
                {
                  name: "blog",
                  label: "Blog",
                  ui: {
                    defaultItem: {
                      label: "Blog",
                    },
                    itemProps: (item) => ({
                      label: item.label,
                    }),
                  },
                  fields: [
                    {
                      type: "string",
                      label: "Label",
                      name: "label",
                    },
                  ],
                },
                {
                  name: "external",
                  label: "External",
                  ui: {
                    itemProps: (item) => ({
                      label: item.label,
                    }),
                  },
                  fields: [
                    {
                      type: "string",
                      label: "Label",
                      name: "label",
                    },
                    {
                      type: "string",
                      label: "URL",
                      name: "href",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "string",
          label: "Copyright",
          name: "copyright",
        },
      ],
    },
    {
      type: "object",
      label: "GitHub Deployment",
      name: "github",
      fields: [
        {
          type: "string",
          label: "Project Name",
          name: "projectName",
          description: "GitHub repository name for GitHub Pages deployment",
        },
        {
          type: "string",
          label: "Organization Name",
          name: "organizationName",
          description: "GitHub username or organization name",
        },
      ],
    },
    {
      type: "object",
      label: "Languages",
      name: "languages",
      fields: [
        {
          type: "object",
          label: "Supported Languages",
          name: "supported",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: `${item.code}: ${item.label}`,
            }),
            defaultItem: () => ({
              code: "en",
              label: "English",
            }),
          },
          fields: [
            {
              type: "string",
              label: "Language Code",
              name: "code",
              required: true,
            },
            {
              type: "string",
              label: "Display Label",
              name: "label",
              required: true,
            },
          ],
        },
        {
          type: "string",
          label: "Default Language",
          name: "default",
          required: true,
          ui: {
            component: (props) => {
              // Get the supported languages from the form values
              const supportedLanguages = React.useMemo(() => {
                const formValues = props.tinaForm.values;
                const supported = formValues?.languages?.supported || [];
                return supported.map((lang) => lang.code).filter(Boolean);
              }, [props.tinaForm.values]);

              // Auto-set to first supported language if current default is not supported
              React.useEffect(() => {
                const currentDefault = props.input.value;
                if (
                  currentDefault &&
                  !supportedLanguages.includes(currentDefault)
                ) {
                  if (supportedLanguages.length > 0) {
                    props.input.onChange(supportedLanguages[0]);
                  }
                }
              }, [supportedLanguages, props.input]);

              return (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {props.field.label}
                  </label>
                  <select
                    value={props.input.value || supportedLanguages[0] || "en"}
                    onChange={(e) => props.input.onChange(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {supportedLanguages.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                  {props.field.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {props.field.description}
                    </p>
                  )}
                </div>
              );
            },
          },
        },
      ],
    },
    {
      type: "object",
      label: "Logo",
      name: "logo",
      fields: [
        {
          type: "string",
          label: "Alt Text",
          name: "alt",
        },
        {
          type: "image",
          label: "Source",
          name: "src",
        },
      ],
    },
    {
      type: "object",
      label: "OpenAPI",
      name: "openapi",
      fields: [
        {
          type: "object",
          label: "APIs",
          name: "apis",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item.name || "API Configuration",
            }),
            defaultItem: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
          },
          fields: [
            {
              type: "string",
              label: "API Name",
              name: "name",
              required: true,
              description:
                "Unique name for this API (e.g., petstore, userapi, etc.)",
            },
            {
              type: "string",
              label: "Spec Path",
              name: "specPath",
              required: true,
              description:
                "Path to the OpenAPI specification file (e.g., apis/petstore.yaml)",
            },
            {
              type: "string",
              label: "Output Directory",
              name: "outputDir",
              required: true,
              description:
                "Directory where generated API docs will be placed (e.g., docs/api/petstore)",
            },
            {
              type: "string",
              label: "Download URL",
              name: "downloadUrl",
              description: "Optional URL to download the OpenAPI spec file",
            },
            {
              type: "string",
              label: "Group Paths By",
              name: "groupPathsBy",
              description: "How to group API endpoints in sidebar",
              options: [
                { label: "Tag", value: "tag" },
                { label: "Operation", value: "operation" },
              ],
              ui: {
                component: "select",
              },
            },
            {
              type: "string",
              label: "Category Link Source",
              name: "categoryLinkSource",
              description: "Source for category links",
              options: [
                { label: "Tag", value: "tag" },
                { label: "Info", value: "info" },
              ],
              ui: {
                component: "select",
              },
            },
          ],
        },
        {
          type: "string",
          label: "Language Tabs",
          name: "languageTabs",
          list: true,
          description:
            "Select which programming languages to show as tabs in OpenAPI code examples across all APIs",
          options: [
            { label: "C", value: "c" },
            { label: "C#", value: "csharp" },
            { label: "cURL/Bash", value: "curl" },
            { label: "Dart", value: "dart" },
            { label: "Go", value: "go" },
            { label: "Java", value: "java" },
            { label: "JavaScript", value: "javascript" },
            { label: "Kotlin", value: "kotlin" },
            { label: "Node.js", value: "nodejs" },
            { label: "Objective-C", value: "objective-c" },
            { label: "OCaml", value: "ocaml" },
            { label: "PHP", value: "php" },
            { label: "PowerShell", value: "powershell" },
            { label: "Python", value: "python" },
            { label: "R", value: "r" },
            { label: "Ruby", value: "ruby" },
            { label: "Rust", value: "rust" },
            { label: "Swift", value: "swift" },
            { label: "TypeScript", value: "typescript" },
          ],
        },
      ],
    },
    {
      type: "object",
      label: "Syntax Highlighting",
      name: "prism",
      fields: [
        {
          type: "string",
          label: "Additional Languages",
          name: "additionalLanguages",
          list: true,
          description:
            "Programming languages supported for syntax highlighting",
        },
        {
          type: "object",
          label: "Magic Comments",
          name: "magicComments",
          list: true,
          description: "Comments that trigger special highlighting behaviors",
          ui: {
            itemProps: (item) => ({
              label: item.line || item.className || "Magic Comment",
            }),
          },
          fields: [
            {
              type: "string",
              label: "CSS Class Name",
              name: "className",
              required: true,
            },
            {
              type: "string",
              label: "Line Comment",
              name: "line",
              description:
                "Comment text that triggers highlighting on the next line",
            },
            {
              type: "object",
              label: "Block Comment",
              name: "block",
              description: "Comments that define a block of highlighted lines",
              fields: [
                {
                  type: "string",
                  label: "Start Comment",
                  name: "start",
                },
                {
                  type: "string",
                  label: "End Comment",
                  name: "end",
                },
              ],
            },
          ],
        },
        {
          type: "string",
          label: "Light Theme",
          name: "theme",
          description: "Syntax highlighting theme for light mode",
          options: [
            { label: "docStatic Light", value: "prismLight" },
            { label: "Duotone Light", value: "duotoneLight" },
            { label: "GitHub", value: "github" },
            { label: "Gruvbox Material Light", value: "gruvboxMaterialLight" },
            { label: "Jettwave Light", value: "jettwaveLight" },
            { label: "Night Owl Light", value: "nightOwlLight" },
            { label: "One Light", value: "oneLight" },
            { label: "Ultramin", value: "ultramin" },
            { label: "VS Code Light", value: "vsLight" },
          ],
          ui: {
            component: "select",
          },
        },
        {
          type: "string",
          label: "Dark Theme",
          name: "darkTheme",
          description: "Syntax highlighting theme for dark mode",
          options: [
            { label: "docStatic Dark", value: "prismDark" },
            { label: "Dracula", value: "dracula" },
            { label: "Duotone Dark", value: "duotoneDark" },
            { label: "Gruvbox Material Dark", value: "gruvboxMaterialDark" },
            { label: "Jettwave Dark", value: "jettwaveDark" },
            { label: "Night Owl", value: "nightOwl" },
            { label: "Oceanic Next", value: "oceanicNext" },
            { label: "Okaidia", value: "okaidia" },
            { label: "One Dark", value: "oneDark" },
            { label: "Palenight", value: "palenight" },
            { label: "Shades of Purple", value: "shadesOfPurple" },
            { label: "Synthwave 84", value: "synthwave84" },
            { label: "VS Dark", value: "vsDark" },
          ],
          ui: {
            component: "select",
          },
        },
      ],
    },
    {
      type: "object",
      label: "URL",
      name: "url",
      fields: [
        {
          type: "string",
          label: "Site URL",
          name: "siteUrl",
          required: true,
          description: "The URL where your site will be hosted",
        },
        {
          type: "string",
          label: "Base URL",
          name: "baseUrl",
          description:
            "Base URL for your site (e.g., /my-project/). Leave empty for root domain.",
        },
        {
          type: "boolean",
          label: "Trailing Slash",
          name: "trailingSlash",
          description: "Whether to add trailing slashes to URLs",
        },
      ],
    },
    {
      type: "object",
      label: "Navbar",
      name: "navbar",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: `${item.label} - ${item.position ? item.position.charAt(0).toUpperCase() + item.position.slice(1) : "Left"}`,
        }),
        defaultItem: {
          position: "left",
        },
      },
      fields: [
        ...NavbarItemFields,
        {
          ...NavbarSubitemProps,
          fields: [
            ...NavbarItemFields,
            {
              ...NavbarSubitemProps,
              fields: NavbarItemFields,
            },
          ],
        },
      ],
    },
    {
      type: "boolean",
      label: "Sidebar can be hidden",
      name: "sidebarHideable",
    },
    {
      type: "boolean",
      label: "Show blog reading time",
      name: "showReadingTime",
    },
  ],
};
