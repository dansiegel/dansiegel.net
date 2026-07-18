# Dan Siegel's blog

A content-first personal site built with Astro, Tailwind CSS, and Cloudflare Pages. It preserves the public URLs of the previous BlogEngine.NET site while replacing the presentation, content pipeline, structured data, feeds, and contact workflow.

## Local development

Requirements: Node.js 24 or newer and npm.

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env` when testing integrations locally. The contact form deliberately reports that delivery is not configured unless a Resend key is present.

Run the complete production check before publishing:

```sh
npm run quality
```

This validates Astro and TypeScript, generates a unique 1200 x 630 social card for every article, builds the static site, adds accurate sitemap modification dates, and checks the rendered HTML for SEO and internal-link problems.

## Content workflows

Posts live in `src/content/posts` as validated Markdown content collections. Their `legacyUrl` values keep the original `/post/YYYY/MM/DD/slug` routes canonical.

```sh
npm run content:sync   # Re-import all public posts, images, and author photo
npm run content:author # Refresh only the author photo
npm run nuget:sync     # Refresh package and download totals from nuget.org
npm run og:build       # Rebuild social sharing images
```

The import scripts are maintenance tools, not required during a normal Cloudflare build. Review any refreshed Markdown before committing because the source site is third-party input at build time.

## Search, answer engines, and sharing

- Per-page canonical, Open Graph, Twitter Card, description, and robots metadata
- `Person`, `WebSite`, `BlogPosting`, and `BreadcrumbList` JSON-LD
- XML RSS and JSON Feed endpoints
- `llms.txt` and `llms-full.txt` discovery files with clean article summaries
- Sitemap entries whose `lastmod` values come from content metadata
- Deterministic article-specific Open Graph images
- Semantic article markup, visible publication dates, categories, reading time, and descriptive internal links

## Cloudflare Pages deployment

GitHub Actions validates every pull request. Pushes to `main` run the same quality suite and deploy `dist` plus the Pages Functions in `functions` to the `dansiegel-net` Cloudflare Pages project. The repository needs these GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`: a token with `Account > Cloudflare Pages > Edit`
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account that owns `dansiegel.net`

The committed `wrangler.jsonc`, `_headers`, and `_redirects` files are the source of truth for the Pages build target, function variables, security headers, cache policy, and legacy redirects.

The contact form additionally needs these build variables:

| Variable | Value |
| --- | --- |
| `PUBLIC_SITE_URL` | `https://dansiegel.net` |
| `PUBLIC_SITE_ENV` | `production` |
| `PUBLIC_TURNSTILE_SITE_KEY` | The Turnstile widget site key |
| `CONTACT_FROM_EMAIL` | A sender on a Resend-verified domain |
| `CONTACT_TO_EMAIL` | `dsiegel@avantipoint.com` |

Add these as encrypted secrets:

- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`

Create a Turnstile widget restricted to `dansiegel.net` and `www.dansiegel.net`. In Resend, verify `dansiegel.net` or another sending domain and make `CONTACT_FROM_EMAIL` match that verified domain.

For stronger rate limiting, create a Workers KV namespace and bind it to the Pages project as `CONTACT_RATE_LIMIT`. The form already limits a source IP to five accepted attempts per hour whenever this binding exists.

The form's defense in depth includes strict origin checks, Cloudflare Turnstile, a honeypot, a minimum completion time, bounded and validated fields, optional KV rate limiting, escaped email output, and no automatic reply that could be abused for email bombing.

## Project map

- `src/content/posts`: migrated articles
- `src/components/SEO.astro`: metadata and structured-data output
- `src/pages`: static routes, feeds, robots, and LLM discovery endpoints
- `functions/api/contact.ts`: Cloudflare Pages contact endpoint
- `scripts`: migration, NuGet sync, social-card generation, and quality checks
- `public/images/blog`: locally hosted, optimized legacy article images
