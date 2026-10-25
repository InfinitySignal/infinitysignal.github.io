import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/config/site.mjs";
import {
	enhancePublishedHtml,
	MONITOR_FILE,
	MONITOR_PATH,
} from "../src/utils/published-seo.mjs";
import { attr, findAll, parse } from "../src/utils/html.mjs";

export async function htmlFiles(dir) {
	const files = [];
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) files.push(...(await htmlFiles(path)));
		else if (entry.name.endsWith(".html")) files.push(path);
	}
	return files;
}

const files = await htmlFiles("dist");
const canonicalUrls = new Set();
let enriched = 0;
for (const file of files) {
	const pathname = `/${file.slice("dist/".length).replace(/index\.html$/, "")}`;
	let html = await readFile(file, "utf8");
	if (pathname.includes("/items/") || pathname === MONITOR_PATH) {
		html = enhancePublishedHtml(html, pathname);
		await writeFile(file, html);
		enriched++;
	}
	const page = parse(html);
	const robots = findAll(
		page,
		(node) => node.tagName === "meta" && attr(node, "name") === "robots"
	)[0];
	if (attr(robots || {}, "content")?.includes("noindex")) continue;
	const canonical = findAll(
		page,
		(node) => node.tagName === "link" && attr(node, "rel") === "canonical"
	)[0];
	if (!canonical) throw new Error(`Missing canonical: ${file}`);
	const url = attr(canonical, "href");
	if (url !== new URL(pathname, SITE.url).href) {
		if (pathname !== MONITOR_FILE)
			throw new Error(`Unexpected canonical alias: ${file}`);
		continue;
	}
	canonicalUrls.add(url);
}
const escapeXml = (value) =>
	value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
// No fabricated lastmod: add it only when reliable per-page update metadata exists.
await writeFile(
	"dist/sitemap-0.xml",
	`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
		...canonicalUrls,
	]
		.sort()
		.map((url) => `<url><loc>${escapeXml(url)}</loc></url>`)
		.join("\n")}\n</urlset>\n`
);
await writeFile(
	"dist/sitemap-index.xml",
	`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${SITE.url}/sitemap-0.xml</loc></sitemap></sitemapindex>\n`
);
console.log(
	`SEO: enriched ${enriched} published pages; ${canonicalUrls.size} canonical URLs in sitemap.`
);
