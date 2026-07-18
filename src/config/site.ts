export const site = {
  name: "Dan Siegel",
  title: "Dan Siegel | Building Better Apps",
  description:
    "Practical writing about .NET, .NET MAUI, Uno Platform, Prism, developer tooling, open source, and building maintainable software.",
  url: "https://dansiegel.net",
  locale: "en_US",
  language: "en-US",
  email: "dsiegel@avantipoint.com",
  role: ".NET software architect, open-source maintainer, Microsoft MVP, and founder of AvantiPoint",
  location: "San Diego, California",
  company: {
    name: "AvantiPoint",
    url: "https://avantipoint.com",
  },
  mvp: "https://mvp.microsoft.com/en-US/MVP/profile/b28b4c35-ebd3-e711-80fd-3863bb2bca60",
  progressChampion: "https://www.progress.com/champions",
  nuget: "https://www.nuget.org/profiles/dansiegel",
  social: {
    github: "https://github.com/dansiegel",
    sponsors: "https://github.com/sponsors/dansiegel",
    linkedin: "https://www.linkedin.com/in/dansiegel/",
    x: "https://x.com/DanJSiegel",
    youtube: "https://www.youtube.com/dansiegel",
    twitch: "https://twitch.tv/dansiegel",
    stackOverflow: "https://stackoverflow.com/users/5699454/dan-s",
  },
  defaultOgImage: "/og/default.jpg",
  authorImage: "/images/dan-siegel.webp",
} as const;

export type SiteConfig = typeof site;
