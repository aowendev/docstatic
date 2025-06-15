import React from "react";
import { TextField, defineConfig } from "tinacms";
import { ReferenceField } from "tinacms";
import title from "title";
import { FeaturesBlockTemplate } from "../src/components/Features/template";
import { HeroBlockTemplate } from "../src/components/Hero/template";
import { YouTubeEmbedBlockTemplate } from "../src/components/YouTubeEmbed/template";
import { MDXTemplates } from "../src/theme/template";
import { docusaurusDate, titleFromSlug } from "../util";

// get doc tags from the taxonomy JSON file
import data from "../reuse/taxonomy/index.json";

const allTags = [];

function collectTags(nodes) {
  if (!Array.isArray(nodes)) return;
  nodes.forEach((node) => {
    if (node.tag) allTags.push(node.tag);
    if (node.children) collectTags(node.children);
  });
}

collectTags(data.taxonomy);

// Your hosting provider likely exposes this as an environment variable
const branch =
  //  process.env.VERCEL_GIT_COMMIT_REF ||
  //  process.env.HEAD ||
  "main";

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

const PostCollection = {
  name: "post",
  label: "Blog Articles",
  path: "blog",
  format: "mdx",
  ui: {
    defaultItem: {
      date: docusaurusDate(new Date()),
    },
  },
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      isTitle: true,
      required: true,
    },
    {
      name: "authors",
      label: "Authors",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => {
          return { label: item?.name };
        },
      },
      fields: [
        {
          name: "name",
          label: "Name",
          type: "string",
          isTitle: true,
          required: true,
        },
        {
          name: "title",
          label: "Title",
          type: "string",
        },
        {
          name: "url",
          label: "URL",
          type: "string",
        },
        {
          name: "image_url",
          label: "Image URL",
          type: "string",
        },
      ],
    },
    {
      name: "date",
      label: "Date",
      type: "string",
      required: true,
      ui: {
        dateFormat: "MMM D, yyyy",
        component: "date",
        parse: (val) => {
          return docusaurusDate(val);
        },
      },
    },
    {
      type: "rich-text",
      name: "body",
      label: "Body",
      isBody: true,
      templates: [...MDXTemplates],
    },
    {
      label: "Tags",
      name: "tags",
      type: "string",
      options: allTags,
      list: true,
    },
  ],
};

const SnippetsCollection = {
  name: "snippets",
  label: "Snippets",
  path: "reuse/snippets",
  format: "mdx",
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      isTitle: true,
      required: true,
    },
    {
      type: "string",
      name: "description",
      label: "Description",
    },
    {
      type: "rich-text",
      name: "body",
      label: "Body",
      isBody: true,
      templates: [...MDXTemplates],
    },
  ],
};

const DocsCollection = {
  name: "doc",
  label: "Topics",
  path: "docs",
  format: "mdx",
  ui: {
    defaultItem: {
      draft: true,
      review: false,
      translate: false,
      approved: false,
      published: false,
      unlisted: false,
    },
  },
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      isTitle: true,
      required: true,
    },
    {
      type: "string",
      name: "description",
      label: "Description",
    },
    {
      type: "rich-text",
      name: "body",
      label: "Body",
      isBody: true,
      templates: [...MDXTemplates],
    },
    {
      type: "boolean",
      name: "draft",
      label: "Draft",
    },
    {
      type: "boolean",
      name: "review",
      label: "In Review",
    },
    {
      type: "boolean",
      name: "translate",
      label: "In Translation",
    },
    {
      type: "boolean",
      name: "approved",
      label: "Translation Approved",
    },
    {
      type: "boolean",
      name: "published",
      label: "Published",
    },
    {
      type: "boolean",
      name: "unlisted",
      label: "Unlisted",
    },
    {
      label: "Tags",
      name: "tags",
      type: "string",
      options: allTags,
      list: true,
    },
  ],
};

const TranslationCollection = {
  name: "i18n",
  label: "Translation",
  path: "i18n",
  format: "mdx",
  ui: {
    defaultItem: {
      draft: true,
      review: false,
      translate: false,
      approved: false,
      published: false,
      unlisted: false,
    },
  },
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      isTitle: true,
      required: true,
    },
    {
      type: "string",
      name: "description",
      label: "Description",
    },
    {
      type: "rich-text",
      name: "body",
      label: "Body",
      isBody: true,
      templates: [...MDXTemplates],
    },
    {
      type: "boolean",
      name: "draft",
      label: "Draft",
      required: true,
    },
    {
      type: "boolean",
      name: "review",
      label: "In Review",
      required: true,
    },
    {
      type: "boolean",
      name: "translate",
      label: "In Translation",
    },
    {
      type: "boolean",
      name: "approved",
      label: "Translation Approved",
    },
    {
      type: "boolean",
      name: "published",
      label: "Published",
    },
    {
      type: "boolean",
      name: "unlisted",
      label: "Unlisted",
    },
    {
      label: "Tags",
      name: "tags",
      type: "string",
      options: allTags,
      list: true,
    },
  ],
};

const DocLinkTemplate = {
  name: "doc",
  label: "Doc Link",
  ui: {
    itemProps: (item) => {
      return {
        label: item?.label
          ? item?.label
          : item?.document
            ? titleFromSlug(item?.document)
            : item.name,
      };
    },
  },
  fields: [
    {
      label: "Document",
      name: "document",
      type: "reference",
      collections: ["doc"],
      isTitle: true,
      required: true,
    },
    {
      name: "label",
      label: "Label",
      description: "By default this is the document title",
      type: "string",
    },
  ],
};

const ExternalLinkTemplate = {
  name: "link",
  label: "External Link",
  ui: {
    itemProps: (item) => {
      return {
        label: item?.title ? item?.title : item.name,
      };
    },
  },
  fields: [
    {
      name: "title",
      label: "Label",
      type: "string",
      isTitle: true,
      required: true,
    },
    {
      name: "href",
      label: "URL",
      type: "string",
      required: true,
    },
  ],
};

const CategoryFields = [
  {
    name: "title",
    label: "Title",
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
        label: "Generated Index",
        value: "generated",
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
        }, [props.tinaForm.values]);

        if (link !== "doc") {
          return null;
        }

        return ReferenceField(props);
      },
    },
  },
];

const ItemsField = {
  name: "items",
  label: "Items",
  type: "object",
  list: true,
};

const CategoryTemplateProps = {
  name: "category",
  label: "Category",
  ui: {
    itemProps: (item) => {
      return {
        label: item?.title ? item?.title : item.name,
      };
    },
    defaultItem: {
      link: "none",
    },
  },
};

const CategoryTemplate = {
  ...CategoryTemplateProps,
  fields: [
    ...CategoryFields,
    {
      ...ItemsField,
      templates: [
        {
          ...CategoryTemplateProps,
          fields: [
            ...CategoryFields,
            {
              ...ItemsField,
              templates: [
                {
                  ...CategoryTemplateProps,
                  fields: [
                    ...CategoryFields,
                    {
                      ...ItemsField,
                      templates: [DocLinkTemplate, ExternalLinkTemplate],
                    },
                  ],
                },
                DocLinkTemplate,
                ExternalLinkTemplate,
              ],
            },
          ],
        },
        DocLinkTemplate,
        ExternalLinkTemplate,
      ],
    },
  ],
};

const SidebarItemsField = {
  ...ItemsField,
  templates: [CategoryTemplate, DocLinkTemplate, ExternalLinkTemplate],
};

const SidebarCollection = {
  name: "sidebar",
  label: "Table of Contents",
  path: "config/sidebar",
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
    SidebarItemsField,
  ],
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
        }, [props.tinaForm.values]);

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
        }, [props.tinaForm.values]);

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
        }, [props.tinaForm.values]);

        if (link !== "external") {
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

const SettingsCollection = {
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
      label: "Title",
      name: "title",
      required: true,
    },
    {
      type: "string",
      label: "Tagline",
      name: "tagline",
    },
    {
      type: "string",
      label: "URL",
      name: "url",
      required: true,
    },
    {
      type: "object",
      label: "Navbar",
      name: "navbar",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: `${item.label} - ${title(item.position)}`,
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
  ],
};

const HomepageCollection = {
  name: "homepage",
  label: "Landing Page",
  description:
    "To see settings changes reflected on your site, you must restart the Tina CLI after saving changes (local development only).",
  path: "config/homepage",
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
      name: "title",
      label: "Title",
    },
    {
      type: "string",
      name: "description",
      label: "Description",
    },
    {
      type: "object",
      list: true,
      name: "blocks",
      label: "Blocks",
      templates: [
        HeroBlockTemplate,
        FeaturesBlockTemplate,
        YouTubeEmbedBlockTemplate,
      ],
    },
  ],
};

const PagesCollection = {
  name: "pages",
  label: "Pages",
  path: "src/pages",
  format: "mdx",
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      isTitle: true,
      required: true,
    },
    {
      type: "string",
      name: "description",
      label: "Description",
    },
    {
      type: "rich-text",
      name: "body",
      label: "Body",
      isBody: true,
      templates: [...MDXTemplates],
    },
  ],
};

// DocStatic Collections

// variable sets
const VariableSetCollection = {
  label: "Variable Sets",
  name: "variableSets",
  path: "static/reuse/variableSets",
  format: "json",
  fields: [
    {
      type: "object",
      label: "Variable Sets",
      name: "variableSets",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item.name,
        }),
      },
      fields: [
        {
          type: "string",
          label: "Variable Set Name",
          name: "name",
          isTitle: true,
          required: true,
        },
        {
          type: "object",
          label: "Variables",
          name: "variables",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item.key,
            }),
          },
          fields: [
            {
              type: "string",
              label: "Key",
              name: "key",
              isTitle: true,
              required: true,
            },
            {
              type: "object",
              label: "Translations",
              name: "translations",
              list: true,
              ui: {
                itemProps: (item) => ({
                  label: `${item.lang}: ${item.value}`,
                }),
              },
              fields: [
                {
                  type: "string",
                  label: "Language",
                  name: "lang",
                  required: true,
                },
                {
                  type: "string",
                  label: "Value",
                  name: "value",
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
};

// taxonomy tags to a depth of three levels

const TaxonomyCollection = {
  name: "taxonomy",
  label: "Taxonomy",
  path: "reuse/taxonomy",
  format: "json",
  fields: [
    {
      type: "object",
      list: true,
      name: "taxonomy",
      label: "Taxonomy",
      ui: {
        itemProps: (item) => ({
          label: item?.tag,
        }),
      },
      fields: [
        {
          type: "string",
          name: "tag",
          label: "Tag",
          isTitle: true,
          required: true,
        },
        {
          type: "object",
          list: true,
          name: "children",
          label: "Children",
          ui: {
            itemProps: (item) => ({
              label: item?.tag ? item.tag : item.name,
            }),
          },
          fields: [
            {
              type: "string",
              name: "tag",
              label: "Tag",
              isTitle: true,
              required: true,
            },
            {
              type: "object",
              list: true,
              name: "children",
              label: "Children",
              ui: {
                itemProps: (item) => ({
                  label: item?.tag ? item.tag : item.name,
                }),
              },
              fields: [
                {
                  type: "string",
                  name: "tag",
                  label: "Tag",
                  isTitle: true,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
};

// glossary terms

const GlossaryTermTranslationTemplate = {
  name: "translation",
  label: "Translation",
  ui: {
    itemProps: (item) => ({
      label: `${item.term}: ${item.definition}`,
    }),
  },
  fields: [
    {
      type: "string",
      name: "term",
      label: "Term",
      required: true,
    },
    {
      type: "string",
      name: "definition",
      label: "Definition",
      required: true,
    },
  ],
};

const GlossaryTermLanguageTemplate = {
  name: "language",
  label: "Language",
  ui: {
    itemProps: (item) => ({
      label: `${item.lang}: ${item.translations[0].term}`,
    }),
  },
  fields: [
    {
      type: "string",
      name: "lang",
      label: "Language Code",
      required: true,
    },
    {
      type: "object",
      name: "translations",
      label: "Definitions",
      list: true,
      templates: [GlossaryTermTranslationTemplate],
    },
  ],
};

const GlossaryTermTemplate = {
  name: "glossaryTerm",
  label: "Glossary Term",
  ui: {
    itemProps: (item) => ({
      label: item?.key,
    }),
  },
  fields: [
    {
      type: "string",
      name: "key",
      label: "Key",
      isTitle: true,
      required: true,
    },
    {
      type: "object",
      name: "languages",
      label: "Translations",
      list: true,
      templates: [GlossaryTermLanguageTemplate],
    },
  ],
};

const GlossaryTermCollection = {
  label: "Glossary Terms",
  name: "glossaryTerms",
  path: "static/reuse/glossaryTerms",
  format: "json",
  fields: [
    {
      type: "object",
      name: "glossaryTerms",
      label: "Glossary Terms",
      list: true,
      templates: [GlossaryTermTemplate],
    },
  ],
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
};

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID, // Get this from tina.io
  token: process.env.TINA_TOKEN, // Read-only token from tina.io
  build: {
    outputFolder: "admin",
    publicFolder: "static",
    basePath: "docstatic", // if your Tina admin is not at the root of your site, set this to the path where it is hosted
  },
  media: {
    tina: {
      mediaRoot: "img",
      publicFolder: "static",
    },
  },
  schema: {
    collections: [
      HomepageCollection,
      SidebarCollection,
      DocsCollection,
      SnippetsCollection,
      TranslationCollection,
      PostCollection,
      PagesCollection,
      GlossaryTermCollection,
      VariableSetCollection,
      TaxonomyCollection,
      SettingsCollection,
    ],
  },
  search: {
    tina: {
      indexerToken: process.env.TINA_SEARCH_TOKEN, // Search token from tina.io
      stopwordLanguages: ["eng"],
    },
    indexBatchSize: 100,
    maxSearchIndexFieldLength: 100,
  },
});
