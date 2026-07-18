import type { CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

export function postPath(post: Post): string {
  return post.data.legacyUrl;
}

export function sortPosts(posts: Post[]): Post[] {
  return posts.toSorted(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
}

export function readingTime(post: Post): number {
  const words = (post.body ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function ogPath(post: Post): string {
  return `/og/generated/${post.id.replace(/\.mdx?$/, "")}.jpg`;
}
