import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site } from "../config/site";
import { postPath, sortPosts } from "../lib/posts";

export const GET: APIRoute = async () => {
  const posts = sortPosts(await getCollection("posts", ({ data }) => !data.draft));
  const entries = posts.map((post) => `## ${post.data.title}\nURL: ${site.url}${postPath(post)}\nPublished: ${post.data.publishedAt.toISOString().slice(0, 10)}\nTopics: ${post.data.categories.join(", ")}\nSummary: ${post.data.description}`).join("\n\n");
  return new Response(`# Dan Siegel article index\n\n${entries}\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
};
