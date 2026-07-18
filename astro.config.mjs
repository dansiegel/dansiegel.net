import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const site = process.env.PUBLIC_SITE_URL ?? "https://dansiegel.net";

export default defineConfig({
  site,
  output: "static",
  integrations: [
    mdx(),
    sitemap({
      filter: (url) => !url.includes("/404") && !url.includes("/contact/success"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
      wrap: true,
    },
  },
  compressHTML: true,
  build: {
    inlineStylesheets: "auto",
  },
});
