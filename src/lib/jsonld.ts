import { site } from "../config/site";

export type JsonLd = Record<string, unknown>;

export function person(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${site.url}/#person`,
    name: site.name,
    url: site.url,
    image: `${site.url}${site.authorImage}`,
    jobTitle: ".NET MAUI and Uno Platform software architect",
    description: site.description,
    knowsAbout: [
      ".NET",
      ".NET MAUI",
      "Uno Platform",
      "Prism",
      "Cross-platform application architecture",
      "Azure",
      "Developer tooling",
      "Open-source software",
    ],
    worksFor: {
      "@type": "Organization",
      name: site.company.name,
      url: site.company.url,
    },
    award: ["Microsoft Most Valuable Professional", "Progress Champion"],
    sameAs: [site.mvp, site.progressChampion, site.nuget, ...Object.values(site.social)],
  };
}

export function website(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.title,
    description: site.description,
    inLanguage: site.language,
    publisher: { "@id": `${site.url}/#person` },
  };
}

export function article(input: {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: Date;
  updatedAt?: Date;
  categories: string[];
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${input.url}#article`,
    mainEntityOfPage: input.url,
    headline: input.title,
    description: input.description,
    image: input.image,
    datePublished: input.publishedAt.toISOString(),
    dateModified: (input.updatedAt ?? input.publishedAt).toISOString(),
    articleSection: input.categories,
    inLanguage: site.language,
    author: { "@id": `${site.url}/#person` },
    publisher: { "@id": `${site.url}/#person` },
    isPartOf: { "@id": `${site.url}/#website` },
  };
}

export function breadcrumbs(items: { name: string; url: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
