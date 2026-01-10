import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import PrismLight from './src/utils/prismLight';
import PrismDark from './src/utils/prismDark';

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createConfig;
const docusaurusData = require("./config/docusaurus/index.json");
const getDocId = (doc: string) => {
  return doc
    .replace(/\.mdx?$/, "")
    .split("/")
    .slice(1)
    .join("/");
};
const getPageRoute = (page: string) => {
  return page
    .replace(/\.mdx?$/, "")
    .split("/")
    .slice(2)
    .join("/");
};
const getPath = (page: string) => {
  return page.replace(/\.mdx?$/, "");
};
type FooterItem =
  | { title: any; items: FooterItem[] }
  | { label: any; to?: any; href?: any };

const formatFooterItem = (item: { title: any; items: any[]; label: any; to: any; href: any; }): FooterItem => {
  if (item.title) {
    return {
      title: item.title,
      items: item.items.map((subItem: any) => {
        return formatFooterItem(subItem);
      }),
    };
  }
  const linkObject: { label: any; to?: any; href?: any } = {
    label: item.label,
  };
  if (item.to) {
    linkObject.to = getPath(item.to);
  } else if (item.href) {
    linkObject.href = item.href;
  } else {
    linkObject.to = "/blog";
  }
  return linkObject;
};

const formatNavbarItem = (item: any) => {
  const baseItem: any = {
    label: item.label,
    position: item.position,
  };

  switch (item.link) {
    case "doc":
      return {
        ...baseItem,
        type: "doc",
        docId: item.docId,
      };
    case "blog":
      return {
        ...baseItem,
        to: "/blog",
      };
    case "page":
      return {
        ...baseItem,
        to: item.pageLink ? getPageRoute(item.pageLink) : "example-page",
      };
    case "external":
      return {
        ...baseItem,
        href: item.externalLink,
      };
    case "manualPath":
      return {
        ...baseItem,
        to: item.manualPath,
      };
    case "localeDropdown":
      return {
        type: "localeDropdown",
        position: item.position,
      };
    case "docsVersionDropdown":
      return {
        type: "docsVersionDropdown",
        position: item.position,
      };
    case "search":
      return {
        type: "search",
        position: item.position,
      };
    case "dropdown":
      return {
        ...baseItem,
        type: "dropdown",
        items: item.items ? item.items.map(formatNavbarItem) : [],
      };
    default:
      return baseItem;
  }
};
const config = {
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "warn",
    }
  },
  title: docusaurusData.title || "My Site",
  tagline: docusaurusData.tagline || "Tag Line",
  url: docusaurusData.url?.siteUrl || "https://www.example.com/docstatic/",
  baseUrl: docusaurusData.url?.baseUrl || "",
  onBrokenLinks: "warn",
  favicon: docusaurusData.favicon || "img/docstatic.png",
  // Client modules that run on every page
  clientModules: [require.resolve("./src/clientModules/editThisPageTarget.js")],

  // Github pages deployment config.
  projectName: docusaurusData.github?.projectName || "aowendev.github.io",
  organizationName: docusaurusData.github?.organizationName || "aowendev",
  trailingSlash: docusaurusData.url?.trailingSlash ?? false,

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],
  
  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: docusaurusData.languages.default,
    locales: docusaurusData.languages.supported.map((lang: any) => lang.code),
  },

  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.ts"),
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          // Remove this to remove the "edit this page" links.
          editUrl: ({ versionDocsDirPath, docPath }: { versionDocsDirPath: string; docPath: string }) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _unused = versionDocsDirPath;
            // docPath gives us the file path relative to docs directory
            // For example: "quick-start/quick-start.mdx", "wiki/index.md", "test-page.mdx"

            // Remove file extension to get the path that TinaCMS expects
            const cleanPath = docPath.replace(/\.(mdx?|md)$/, "");

            // TinaCMS expects the full path including filename (without extension)
            // So quick-start/quick-start.mdx becomes quick-start/quick-start
            return `/admin#/collections/edit/doc/${cleanPath}`;
          },
          docItemComponent: "@theme/ApiItem", // Derived from docusaurus-theme-openapi
        },
        blog: {
          showReadingTime: docusaurusData.showReadingTime ?? true,
          // Truncate blog previews with manual markers or excerpt
          truncateMarker: /<!--\s*(truncate)\s*-->/,
          // Edit URL configuration for blog posts
          editUrl: ({
            blogDirPath,
            blogPath,
            permalink,
            locale,
          }: {
            blogDirPath: string;
            blogPath: string;
            permalink: string;
            locale: string;
          }) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _unused = { blogDirPath, permalink, locale };
            // blogPath gives us something like "hybrid.mdx"
            // Remove file extension to get the path that TinaCMS expects
            const cleanPath = blogPath.replace(/\.(mdx?|md)$/, "");

            // For blog posts, TinaCMS expects just the filename (without extension)
            // So "hybrid.mdx" becomes "hybrid"
            return `/admin#/collections/edit/post/${cleanPath}`;
          },
          onInlineAuthors: "ignore",
          onUntruncatedBlogPosts: "ignore",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
  themeConfig: {
    docs: {
      sidebar: {
        hideable: docusaurusData.sidebarHideable ?? true,
      },
    },
    navbar: {
      title: docusaurusData.title || "My Site",
      logo: {
        alt: docusaurusData?.logo?.alt ? docusaurusData?.logo?.alt : "My Logo",
        src: docusaurusData?.logo?.src
          ? docusaurusData?.logo?.src
          : "img/logo.svg",
      },
      items: docusaurusData.navbar ? docusaurusData.navbar.map(formatNavbarItem) : [
        {
          type: "doc",
          docId: "introduction",
          position: "left",
          label: "Docs",
        },
        { to: "/blog", label: "Blog", position: "left" },
        {
          label: "Page",
          position: "left",
          to: "example-page",
        },
        {
          label: "GraphQL",
          position: "left",
          to: "/docs/api/queries",
        },
        {
          label: "OpenAPI",
          position: "left",
          to: "/docs/category/petstore-api",
        },
        {
          type: "doc",
          docId: "wiki/readme",
          position: "left",
          label: "Wiki",
        },
        {
          type: "localeDropdown",
          position: "right",
        },
      ],
    },
    footer: {
      //        style: docusaurusData.footer?.style || "dark",
      links: docusaurusData.footer?.links.map((item: any) => {
        return formatFooterItem(item);
      }),
      copyright: `Copyright © ${new Date().getFullYear()} ${docusaurusData.footer?.copyright || docusaurusData.title}`,
    },
      prism: {
        additionalLanguages: [
          'java',
          'latex',
          'haskell',
          'matlab',
          'PHp',
          'powershell',
          'bash',
          'diff',
          'json',
          'scss',
        ],
        magicComments: [
          {
            className: 'theme-code-block-highlighted-line',
            line: 'highlight-next-line',
            block: {start: 'highlight-start', end: 'highlight-end'},
          },
          {
            className: 'code-block-error-line',
            line: 'This will error',
          },
        ],
        theme: PrismLight,
        darkTheme: PrismDark,
      },
    languageTabs: [
      {
        highlight: "python",
        language: "python",
        logoClass: "python",
      },
      {
        highlight: "bash",
        language: "curl",
        logoClass: "curl",
      },
      {
        highlight: "csharp",
        language: "csharp",
        logoClass: "csharp",
      },
      {
        highlight: "go",
        language: "go",
        logoClass: "go",
      },
      {
        highlight: "javascript",
        language: "nodejs",
        logoClass: "nodejs",
      },
      {
        highlight: "ruby",
        language: "ruby",
        logoClass: "ruby",
      },
      {
        highlight: "php",
        language: "php",
        logoClass: "php",
      },
      {
        highlight: "java",
        language: "java",
        logoClass: "java",
        variant: "unirest",
      },
      {
        highlight: "powershell",
        language: "powershell",
        logoClass: "powershell",
      },
      {
        highlight: "dart",
        language: "dart",
        logoClass: "dart",
      },
      {
        highlight: "javascript",
        language: "javascript",
        logoClass: "javascript",
      },
      {
        highlight: "c",
        language: "c",
        logoClass: "c",
      },
      {
        highlight: "objective-c",
        language: "objective-c",
        logoClass: "objective-c",
      },
      {
        highlight: "ocaml",
        language: "ocaml",
        logoClass: "ocaml",
      },
      {
        highlight: "r",
        language: "r",
        logoClass: "r",
      },
      {
        highlight: "swift",
        language: "swift",
        logoClass: "swift",
      },
      {
        highlight: "kotlin",
        language: "kotlin",
        logoClass: "kotlin",
      },
      {
        highlight: "rust",
        language: "rust",
        logoClass: "rust",
      },
    ],
  },
  plugins: [
    require.resolve("docusaurus-lunr-search"),
    [
      "docusaurus-plugin-openapi-docs",
      {
        id: "openapi",
        docsPluginId: "classic",
        config: {
          petstore: {
            specPath: "apis/petstore.yaml",
            outputDir: "docs/api/petstore",
            downloadUrl:
              "https://raw.githubusercontent.com/PaloAltoNetworks/docusaurus-template-openapi-docs/main/examples/petstore.yaml",
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
          },
        },
      },
    ],
    [
      "docusaurus-graphql-plugin",
      {
        // can be a path, a glob or an URL
        schema: "http://localhost:4001/graphql",
      },
    ],
  ],
  themes: ["docusaurus-theme-openapi-docs", "@docusaurus/theme-mermaid"],
};
async function createConfig() {
  return config;
}
