#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { load } from "cheerio";

const candidates = [join(process.cwd(), "dist", "client"), join(process.cwd(), "dist")];
const ROOT = candidates.find((candidate) => existsSync(join(candidate, "index.html")));
if (!ROOT) throw new Error("Built HTML was not found.");

const files = [];
const all = new Set();
const walk = (dir) => readdirSync(dir).forEach((name) => {
  const full = join(dir, name);
  if (statSync(full).isDirectory()) walk(full);
  else {
    const rel = `/${relative(ROOT, full).split(/\\/g).join("/")}`;
    all.add(rel);
    if (rel.endsWith(".html")) files.push(full);
  }
});
walk(ROOT);

const redirectsPath = join(process.cwd(), "public", "_redirects");
const redirects = existsSync(redirectsPath)
  ? new Set(readFileSync(redirectsPath, "utf8").split(/\r?\n/).map((line) => line.trim().split(/\s+/)[0]).filter((route) => route?.startsWith("/")))
  : new Set();
const errors = [];
const warnings = [];
const titles = new Map();
const descriptions = new Map();
const routeOf = (file) => `/${relative(ROOT, file).split(/\\/g).join("/")}`.replace(/index\.html$/, "");
const exists = (url) => {
  const path = decodeURI(url.split(/[?#]/)[0]).replace(/\/$/, "");
  if (!path || path === "/") return all.has("/index.html");
  return all.has(`${path}/index.html`) || all.has(`${path}.html`) || all.has(path) || redirects.has(path) || redirects.has(`${path}/`);
};

for (const file of files) {
  const route = routeOf(file);
  const $ = load(readFileSync(file, "utf8"));
  const title = $("title").first().text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim();
  const noindex = /noindex/i.test($('meta[name="robots"]').attr("content") ?? "");
  if (!title) errors.push(`${route}: missing title`);
  if (!description) errors.push(`${route}: missing description`);
  if ($("h1").length !== 1) errors.push(`${route}: expected one h1, found ${$("h1").length}`);
  if (!$('link[rel="canonical"]').attr("href")) errors.push(`${route}: missing canonical`);
  if (!$('meta[property="og:image"]').attr("content")) errors.push(`${route}: missing Open Graph image`);
  if ($('script[type="application/ld+json"]').length === 0) errors.push(`${route}: missing JSON-LD`);
  $('script[type="application/ld+json"]').each((index, script) => { try { JSON.parse($(script).text()); } catch (error) { errors.push(`${route}: invalid JSON-LD block ${index + 1}`); } });
  if (!noindex) {
    if (title.length > 65) warnings.push(`${route}: title is ${title.length} characters`);
    if (description && (description.length < 50 || description.length > 170)) warnings.push(`${route}: description is ${description.length} characters`);
    if (titles.has(title)) errors.push(`${route}: duplicate title also used on ${titles.get(title)}`); else titles.set(title, route);
    if (descriptions.has(description)) warnings.push(`${route}: duplicate description also used on ${descriptions.get(description)}`); else descriptions.set(description, route);
  }
  $("a[href]").each((_, anchor) => {
    const href = $(anchor).attr("href") ?? "";
    if (!href || /^(https?:|mailto:|tel:|#)/.test(href) || href.startsWith("/api/")) return;
    if (href.startsWith("/") && !exists(href)) errors.push(`${route}: broken internal link ${href}`);
  });
}

console.log(`[seo-check] scanned ${files.length} HTML pages.`);
warnings.slice(0, 30).forEach((warning) => console.warn(`WARN ${warning}`));
if (errors.length) {
  errors.forEach((error) => console.error(`ERROR ${error}`));
  process.exit(1);
}
console.log(`[seo-check] passed with ${warnings.length} advisory warning(s).`);
