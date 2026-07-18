import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site } from "../config/site";
import { postPath, sortPosts } from "../lib/posts";

export const GET: APIRoute = async () => {
  const posts = sortPosts(await getCollection("posts", ({ data }) => !data.draft));
  return new Response(JSON.stringify({
    version: "https://jsonfeed.org/version/1.1",
    title: site.title,
    home_page_url: site.url,
    feed_url: `${site.url}/feed.json`,
    description: site.description,
    authors: [{ name: site.name, url: `${site.url}/about/`, avatar: `${site.url}${site.authorImage}` }],
    language: site.language,
    items: posts.map((post) => ({
      id: `${site.url}${postPath(post)}`,
      url: `${site.url}${postPath(post)}`,
      title: post.data.title,
      summary: post.data.description,
      content_text: post.body,
      date_published: post.data.publishedAt.toISOString(),
      date_modified: (post.data.updatedAt ?? post.data.publishedAt).toISOString(),
      tags: [...new Set([...post.data.categories, ...post.data.tags])],
    })),
  }), { headers: { "content-type": "application/feed+json; charset=utf-8" } });
};
