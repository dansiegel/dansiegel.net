#!/usr/bin/env node
import { mkdir, readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const ROOT = process.cwd();
const POSTS_DIR = join(ROOT, "src", "content", "posts");
const OUTPUT_DIR = join(ROOT, "public", "og", "generated");
const DEFAULT_OUTPUT = join(ROOT, "public", "og", "default.jpg");
const REGULAR_FONT_PATH = join(ROOT, "scripts", "assets", "Geist-Regular.ttf");
const SEMIBOLD_FONT_PATH = join(ROOT, "scripts", "assets", "Geist-SemiBold.ttf");
const DEFAULT_IMAGE = join(ROOT, "src", "assets", "dan-siegel-hero-cutout.png");

const regularFont = await readFile(REGULAR_FONT_PATH);
const semiboldFont = await readFile(SEMIBOLD_FONT_PATH);
const defaultBackground = await readFile(DEFAULT_IMAGE);
const dataUri = (buffer, type) => `data:${type};base64,${buffer.toString("base64")}`;
const imageDataUri = async (buffer) => dataUri(await sharp(buffer).png().toBuffer(), "image/png");

function field(source, key) {
  const match = source.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  if (!match) return undefined;
  try { return JSON.parse(match[1]); } catch { return match[1].trim(); }
}

function element(type, props, children) {
  return { type, props: { ...props, ...(children !== undefined ? { children } : {}) } };
}

function card({ title, description, categories = [], date, background, portrait = false }) {
  const titleSize = title.length > 70 ? 48 : title.length > 44 ? 58 : 68;
  return element("div", {
    style: { position: "relative", display: "flex", width: "1200px", height: "630px", overflow: "hidden", background: "#dbe4eb", color: "#101820", fontFamily: "Geist" },
  }, [
    element("img", { src: background, width: 1200, height: 630, style: portrait
      ? { position: "absolute", right: "-10px", bottom: "-170px", width: "540px", height: "810px", objectFit: "contain" }
      : { position: "absolute", inset: 0, width: "1200px", height: "630px", objectFit: "cover" } }),
    element("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(219,228,235,.99) 0%, rgba(219,228,235,.96) 58%, rgba(219,228,235,.18) 100%)" } }),
    element("div", { style: { position: "absolute", right: "-55px", top: "-80px", width: "230px", height: "260px", borderRadius: "12px", background: "#2f6f9f", opacity: .82, transform: "rotate(10deg)" } }),
    element("div", { style: { position: "relative", display: "flex", width: portrait ? "760px" : "930px", height: "100%", flexDirection: "column", justifyContent: "space-between", padding: "62px 70px 58px" } }, [
      element("div", { style: { display: "flex", alignItems: "center", gap: "12px", fontSize: "24px", fontWeight: 650, letterSpacing: "-0.02em" } }, [
        element("span", { style: { color: "#4e5b66" } }, "dan"),
        element("span", {}, "siegel"),
        element("span", { style: { color: "#2f6f9f" } }, "."),
      ]),
      element("div", { style: { display: "flex", flexDirection: "column" } }, [
        element("div", { style: { display: "flex", color: "#174865", fontSize: "18px", fontWeight: 650, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "20px" } }, categories.slice(0, 3).join("  /  ") || "Building better apps"),
        element("div", { style: { display: "flex", width: portrait ? "700px" : "800px", maxHeight: "245px", overflow: "hidden", fontSize: `${titleSize}px`, fontWeight: 650, letterSpacing: "-0.055em", lineHeight: .98 } }, title),
        element("div", { style: { display: "flex", maxWidth: "700px", marginTop: "18px", color: "#4e5b66", fontSize: "22px", lineHeight: 1.35 } }, description),
      ]),
      element("div", { style: { display: "flex", color: "#4e5b66", fontSize: "18px" } },
        `dansiegel.net  /  ${date ?? "Open source  /  .NET  /  Architecture"}`),
    ]),
  ]);
}

async function render(input, output) {
  const svg = await satori(card(input), { width: 1200, height: 630, fonts: [{ name: "Geist", data: regularFont, weight: 400, style: "normal" }, { name: "Geist", data: semiboldFont, weight: 600, style: "normal" }] });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  await mkdir(dirname(output), { recursive: true });
  await sharp(png).jpeg({ quality: 90, chromaSubsampling: "4:4:4" }).toFile(output);
}

await mkdir(OUTPUT_DIR, { recursive: true });
const fallback = await imageDataUri(defaultBackground);
await render({
  title: "Software that holds up.",
  description: "Practical notes on .NET, architecture, developer tools, and sustainable open source.",
  background: fallback,
  portrait: true,
}, DEFAULT_OUTPUT);

const files = (await readdir(POSTS_DIR)).filter((name) => /\.mdx?$/.test(name));
for (const [index, name] of files.entries()) {
  const source = await readFile(join(POSTS_DIR, name), "utf8");
  const hero = field(source, "heroImage");
  let background = fallback;
  let portrait = !hero;
  if (hero) {
    try {
      const path = join(ROOT, "public", hero.replace(/^\//, ""));
      background = await imageDataUri(await readFile(path));
    } catch { portrait = true; }
  }
  const published = new Date(field(source, "publishedAt"));
  await render({
    title: field(source, "title"),
    description: field(source, "description"),
    categories: field(source, "categories") ?? [],
    date: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(published),
    background,
    portrait,
  }, join(OUTPUT_DIR, name.replace(/\.mdx?$/, ".jpg")));
  console.log(`[${index + 1}/${files.length}] ${name}`);
}
console.log(`Generated ${files.length + 1} Open Graph images.`);
