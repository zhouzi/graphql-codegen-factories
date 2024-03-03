// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import { themes } from "prism-react-renderer";
import path from "node:path";

import packageJson from "../packages/graphql-codegen-factories/package.json";

/** @type {import('@docusaurus/types').Config} */
export default {
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
          customCss: [path.resolve("./src/custom.css")],
        },
        docs: {
          routeBasePath: "/",
          sidebarPath: path.resolve("./sidebars.js"),
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
        theme: themes.vsLight,
        darkTheme: themes.vsDark,
      },
    }),
};
