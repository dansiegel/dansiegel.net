#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { load } from "cheerio";
import sharp from "sharp";
import TurndownService from "turndown";

const ORIGIN = "https://dansiegel.net";
const CONTENT_DIR = join(process.cwd(), "src", "content", "posts");
const IMAGE_DIR = join(process.cwd(), "public", "images", "blog");
const DOWNLOAD_DIR = join(process.cwd(), "public", "downloads");

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});
turndown.keep(["iframe", "video"]);
turndown.addRule("legacy-pre", {
  filter: "pre",
  replacement(_content, node) {
    const className = node.getAttribute("class") ?? "";
    const language = className.match(/brush:\s*([\w#+-]+)/i)?.[1]?.replace("csharp", "csharp") ?? "text";
    return `\n\n\`\`\`${language}\n${node.textContent.trim()}\n\`\`\`\n\n`;
  },
});

function cleanText(value) {
  return value
    .replace(/[—–]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function json(value) {
  return JSON.stringify(value).replace(/[\u2028\u2029]/g, " ");
}

function decodeCfEmail(value) {
  if (!/^[0-9a-f]+$/i.test(value) || value.length < 4 || value.length % 2 !== 0) return "";
  const key = Number.parseInt(value.slice(0, 2), 16);
  let decoded = "";
  for (let index = 2; index < value.length; index += 2) decoded += String.fromCharCode(Number.parseInt(value.slice(index, index + 2), 16) ^ key);
  return decoded;
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": "dansiegel.net content migration" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

function imageExtension(contentType, url) {
  const fromType = { "image/jpeg": ".jpg", "image/png": ".png", "image/gif": ".gif", "image/webp": ".webp", "image/svg+xml": ".svg" }[contentType.split(";")[0]];
  if (fromType) return fromType;
  try {
    const picture = new URL(url).searchParams.get("picture");
    return extname(picture ?? new URL(url).pathname) || ".jpg";
  } catch {
    return ".jpg";
  }
}

async function localizeImage(src, slug, index) {
  let buffer;
  let contentType = "image/png";
  let sourceUrl = src;
  if (src.startsWith("data:")) {
    const match = src.match(/^data:([^;,]+)?(?:;base64)?,(.*)$/s);
    if (!match) return undefined;
    contentType = match[1] || contentType;
    buffer = Buffer.from(match[2], src.includes(";base64,") ? "base64" : "utf8");
    sourceUrl = `inline-${createHash("sha1").update(buffer).digest("hex").slice(0, 10)}`;
  } else {
    const url = new URL(src, ORIGIN).href;
    const response = await fetch(url, { headers: { "user-agent": "dansiegel.net content migration" } });
    if (!response.ok) {
      console.warn(`  image ${response.status}: ${url}`);
      return undefined;
    }
    contentType = response.headers.get("content-type") ?? contentType;
    buffer = Buffer.from(await response.arrayBuffer());
    sourceUrl = url;
  }

  const stem = basename(new URL(sourceUrl, ORIGIN).pathname || `image-${index}`, extname(new URL(sourceUrl, ORIGIN).pathname))
    .replace(/[^a-z0-9-]+/gi, "-")
    .replace(/^-|-$/g, "") || `image-${index}`;
  const originalExt = imageExtension(contentType, sourceUrl);
  const folder = join(IMAGE_DIR, slug);
  await mkdir(folder, { recursive: true });

  if ([".gif", ".svg"].includes(originalExt.toLowerCase())) {
    const name = `${String(index + 1).padStart(2, "0")}-${stem}${originalExt}`;
    await writeFile(join(folder, name), buffer);
    return `/images/blog/${slug}/${name}`;
  }

  try {
    const name = `${String(index + 1).padStart(2, "0")}-${stem}.webp`;
    await sharp(buffer).rotate().resize({ width: 1800, height: 1400, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toFile(join(folder, name));
    return `/images/blog/${slug}/${name}`;
  } catch (error) {
    console.warn(`  could not optimize image: ${sourceUrl} (${error.message})`);
    const name = `${String(index + 1).padStart(2, "0")}-image${originalExt}`;
    await writeFile(join(folder, name), buffer);
    return `/images/blog/${slug}/${name}`;
  }
}

async function localizeDownload(url) {
  const source = new URL(url, ORIGIN);
  const requested = source.searchParams.get("file");
  const name = basename(requested ?? source.pathname).replace(/[^a-z0-9._-]+/gi, "-");
  if (!name) return undefined;
  const response = await fetch(source, { headers: { "user-agent": "dansiegel.net content migration" } });
  if (!response.ok) return undefined;
  await mkdir(DOWNLOAD_DIR, { recursive: true });
  await writeFile(join(DOWNLOAD_DIR, name), Buffer.from(await response.arrayBuffer()));
  return `/downloads/${name}`;
}

async function migratePost(path, index, total) {
  const html = await fetchText(new URL(path, ORIGIN));
  const $ = load(html);
  const article = $("article.post").last();
  const body = article.find(".post-body").first();
  const title = cleanText(article.find(".post-title").first().text() || $("h1, h2.post-title").first().text());
  if (!title || !body.length) throw new Error(`Could not extract ${path}`);

  body.find("script, style, .post-footer, .rating, .related-posts, form").remove();
  body.find("[data-cfemail]").each((_, node) => {
    const decoded = decodeCfEmail($(node).attr("data-cfemail") ?? "");
    if (decoded) $(node).replaceWith(decoded);
  });
  body.find("h1, h2, h3, h4").each((_, heading) => {
    const headingText = cleanText($(heading).text());
    if (!headingText || (heading.tagName === "h1" && headingText === title)) $(heading).remove();
  });
  for (const link of body.find("a").toArray()) {
    const href = $(link).attr("href");
    if (!href) continue;
    try {
      const url = new URL(href, ORIGIN);
      const localized = url.origin === ORIGIN && url.pathname === "/file.axd" ? await localizeDownload(url) : undefined;
      $(link).attr("href", localized ?? (url.origin === ORIGIN ? `${url.pathname}${url.search}${url.hash}` : url.href));
      if (url.origin !== ORIGIN) $(link).attr("rel", "noopener noreferrer");
      $(link).removeAttr("target");
    } catch {}
  }

  const slug = path.split("/").filter(Boolean).at(-1);
  const images = body.find("img").toArray();
  let heroImage;
  for (let imageIndex = 0; imageIndex < images.length; imageIndex += 1) {
    const element = images[imageIndex];
    const src = $(element).attr("src");
    if (!src) continue;
    const local = await localizeImage(src, slug, imageIndex);
    if (!local) continue;
    heroImage ??= local;
    $(element)
      .attr("src", local)
      .attr("alt", cleanText($(element).attr("alt") || title))
      .attr("loading", "lazy")
      .removeAttr("style class srcset sizes width height");
  }

  const structured = article.find('script[type="application/ld+json"]').first().text();
  let schema = {};
  try { schema = JSON.parse(structured); } catch {}
  const publishedAt = new Date(schema.datePublished || article.find("time").attr("datetime") || article.find(".post-date").text());
  const modifiedAt = new Date(schema.dateModified || publishedAt);
  const categories = article.find(".post-category a").toArray().map((node) => cleanText($(node).text())).filter(Boolean);
  const tags = article.find(".post-tags a").toArray().map((node) => cleanText($(node).text())).filter(Boolean);
  const plain = cleanText(body.clone().find("pre").remove().end().text());
  const description = plain.length > 165 ? `${plain.slice(0, 162).replace(/\s+\S*$/, "")}...` : plain;
  let markdown = turndown.turndown(body.html() ?? "");
  markdown = markdown.replace(/[—–]/g, "-").replace(/\u00a0/g, " ").replace(/\n{4,}/g, "\n\n\n").trim();

  const fileName = `${path.split("/").slice(2, 5).join("-")}-${slug}.md`;
  const frontmatter = [
    "---",
    `title: ${json(title)}`,
    `description: ${json(description)}`,
    `publishedAt: ${json(publishedAt.toISOString())}`,
    `updatedAt: ${json(modifiedAt.toISOString())}`,
    `categories: ${json(categories)}`,
    `tags: ${json(tags)}`,
    `legacyUrl: ${json(path)}`,
    ...(heroImage ? [`heroImage: ${json(heroImage)}`] : []),
    "draft: false",
    "---",
    "",
  ].join("\n");
  await writeFile(join(CONTENT_DIR, fileName), `${frontmatter}${markdown}\n`, "utf8");
  console.log(`[${String(index + 1).padStart(2, "0")}/${total}] ${fileName} (${images.length} images)`);
}

async function syncAuthorImage() {
  const about = load(await fetchText(`${ORIGIN}/page/about-me`));
  const candidates = about("img").toArray().map((img) => about(img).attr("src")).filter((src) => src?.includes("/Dan/"));
  const selected = candidates.find((src) => src.includes("DSC_5240")) ?? candidates[0] ?? "/image.axd?picture=/avatars/dansiegel.png";
  const response = await fetch(new URL(selected, ORIGIN));
  if (!response.ok) throw new Error(`Could not download author image: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await mkdir(join(process.cwd(), "public", "images"), { recursive: true });
  await sharp(buffer).rotate().resize({ width: 1000, height: 1250, fit: "cover", position: "attention" }).webp({ quality: 86 }).toFile(join(process.cwd(), "public", "images", "dan-siegel.webp"));
}

async function main() {
  const archive = load(await fetchText(`${ORIGIN}/archive`));
  const paths = [...new Set(archive('a[href^="/post/"]').toArray().map((a) => archive(a).attr("href")?.replace(/\/$/, "")).filter(Boolean))].sort();
  if (paths.length < 30) throw new Error(`Expected at least 30 posts, found ${paths.length}`);
  await rm(CONTENT_DIR, { recursive: true, force: true });
  await rm(IMAGE_DIR, { recursive: true, force: true });
  await mkdir(CONTENT_DIR, { recursive: true });
  for (let index = 0; index < paths.length; index += 1) await migratePost(paths[index], index, paths.length);
  await syncAuthorImage();
  console.log(`Migrated ${paths.length} posts and the author image.`);
}

if (process.argv.includes("--author-only")) {
  await syncAuthorImage();
  console.log("Synced the author image.");
} else {
  await main();
}
