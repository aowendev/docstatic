Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createConfig;
const docusaurusData = require("./config/docusaurus/index.json");
const getDocId = (doc) => {
  return doc
    .replace(/\.mdx?$/, "")
    .split("/")
    .slice(1)
    .join("/");
};
const getPageRoute = (page) => {
  return page
    .replace(/\.mdx?$/, "")
    .split("/")
    .slice(2)
    .join("/");
};
const getPath = (page) => {
  return page.replace(/\.mdx?$/, "");
};
const formatFooterItem = (item) => {
  if (item.title) {
    return {
      title: item.title,
      items: item.items.map((subItem) => {
        return formatFooterItem(subItem);
      }),
    };
  }
  const linkObject = {
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
const config = {
  markdown: {
    mermaid: true,
  },
  title: docusaurusData.title || "My Site",
  tagline: docusaurusData.tagline || "Tag Line",
  url: docusaurusData.url || "https://www.example.com/docstatic/",
  baseUrl: "",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/docstatic.png",
  // Client modules that run on every page
  clientModules: [require.resolve("./src/clientModules/editThisPageTarget.js")],

  // Github pages deployment config.
  projectName: "aowendev.github.io",
  organizationName: "aowendev",
  trailingSlash: false,
  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr"],
  },
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.ts"),
          // Remove this to remove the "edit this page" links.
          editUrl: ({ versionDocsDirPath, docPath }) => {
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
          showReadingTime: true,
          // Truncate blog previews with manual markers or excerpt
          truncateMarker: /<!--\s*(truncate)\s*-->/,
          // Edit URL configuration for blog posts
          editUrl: ({ blogDirPath, blogPath, permalink, locale }) => {
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
        hideable: true,
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
      items: [
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
        //          {
        //            type: "docsVersionDropdown",
        //            position: "right",
        //          },
        {
          type: "localeDropdown",
          position: "right",
        },
        //          {
        //            href: "https://www.example.com",
        //            label: "Example Link",
        //            position: "right",
        //          },
      ],
    },
    footer: {
      //        style: docusaurusData.footer?.style || "dark",
      links: docusaurusData.footer?.links.map((item) => {
        return formatFooterItem(item);
      }),
      copyright: `Copyright © ${new Date().getFullYear()} ${docusaurusData.footer?.copyright || docusaurusData.title}`,
    },
    prism: {
      additionalLanguages: [
        "ruby",
        "csharp",
        "php",
        "java",
        "powershell",
        "json",
        "bash",
        "dart",
        "objectivec",
        "r",
      ],
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
  ],
  themes: ["docusaurus-theme-openapi-docs", "@docusaurus/theme-mermaid"],
};
async function createConfig() {
  return config;
}
