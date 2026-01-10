import React from "react";
import { defineConfig, ReferenceField, TextField } from "tinacms";
// conditions from the conditions JSON file
import conditionsData from "../reuse/conditions/index.json";
// doc tags from the taxonomy JSON file
import data from "../reuse/taxonomy/index.json";
// docusaurus config for language settings
import docusaurusData from "../config/docusaurus/index.json";
// collapsible field component
import CollapsibleField from "../src/components/CollapsibleField";
// conditions tree UI component
import ConditionsTreeField from "../src/components/ConditionsField";
import { FeaturesBlockTemplate } from "../src/components/Features/template";
import { GlossaryTermTemplate, GlossaryTermTranslationTemplate, GlossaryTermCollection } from "../src/components/GlossaryTerm/template";
// context help
import HelpButton from "../src/components/HelpButton";
import { HeroBlockTemplate } from "../src/components/Hero/template";
import { SettingsCollection } from "../src/components/Settings/template";
// workflows component
import StatusField from "../src/components/StatusField";
// tags UI component
import TagsField from "../src/components/TagsField";
import { YouTubeEmbedBlockTemplate } from "../src/components/YouTubeEmbed/template";
import { MDXTemplates } from "../src/theme/template";
import { docusaurusDate, titleFromSlug } from "../util";

// Function to extract available locales from Docusaurus config
function getDocusaurusLocales() {
  return docusaurusData.languages.supported.map(lang => lang.code);
}

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

// Get available locales from Docusaurus config
const availableLocales = getDocusaurusLocales();

// Create language options with descriptive labels
const languageOptions = createLanguageOptions();

// Make conditions data available globally for tree component
if (typeof window !== "undefined") {
  window.conditionsData = conditionsData;
}

const allTags = [];

function collectTags(nodes) {
  if (!Array.isArray(nodes)) return;
  for (const node of nodes) {
    if (node.tag) allTags.push(node.tag);
    if (node.children) collectTags(node.children);
  }
}

// get all conditions from hierarchical structure
const allConditions = [];

function collectConditions(categories) {
  if (!Array.isArray(categories)) return;
  for (const category of categories) {
    if (category.conditions && Array.isArray(category.conditions)) {
      for (const condition of category.conditions) {
        if (condition.active !== false) {
          // include active conditions and those without active field
          allConditions.push({
            value: condition.condition,
            label: `${condition.condition} (${category.name})`,
          });
        }
      }
    }
  }
}

collectTags(data.taxonomy);
collectConditions(conditionsData.categories);

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
    beforeSubmit: async ({ values }) => {
      return {
      ...values,
       lastmod: new Date().toISOString(),
      };
    },
    defaultItem: {
      date: docusaurusDate(new Date()),
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
          <HelpButton url="https://docstatic.com/docs/blog" {...props} />
        ),
      },
    },
    {
      label: "Last Modified",
      type: "string",
      name: "lastmod",
      ui: {
        component: "hidden",
      },
    },
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
      label: "Tags",
      name: "tags",
      type: "string",
      list: true,
      ui: {
        component: (props) => (
          <CollapsibleField
            {...props}
            FieldComponent={TagsField}
            defaultCollapsed={true}
          />
        ),
      },
      options: allTags,
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

const SnippetsCollection = {
  name: "snippets",
  label: "Snippets",
  path: "reuse/snippets",
  format: "mdx",
  fields: [
    {
      type: "boolean",
      name: "help",
      label: "Help",
      required: false,
      ui: {
        component: (props) => (
          <HelpButton
            url="https://docstatic.com/docs/guides/markdown-features/snippets"
            {...props}
          />
        ),
      },
    },
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
  match: {
    exclude: "{api/**/**,wiki/**/**}",
  },
  format: "mdx",
  ui: {
    beforeSubmit: async ({ values }) => {
      return {
      ...values,
       lastmod: new Date().toISOString(),
      };
    },
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
      type: "boolean",
      name: "help",
      label: "Help",
      required: false,
      ui: {
        component: (props) => (
          <HelpButton
            url="https://docstatic.com/docs/guides/docs/create-doc"
            {...props}
          />
        ),
      },
    },
    {
      label: "Last Modified",
      type: "string",
      name: "lastmod",
      ui: {
        component: "hidden",
      },
    },
    {
      type: "string",
      name: "title",
      label: "Title",
      isTitle: true,
      required: true,
    },
    {
      type: "rich-text",
      name: "body",
      label: "Body",
      isBody: true,
      templates: [...MDXTemplates],
    },
    {
      label: "Conditions",
      name: "conditions",
      type: "string",
      list: true,
      ui: {
        component: (props) => (
          <CollapsibleField
            {...props}
            FieldComponent={ConditionsTreeField}
            defaultCollapsed={true}
          />
        ),
      },
      options: allConditions,
    },
    {
      type: "string",
      name: "description",
      label: "Description",
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
      name: "slug",
      label: "Slug",
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
      label: "Tags",
      name: "tags",
      type: "string",
      list: true,
      ui: {
        component: (props) => (
          <CollapsibleField
            {...props}
            FieldComponent={TagsField}
            defaultCollapsed={true}
          />
        ),
      },
      options: allTags,
    },

    {
      type: "boolean",
      name: "draft",
      label: "Workflow",
      ui: {
        component: (props) => (
          <CollapsibleField
            {...props}
            FieldComponent={StatusField}
            defaultCollapsed={true}
          />
        ),
      },
    },
    {
      type: "boolean",
      name: "review",
      label: "In Review",
      ui: { component: "hidden" },
    },
    {
      type: "boolean",
      name: "translate",
      label: "In Translation",
      ui: { component: "hidden" },
    },
    {
      type: "boolean",
      name: "approved",
      label: "Translation Approved",
      ui: { component: "hidden" },
    },
    {
      type: "boolean",
      name: "published",
      label: "Published",
      ui: { component: "hidden" },
    },
    {
      type: "boolean",
      name: "unlisted",
      label: "Unlisted",
      ui: { component: "hidden" },
    }
  ],
};

const WikiCollection = {
  name: "wiki",
  label: "Wiki Pages",
  path: "docs/wiki",
  format: "mdx",
  ui: {
    beforeSubmit: async ({ values }) => {
      return {
      ...values,
       lastmod: new Date().toISOString(),
      };
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
            url="https://docstatic.com/docs/guides/wikis"
            {...props}
          />
        ),
      },
    },
    {
      label: "Last Modified",
      type: "string",
      name: "lastmod",
      ui: {
        component: "hidden",
      },
    },
    {
      type: "string",
      name: "title",
      label: "Title",
      isTitle: true,
      required: true,
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

const APIsCollection = {
  name: "generated",
  label: "API (generated)",
  path: "docs/api",
  format: "mdx",
  ui: {
    global: false,
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
      ui: { component: "hidden" },
      required: false,
    },
  ],
};

const TranslationCollection = {
  name: "i18n",
  label: "Translations",
  path: "i18n",
  format: "mdx",
  ui: {
    beforeSubmit: async ({ values }) => {
      return {
      ...values,
       lastmod: new Date().toISOString(),
      };
    },
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
      type: "boolean",
      name: "help",
      label: "Help",
      required: false,
      ui: {
        component: (props) => (
          <HelpButton
            url="https://docstatic.com/docs/i18n/introduction"
            {...props}
          />
        ),
      },
    },
    {
      label: "Last Modified",
      type: "string",
      name: "lastmod",
      ui: {
        component: "hidden",
      },
    },
    {
      type: "string",
      name: "title",
      label: "Title",
      isTitle: true,
      required: true,
    },
    {
      type: "rich-text",
      name: "body",
      label: "Body",
      isBody: true,
      templates: [...MDXTemplates],
    },
    {
      label: "Conditions",
      name: "conditions",
      type: "string",
      list: true,
      ui: {
        component: (props) => (
          <CollapsibleField
            {...props}
            FieldComponent={ConditionsTreeField}
            defaultCollapsed={true}
          />
        ),
      },
      options: allConditions,
    },
    {
      type: "string",
      name: "description",
      label: "Description",
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
      name: "slug",
      label: "Slug",
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
      label: "Tags",
      name: "tags",
      type: "string",
      list: true,
      ui: {
        component: (props) => (
          <CollapsibleField
            {...props}
            FieldComponent={TagsField}
            defaultCollapsed={true}
          />
        ),
      },
      options: allTags,
    },

    {
      type: "boolean",
      name: "draft",
      label: "Workflow",
      ui: {
        component: (props) => (
          <CollapsibleField
            {...props}
            FieldComponent={StatusField}
            defaultCollapsed={true}
          />
        ),
      },
    },
    {
      type: "boolean",
      name: "review",
      label: "In Review",
      ui: { component: "hidden" },
    },
    {
      type: "boolean",
      name: "translate",
      label: "In Translation",
      ui: { component: "hidden" },
    },
    {
      type: "boolean",
      name: "approved",
      label: "Translation Approved",
      ui: { component: "hidden" },
    },
    {
      type: "boolean",
      name: "published",
      label: "Published",
      ui: { component: "hidden" },
    },
    {
      type: "boolean",
      name: "unlisted",
      label: "Unlisted",
      ui: { component: "hidden" },
    }
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
        }, [props.tinaForm.values, props.field.name]);

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
      type: "boolean",
      name: "help",
      label: "Help",
      required: false,
      ui: {
        component: (props) => (
          <HelpButton
            url="https://docstatic.com/docs/guides/markdown-features/toc"
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
    SidebarItemsField,
  ],
};

const HomepageCollection = {
  name: "homepage",
  label: "Home Page",
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
      type: "boolean",
      name: "help",
      label: "Help",
      required: false,
      ui: {
        component: (props) => (
          <HelpButton
            url="https://docstatic.com/docs/introduction"
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
      type: "boolean",
      name: "help",
      label: "Help",
      required: false,
      ui: {
        component: (props) => (
          <HelpButton
            url="https://docstatic.com/docs/guides/creating-pages"
            {...props}
          />
        ),
      },
    },
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
  ui: {
    allowedActions: {
      create: true,
      delete: true,
    },
  },
};

// DocStatic Collections

// conditions
const ConditionsCollection = {
  label: "Conditions",
  name: "conditions",
  path: "reuse/conditions",
  format: "json",
  fields: [
    {
      type: "boolean",
      name: "help",
      label: "Help",
      required: false,
      ui: {
        component: (props) => (
          <HelpButton
            url="https://docstatic.com/docs/guides/markdown-features/conditional-text"
            {...props}
          />
        ),
      },
    },
    {
      type: "object",
      label: "Categories",
      name: "categories",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item.name,
        }),
      },
      fields: [
        {
          type: "string",
          label: "Category Name",
          name: "name",
          isTitle: true,
          required: true,
        },
        {
          type: "string",
          label: "Description",
          name: "description",
        },
        {
          type: "object",
          label: "Conditions",
          name: "conditions",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item.condition,
            }),
          },
          fields: [
            {
              type: "string",
              label: "Condition",
              name: "condition",
              isTitle: true,
              required: true,
            },
            {
              type: "string",
              label: "Description",
              name: "description",
            },
            {
              type: "boolean",
              label: "Active",
              name: "active",
              description:
                "Whether this condition is currently active/available",
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

// variable sets
const VariableSetCollection = {
  label: "Variable Sets",
  name: "variableSets",
  path: "reuse/variableSets",
  format: "json",
  fields: [
    {
      type: "boolean",
      name: "help",
      label: "Help",
      required: false,
      ui: {
        component: (props) => (
          <HelpButton
            url="https://docstatic.com/docs/guides/markdown-features/variables"
            {...props}
          />
        ),
      },
    },
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
                  options: languageOptions,
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
  label: "Taxonomies",
  path: "reuse/taxonomy",
  format: "json",
  fields: [
    {
      type: "boolean",
      name: "help",
      label: "Help",
      required: false,
      ui: {
        component: (props) => (
          <HelpButton
            url="https://docstatic.com/docs/guides/docs/taxonomies"
            {...props}
          />
        ),
      },
    },
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

// glossary terms collection - imported from template

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID, // Get this from tina.io
  token: process.env.TINA_TOKEN, // Read-only token from tina.io
  build: {
    outputFolder: "admin",
    publicFolder: "static",
    //    basePath: "", // if your Tina admin is not at the root of your site, set this to the path where it is hosted
  },
  media: {
    tina: {
      mediaRoot: "img",
      publicFolder: "static",
    },
  },
  schema: {
    collections: [
      ConditionsCollection,
      PostCollection,
      GlossaryTermCollection,
      HomepageCollection,
      PagesCollection,
      SettingsCollection,
      SnippetsCollection,
      SidebarCollection,
      TaxonomyCollection,
      DocsCollection,
      TranslationCollection,
      VariableSetCollection,
      WikiCollection,
      APIsCollection,
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
