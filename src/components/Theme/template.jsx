import React from "react";

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
      <path d="M11.001 10h2v5h-2zM11 16h2v2z" />
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
          To see theme changes reflected on your site, restart the Tina CLI
          after saving <em>(local development only)</em>.
        </div>
      </div>
    </p>
  );
};

export const ThemeCollection = {
  name: "theme",
  label: "Theme",
  path: "config/theme",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  fields: [
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
      type: "object",
      name: "colors",
      label: "Light Mode",
      fields: [
        {
          type: "string",
          name: "primary",
          label: "Primary",
          ui: {
            component: "color",
          },
        },
        {
          type: "string",
          name: "primaryDark",
          label: "Primary Dark",
          ui: {
            component: "color",
          },
        },
        {
          type: "string",
          name: "primaryDarker",
          label: "Primary Darker",
          ui: {
            component: "color",
          },
        },
        {
          type: "string",
          name: "primaryDarkest",
          label: "Primary Darkest",
          ui: {
            component: "color",
          },
        },
        {
          type: "string",
          name: "primaryLight",
          label: "Primary Light",
          ui: {
            component: "color",
          },
        },
        {
          type: "string",
          name: "primaryLighter",
          label: "Primary Lighter",
          ui: {
            component: "color",
          },
        },
        {
          type: "string",
          name: "primaryLightest",
          label: "Primary Lightest",
          ui: {
            component: "color",
          },
        },
        {
          type: "string",
          name: "footerBackground",
          label: "Footer Background",
          ui: {
            component: "color",
          },
        },
        {
          type: "string",
          name: "highlightedCodeLineBackground",
          label: "Highlighted Code Line Background",
          description: "Background color for highlighted lines in code blocks",
          ui: {
            component: "color",
          },
        },
      ],
    },
    {
      type: "object",
      name: "darkColors",
      label: "Dark Mode",
      fields: [
        {
          type: "string",
          name: "primary",
          label: "Primary",
          ui: {
            component: "color",
          },
        },
        {
          type: "string",
          name: "primaryDark",
          label: "Primary Dark",
          ui: {
            component: "color",
          },
        },
        {
          type: "string",
          name: "primaryDarker",
          label: "Primary Darker",
          ui: {
            component: "color",
          },
        },
        {
          type: "string",
          name: "primaryDarkest",
          label: "Primary Darkest",
          ui: {
            component: "color",
          },
        },
        {
          type: "string",
          name: "primaryLight",
          label: "Primary Light",
          ui: {
            component: "color",
          },
        },
        {
          type: "string",
          name: "primaryLighter",
          label: "Primary Lighter",
          ui: {
            component: "color",
          },
        },
        {
          type: "string",
          name: "primaryLightest",
          label: "Primary Lightest",
          ui: {
            component: "color",
          },
        },
        {
          type: "string",
          name: "footerBackground",
          label: "Footer Background",
          ui: {
            component: "color",
          },
        },
        {
          type: "string",
          name: "highlightedCodeLineBackground",
          label: "Highlighted Code Line Background",
          description: "Background color for highlighted lines in code blocks",
          ui: {
            component: "color",
          },
        },
      ],
    },
    {
      type: "object",
      name: "typography",
      label: "Typography",
      fields: [
        {
          type: "string",
          name: "baseFontFamily",
          label: "Base Font Family",
          description: "CSS font-family value (e.g., '\"Inter\", \"Arial\", sans-serif')",
        },
        {
          type: "string",
          name: "monospaceFontFamily",
          label: "Monospace Font Family",
          description: "CSS font-family value for code blocks (e.g., '\"Fira Code\", monospace')",
        },
        {
          type: "string",
          name: "codeFontSize",
          label: "Code Font Size",
          ui: {
            component: "select",
          },
          options: [
            { value: "90%", label: "Small (90%)" },
            { value: "95%", label: "Default (95%)" },
            { value: "100%", label: "Medium (100%)" },
            { value: "110%", label: "Large (110%)" },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "layout",
      label: "Layout",
      fields: [
        {
          type: "number",
          name: "globalRadius",
          label: "Global Border Radius (px)",
          ui: {
            parse: (value) => Number(value),
            format: (value) => String(value),
          },
        },
        {
          type: "number",
          name: "buttonRadius",
          label: "Button Border Radius (px)",
          ui: {
            parse: (value) => Number(value),
            format: (value) => String(value),
          },
        },
        {
          type: "number",
          name: "cardRadius",
          label: "Card Border Radius (px)",
          ui: {
            parse: (value) => Number(value),
            format: (value) => String(value),
          },
        },
        {
          type: "string",
          name: "navbarHeight",
          label: "Navbar Height",
          ui: {
            component: "select",
          },
          options: [
            { value: "3rem", label: "Small (3rem)" },
            { value: "3.5rem", label: "Medium (3.5rem)" },
            { value: "4rem", label: "Default (4rem)" },
            { value: "4.5rem", label: "Large (4.5rem)" },
          ],
        },
      ],
    },
    {
      type: "string",
      name: "customCSS",
      label: "Custom CSS",
      ui: {
        component: "textarea",
      },
      description: "Add custom CSS rules that will be injected into the site",
    },
  ],
};