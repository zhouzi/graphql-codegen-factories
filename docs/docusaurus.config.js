// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/vsDark");
const packageJson = require("../packages/graphql-codegen-factories/package.json");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: packageJson.name,
  tagline: packageJson.description,
  url: "https://gabinaureche.com/",
  baseUrl: "/graphql-codegen-factories/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "images/favicon.ico",
  organizationName: "zhouzi",
  projectName: packageJson.name,

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        theme: {
          customCss: [require.resolve("./src/custom.css")],
        },
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl: `https://github.com/zhouzi/${packageJson.name}/blob/main/docs/`,
        },
        blog: false,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: packageJson.name,
        logo: {
          alt: packageJson.name,
          src: "images/logo.svg",
        },
        items: [
          {
            href: `https://github.com/zhouzi/${packageJson.name}`,
            label: "GitHub",
            position: "right",
          },
          {
            href: `https://www.npmjs.com/package/${packageJson.name}`,
            label: "npm",
            position: "right",
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
