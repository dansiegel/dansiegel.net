import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { site } from "../config/site";
import { postPath, sortPosts } from "../lib/posts";

export async function GET(context: APIContext) {
  const posts = sortPosts(await getCollection("posts", ({ data }) => !data.draft));
  return rss({
    title: site.title,
    description: site.description,
    site: context.site ?? site.url,
    customData: `<language>${site.language}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: postPath(post),
      categories: post.data.categories,
      author: site.name,
    })),
  });
}
