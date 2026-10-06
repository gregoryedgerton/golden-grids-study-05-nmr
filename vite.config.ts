import { resolve } from "node:path";
import { readdirSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function pagesBase(): string {
  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
  if (!repo || repo.endsWith(".github.io")) return "/";
  return `/${repo}/`;
}

// Every .html at the root is an entry: the eight section pages and one per
// band. No router; pages link with plain relative hrefs, as the site did.
const pages = readdirSync(__dirname).filter((f) => f.endsWith(".html")).map((f) => f.replace(/\.html$/, ""));

export default defineConfig({
  base: pagesBase(),
  plugins: [react()],
  build: { rollupOptions: { input: Object.fromEntries(pages.map((p) => [p, resolve(__dirname, `${p}.html`)])) } },
});
