/**
 * Copyright (c) Source Solutions, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import { ReferenceField, TextField } from "tinacms";
import docusaurusData from "../../../config/docusaurus/index.json";
import CollapsibleField from "../CollapsibleField";
import HelpButton from "../HelpButton";

// Function to create language options from config data
function createLanguageOptions(configData = docusaurusData) {
  const supportedLanguages = configData.languages?.supported || [{code: "en", label: "English"}];
  
  return supportedLanguages.map((langObj) => {
    return {
      value: langObj.code,
      label: `${langObj.label} (${langObj.code})`,
    };
  });
}

const languageOptions = createLanguageOptions();

const WarningIcon = (props) => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      stroke-width="0"
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
    <p className="rounded-lg border shadow px-4 py-2.5 bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 mb-4">
      <div className="flex items-center gap-2">
        <WarningIcon className={"w-6 h-auto flex-shrink-0 text-yellow-400"} />
        <div className={"flex-1 text-sm text-yellow-700 whitespace-normal	"}>
          To see settings changes reflected on your site, restart the Tina CLI
          after saving <em>(local development only)</em>.
        </div>
      </div>
    </p>
  );
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
      component: (props) => {
        const link = React.useMemo(() => {
          let fieldName = props.field.name;
          fieldName =
            fieldName.substring(0, fieldName.lastIndexOf(".")) || fieldName;

          return fieldName
            .split(".")
            .reduce((o, i) => o[i], props.tinaForm.values).link;
        }, [props.tinaForm.values, props.field.name]);

        if (link !== "doc") {
          return null;
        }

        return ReferenceField(props);
      },
    },
  },
  {
    name: "pageLink",
    label: "Page",
    type: "reference",
    collections: ["pages"],
    ui: {
      component: (props) => {
        const link = React.useMemo(() => {
          let fieldName = props.field.name;
          fieldName =
            fieldName.substring(0, fieldName.lastIndexOf(".")) || fieldName;

          return fieldName
            .split(".")
            .reduce((o, i) => o[i], props.tinaForm.values).link;
        }, [props.tinaForm.values, props.field.name]);

        if (link !== "page") {
          return null;
        }

        return ReferenceField(props);
      },
    },
  },
  {
    name: "externalLink",
    label: "URL",
    type: "string",
    ui: {
      component: (props) => {
        const link = React.useMemo(() => {
          let fieldName = props.field.name;
          fieldName =
            fieldName.substring(0, fieldName.lastIndexOf(".")) || fieldName;

          return fieldName
            .split(".")
            .reduce((o, i) => o[i], props.tinaForm.values).link;
        }, [props.tinaForm.values, props.field.name]);

        if (link !== "external") {
          return null;
        }

        return TextField(props);
      },
    },
  },
  {
    name: "manualPath",
    label: "Manual Path",
    type: "string",
    ui: {
      component: (props) => {
        const link = React.useMemo(() => {
          let fieldName = props.field.name;
          fieldName =
            fieldName.substring(0, fieldName.lastIndexOf(".")) || fieldName;

          return fieldName
            .split(".")
            .reduce((o, i) => o[i], props.tinaForm.values).link;
        }, [props.tinaForm.values, props.field.name]);

        if (link !== "manualPath") {
          return null;
        }

        return TextField(props);
      },
    },
  },
  {
    name: "docId",
    label: "Document ID",
    type: "string",
    ui: {
      component: (props) => {
        const link = React.useMemo(() => {
          let fieldName = props.field.name;
          fieldName =
            fieldName.substring(0, fieldName.lastIndexOf(".")) || fieldName;

          return fieldName
            .split(".")
            .reduce((o, i) => o[i], props.tinaForm.values).link;
        }, [props.tinaForm.values, props.field.name]);

        if (link !== "doc") {
          return null;
        }

        return TextField(props);
      },
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
          description: "Base URL for your site (e.g., /my-project/). Leave empty for root domain.",
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
              label: "English"
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
                return supported.map(lang => lang.code).filter(Boolean);
              }, [props.tinaForm.values]);

              // Auto-set to first supported language if current default is not supported
              React.useEffect(() => {
                const currentDefault = props.input.value;
                if (currentDefault && !supportedLanguages.includes(currentDefault)) {
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
                    value={props.input.value || (supportedLanguages[0] || "en")}
                    onChange={(e) => props.input.onChange(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {supportedLanguages.map(code => (
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
      type: "string",
      label: "Favicon",
      name: "favicon",
      description: "Path to your site's favicon (e.g., img/favicon.ico)",
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
      label: "GitHub Deployment",
      name: "github",
      ui: {
        component: (props) => (
          <CollapsibleField
            {...props}
            FieldComponent={({ children }) => <div>{children}</div>}
            defaultCollapsed={true}
          />
        ),
      },
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
      label: "Documentation Settings",
      name: "docs",
      ui: {
        component: (props) => (
          <CollapsibleField
            {...props}
            FieldComponent={({ children }) => <div>{children}</div>}
            defaultCollapsed={true}
          />
        ),
      },
      fields: [
        {
          type: "boolean",
          label: "Hideable Sidebar",
          name: "sidebarHideable",
          description: "Allow users to hide/show the documentation sidebar",
        },
      ],
    },
    {
      type: "object",
      label: "Blog Settings",
      name: "blog",
      ui: {
        component: (props) => (
          <CollapsibleField
            {...props}
            FieldComponent={({ children }) => <div>{children}</div>}
            defaultCollapsed={true}
          />
        ),
      },
      fields: [
        {
          type: "boolean",
          label: "Show Reading Time",
          name: "showReadingTime",
          description: "Display estimated reading time for blog posts",
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
          label: `${item.label} - ${item.position ? item.position.charAt(0).toUpperCase() + item.position.slice(1) : 'Left'}`,
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
    }
],
};