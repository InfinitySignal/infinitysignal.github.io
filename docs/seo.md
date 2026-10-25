# SEO publishing workflow

Run `npm run build` for the complete production pipeline. Running `astro build`
directly skips the final SEO processing and validation.

1. `scripts/prepare-assets.mjs` creates optimized logos and a 1200×630 share image
   in `public/_generated/`. These generated assets are ignored by Git and are
   recreated before development and production builds. Original logos are retained.
2. Astro generates the Chinese and English website pages and copies published HTML.
3. `scripts/finalize-seo.mjs` adds metadata and related-page links to published HTML
   in `dist/`, then writes the sitemap from canonical, indexable output pages.
4. `scripts/check-seo.mjs` validates metadata, local links/assets, language pairs,
   sitemap coverage, and preservation of the published pages' financial content.
   Run it again with `npm run test:seo` after a build.

## Canonical and indexing policy

- Existing website URLs are Chinese; English versions use `/en/`.
- Translated pages use their own canonical URLs and reciprocal language links.
  Language links are emitted only when the corresponding page actually exists.
- Dynamic daily reports, backtests, and the QDII monitor keep their original language.
  Their bodies and source files under `public/products/` are not translated or rewritten.
  Metadata is applied to the build output. Use `npm run preview` to inspect that output;
  raw static files served directly by the development server do not undergo finalization.
- Each dated report has its own canonical URL and can be indexed.
- `/products/us-qdii-limit-monitor/` is the canonical monitor URL. The raw
  `/products/us-qdii-limit-monitor/items/monitor.html` points to that URL and is omitted
  from the sitemap.
- The A-share morning report example uses `noindex, follow` and is excluded from the
  sitemap. Adjust the explicit policy in `src/utils/published-seo.mjs` when changing
  this example into a real product.
- Sitemap entries intentionally omit `lastmod` rather than using rebuild timestamps.
  Add it only when reliable per-page content update metadata is available.
- `public/robots.txt` permits crawling and declares the sitemap index. It does not
  block example pages: crawlers must be able to fetch their `noindex` directive.

## Adding content

- Add Chinese research articles to `src/content/docs/` and English translations to
  `src/content/docs-en/`, using the same filename so their generated IDs match.
- Optional `publishedAt` and `updatedAt` frontmatter fields populate visible dates
  and article schema. Use actual publication/update dates; do not infer them from
  a build or invent historical dates.
- Product descriptions and their translations live in `src/data/products.json`.
  Product landing pages that return raw HTML remain single-language dynamic content.
- New report formats should have an appropriate description and canonical policy
  in `src/utils/published-seo.mjs` before publication. Keep example content out of
  search results with an explicit `noindex` policy.
- Keep all internal links local to the selected language unless linking to a dynamic
  report or external product.

## Release verification

The deployment workflow runs type checking, linting, and the production build with
SEO checks. After deployment, verify the live home pages, redirects, monitor aliases,
`robots.txt`, and sitemap index. Submit the sitemap index in verified search-engine
accounts and monitor indexed pages, search queries, and clicks. Repository checks
cannot confirm ownership or indexing state in Search Console or Baidu.
