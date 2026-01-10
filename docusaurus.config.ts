import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { themes } from 'prism-react-renderer';

import PrismLight from './src/utils/prismLight';
import PrismDark from './src/utils/prismDark';

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createConfig;
const docusaurusData = require("./config/docusaurus/index.json");

// Function to map theme names to actual theme objects
const getTheme = (themeName: string) => {
  switch (themeName) {
    case 'github': return themes.github;
    case 'vsLight': return themes.vsLight;
    case 'vsDark': return themes.vsDark;
    case 'dracula': return themes.dracula;
    case 'nightOwl': return themes.nightOwl;
    case 'nightOwlLight': return themes.nightOwlLight;
    case 'oceanicNext': return themes.oceanicNext;
    case 'oneLight': return themes.oneLight;
    case 'oneDark': return themes.oneDark;
    case 'duotoneLight': return themes.duotoneLight;
    case 'duotoneDark': return themes.duotoneDark;
    case 'gruvboxMaterialLight': return themes.gruvboxMaterialLight;
    case 'gruvboxMaterialDark': return themes.gruvboxMaterialDark;
    case 'jettwaveLight': return themes.jettwaveLight;
    case 'jettwaveDark': return themes.jettwaveDark;
    case 'okaidia': return themes.okaidia;
    case 'palenight': return themes.palenight;
    case 'shadesOfPurple': return themes.shadesOfPurple;
    case 'synthwave84': return themes.synthwave84;
    case 'ultramin': return themes.ultramin;
    case 'prismLight': return PrismLight;
    case 'prismDark': return PrismDark;
    default: return themes.github;
  }
};
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
  title: docusaurusData.title,
  tagline: docusaurusData.tagline,
  url: docusaurusData.url?.siteUrl,
  baseUrl: docusaurusData.url?.baseUrl,
  onBrokenLinks: "warn",
  favicon: docusaurusData.favicon,
  // Client modules that run on every page
  clientModules: [require.resolve("./src/clientModules/editThisPageTarget.js")],

  // Github pages deployment config.
  projectName: docusaurusData.github?.projectName,
  organizationName: docusaurusData.github?.organizationName,
  trailingSlash: docusaurusData.url?.trailingSlash,

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
          showReadingTime: docusaurusData.showReadingTime,
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
    colorMode: {
      defaultMode: docusaurusData.colorMode?.defaultMode,
      disableSwitch: docusaurusData.colorMode?.disableSwitch,
      respectPrefersColorScheme: docusaurusData.colorMode?.respectPrefersColorScheme,
    },
    docs: {
      sidebar: {
        hideable: docusaurusData.sidebarHideable,
      },
    },
    navbar: {
      title: docusaurusData.title,
      logo: {
        alt: docusaurusData?.logo?.alt,
        src: docusaurusData?.logo?.src,
      },
      items: docusaurusData.navbar.map(formatNavbarItem),
    },
    footer: {
      //        style: docusaurusData.footer?.style || "dark",
      links: docusaurusData.footer?.links.map((item: any) => {
        return formatFooterItem(item);
      }),
      copyright: `Copyright © ${new Date().getFullYear()} ${docusaurusData.footer?.copyright}`,
    },
      prism: {
        additionalLanguages: docusaurusData.prism?.additionalLanguages,
        magicComments: docusaurusData.prism?.magicComments,
        theme: getTheme(docusaurusData.prism.theme),
        darkTheme: getTheme(docusaurusData.prism.darkTheme),
      },
    languageTabs: (() => {
      // Define all available language configurations
      const availableLanguages = {
        python: {
          highlight: "python",
          language: "python",
          logoClass: "python",
        },
        typescript: {
          highlight: "typescript",
          language: "typescript",
          logoClass: "typescript",
        },
        javascript: {
          highlight: "javascript",
          language: "javascript",
          logoClass: "javascript",
        },
        nodejs: {
          highlight: "javascript",
          language: "nodejs",
          logoClass: "nodejs",
        },
        curl: {
          highlight: "bash",
          language: "curl",
          logoClass: "curl",
        },
        csharp: {
          highlight: "csharp",
          language: "csharp",
          logoClass: "csharp",
        },
        go: {
          highlight: "go",
          language: "go",
          logoClass: "go",
        },
        ruby: {
          highlight: "ruby",
          language: "ruby",
          logoClass: "ruby",
        },
        php: {
          highlight: "php",
          language: "php",
          logoClass: "php",
        },
        java: {
          highlight: "java",
          language: "java",
          logoClass: "java",
          variant: "unirest",
        },
        powershell: {
          highlight: "powershell",
          language: "powershell",
          logoClass: "powershell",
        },
        dart: {
          highlight: "dart",
          language: "dart",
          logoClass: "dart",
        },
        c: {
          highlight: "c",
          language: "c",
          logoClass: "c",
        },
        "objective-c": {
          highlight: "objective-c",
          language: "objective-c",
          logoClass: "objective-c",
        },
        ocaml: {
          highlight: "ocaml",
          language: "ocaml",
          logoClass: "ocaml",
        },
        r: {
          highlight: "r",
          language: "r",
          logoClass: "r",
        },
        swift: {
          highlight: "swift",
          language: "swift",
          logoClass: "swift",
        },
        kotlin: {
          highlight: "kotlin",
          language: "kotlin",
          logoClass: "kotlin",
        },
        rust: {
          highlight: "rust",
          language: "rust",
          logoClass: "rust",
        },
      };

      // Get selected languages from global languageTabs setting
      const selectedLanguages = docusaurusData.languageTabs || ["python", "curl", "csharp", "go", "nodejs"];
      
      // Map selected languages to their full configurations
      return selectedLanguages
        .map(lang => availableLanguages[lang])
        .filter(Boolean); // Remove any undefined entries
    })(),
  },
  plugins: [
    require.resolve("docusaurus-lunr-search"),
    [
      "docusaurus-plugin-openapi-docs",
      {
        id: "openapi",
        docsPluginId: "classic",
        config: (() => {
          const config: { [key: string]: { specPath: string; outputDir: string; downloadUrl?: string; sidebarOptions: { groupPathsBy: string; categoryLinkSource: string } } } = {};
          const apis: Array<{ name: string; specPath: string; outputDir: string; downloadUrl?: string; groupPathsBy?: string; categoryLinkSource?: string }> = docusaurusData.openapi;
          
          for (const api of apis) {
            config[api.name] = {
              specPath: api.specPath,
              outputDir: api.outputDir,
              downloadUrl: api.downloadUrl,
              sidebarOptions: {
                groupPathsBy: api.groupPathsBy || "tag",
                categoryLinkSource: api.categoryLinkSource || "tag",
              },
            };
          }
          
          return config;
        })(),
      },
    ],
    [
      "docusaurus-graphql-plugin",
      {
        // can be a path, a glob or an URL
        schema: docusaurusData.graphql,
      },
    ],
  ],
  themes: ["docusaurus-theme-openapi-docs", "@docusaurus/theme-mermaid"],
};
async function createConfig() {
  return config;
}
