import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site } from "../config/site";
import { postPath, sortPosts } from "../lib/posts";

export const GET: APIRoute = async () => {
  const posts = sortPosts(await getCollection("posts", ({ data }) => !data.draft));
  const recent = posts.slice(0, 12).map((post) => `- [${post.data.title}](${site.url}${postPath(post)}): ${post.data.description}`).join("\n");
  const body = `# ${site.name}\n\n> ${site.description}\n\nDan Siegel is a .NET software architect, open-source maintainer, Microsoft MVP, Progress Champion, and founder of AvantiPoint. His current work focuses on .NET MAUI, Uno Platform, Prism, application architecture, DevOps, and developer tooling. He spent two years with the Uno Platform team and is the original author of the Uno templates, Uno.Sdk and Uno Single Project, C# Markup for Uno Platform, and the .NET MAUI bindings for Uno Platform.\n\n## Primary pages\n- [Home](${site.url}/)\n- [Articles](${site.url}/articles/)\n- [About](${site.url}/about/)\n- [Open source](${site.url}/open-source/)\n- [Developer team retreats in Roatán](${site.url}/team-retreats/)\n- [Microsoft MVP profile](${site.mvp})\n- [Progress Champions roster](${site.progressChampion})\n- [NuGet profile](${site.nuget})\n\n## Recent articles\n${recent}\n\n## Full index\n- [Complete machine-readable article index](${site.url}/llms-full.txt)\n- [RSS feed](${site.url}/rss.xml)\n- [JSON Feed](${site.url}/feed.json)\n\nContent may be quoted with attribution and a canonical link to the original article.\n`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
};
