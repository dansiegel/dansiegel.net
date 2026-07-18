#!/usr/bin/env node
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const rootCandidates = [join(process.cwd(), "dist", "client"), join(process.cwd(), "dist")];
let root;
for (const candidate of rootCandidates) {
  try { await access(join(candidate, "sitemap-0.xml")); root = candidate; break; } catch {}
}
if (!root) {
  console.warn("[sitemap-lastmod] sitemap-0.xml not found; skipping.");
  process.exit(0);
}

const path = join(root, "sitemap-0.xml");
let xml = await readFile(path, "utf8");
const matches = [...xml.matchAll(/<loc>(https:\/\/dansiegel\.net([^<]+))<\/loc>/g)];
for (const match of matches) {
  const pathname = match[2];
  const htmlPath = join(root, pathname.replace(/^\//, ""), "index.html");
  try {
    const html = await readFile(htmlPath, "utf8");
    const modified = html.match(/<meta property="article:modified_time" content="([^"]+)"/)?.[1];
    if (modified) xml = xml.replace(match[0], `${match[0]}<lastmod>${modified.slice(0, 10)}</lastmod>`);
  } catch {}
}
await writeFile(path, xml);
console.log("[sitemap-lastmod] article modification dates injected.");
