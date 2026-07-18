#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { load } from "cheerio";

const URL = "https://www.nuget.org/profiles/dansiegel";
const response = await fetch(URL, { headers: { "user-agent": "dansiegel.net NuGet profile sync" } });
if (!response.ok) throw new Error(`NuGet profile returned ${response.status}`);
const html = await response.text();
const $ = load(html);
const text = $("body").text().replace(/\s+/g, " ");
const packageCount = Number(text.match(/([\d,]+)\s+Packages/i)?.[1]?.replace(/,/g, ""));
const totalDownloads = Number(text.match(/([\d,]+)\s+Total downloads of packages/i)?.[1]?.replace(/,/g, ""));

const featured = [];
$("ul.list-packages > li.package").each((_, item) => {
  const id = $(item).find("a.package-title").first().text().trim();
  const downloads = Number($(item).text().match(/([\d,]+)\s+total downloads/i)?.[1]?.replace(/,/g, ""));
  if (id && downloads) featured.push({ id, downloads });
});
featured.sort((a, b) => b.downloads - a.downloads);

if (!packageCount || !totalDownloads || featured.length < 4) {
  throw new Error(`Could not parse NuGet profile (packages=${packageCount}, downloads=${totalDownloads}, featured=${featured.length})`);
}

const data = {
  profile: "dansiegel",
  packageCount,
  totalDownloads,
  updatedAt: new Date().toISOString(),
  featured: featured.slice(0, 12),
};
await writeFile(join(process.cwd(), "src", "data", "nuget.json"), `${JSON.stringify(data, null, 2)}\n`);
console.log(`Synced ${packageCount} packages and ${totalDownloads.toLocaleString("en-US")} downloads.`);
