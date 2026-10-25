import assert from "node:assert/strict";
import { readdir, readFile, access } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/config/site.mjs";
import { attr, findAll, parse, textContent } from "../src/utils/html.mjs";
import {
	MONITOR_FILE,
	MONITOR_PATH,
	SAMPLE_PATH,
	enhancePublishedHtml,
} from "../src/utils/published-seo.mjs";

async function collect(dir) {
	const files = [];
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) files.push(...(await collect(path)));
		else if (entry.name.endsWith(".html")) files.push(path);
	}
	return files;
}
const pages = new Map();
const fileForUrl = (url) => {
	const pathname = decodeURI(new URL(url, SITE.url).pathname);
	return join(
		"dist",
		pathname.endsWith("/") ? `${pathname}index.html` : pathname
	);
};
const one = (nodes, message) => {
	assert.equal(nodes.length, 1, message);
	return nodes[0];
};
const links = (doc, rel) =>
	findAll(doc, (node) => node.tagName === "link" && attr(node, "rel") === rel);
const metas = (doc, name) =>
	findAll(
		doc,
		(node) =>
			node.tagName === "meta" &&
			(attr(node, "name") === name || attr(node, "property") === name)
	);
for (const file of await collect("dist")) {
	const html = await readFile(file, "utf8");
	const doc = parse(html);
	const route = `/${file.slice(5).replace(/index\.html$/, "")}`;
	const canonical = attr(
		one(links(doc, "canonical"), `${route}: one canonical`),
		"href"
	);
	const title = textContent(
		one(
			findAll(doc, (node) => node.tagName === "title"),
			`${route}: one title`
		)
	);
	assert(title.trim(), `${route}: nonempty title`);
	assert(
		attr(
			one(metas(doc, "description"), `${route}: one description`),
			"content"
		)?.trim(),
		`${route}: nonempty description`
	);
	assert.equal(
		findAll(doc, (node) => node.tagName === "h1").length,
		1,
		`${route}: one H1`
	);
	assert.equal(
		attr(
			one(
				findAll(doc, (node) => node.tagName === "html"),
				`${route}: html`
			),
			"lang"
		),
		route.startsWith("/en/") ? "en" : "zh-CN"
	);
	assert.equal(
		canonical,
		new URL(route === MONITOR_FILE ? MONITOR_PATH : route, SITE.url).href,
		`${route}: canonical target`
	);
	await access(fileForUrl(canonical));
	const description = attr(metas(doc, "description")[0], "content");
	assert.equal(
		attr(one(metas(doc, "og:description"), route), "content"),
		description
	);
	assert.equal(
		attr(one(metas(doc, "twitter:description"), route), "content"),
		description
	);
	assert.equal(attr(one(metas(doc, "og:title"), route), "content"), title);
	for (const schema of findAll(
		doc,
		(node) =>
			node.tagName === "script" && attr(node, "type") === "application/ld+json"
	)) {
		JSON.parse(textContent(schema));
	}
	const noindex = attr(
		one(metas(doc, "robots"), `${route}: robots`),
		"content"
	).includes("noindex");
	assert.equal(noindex, route === SAMPLE_PATH, `${route}: indexing policy`);
	assert(
		noindex ||
			findAll(
				doc,
				(node) =>
					node.tagName === "script" &&
					attr(node, "type") === "application/ld+json"
			).length > 0,
		`${route}: structured data`
	);
	for (const node of findAll(doc, (node) =>
		["a", "img", "link", "script"].includes(node.tagName)
	)) {
		const href = attr(node, "href") || attr(node, "src");
		if (!href || href.startsWith("#")) continue;
		const url = new URL(href, new URL(route, SITE.url));
		if (url.origin !== SITE.url || !["http:", "https:"].includes(url.protocol))
			continue;
		// GitHub Pages redirects extensionless folder URLs to their trailing-slash counterpart.
		try {
			await access(fileForUrl(url));
		} catch {
			await access(fileForUrl(`${url.href.replace(/\/$/, "")}/`));
		}
	}
	for (const img of findAll(doc, (node) => node.tagName === "img")) {
		assert(
			attr(img, "width") && attr(img, "height"),
			`${route}: explicit image dimensions`
		);
	}
	pages.set(new URL(route, SITE.url).href, { route, doc, canonical, noindex });
}

let localized = 0;
for (const [url, page] of pages) {
	const alternates = links(page.doc, "alternate");
	const isPublished =
		page.route.includes("/items/") || page.route === MONITOR_PATH;
	if (isPublished) {
		assert.equal(alternates.length, 0);
		continue;
	}
	localized++;
	const locales = alternates.filter(
		(node) => attr(node, "hreflang") !== "x-default"
	);
	assert(
		locales.some((node) => attr(node, "href") === url),
		`${url}: self language reference`
	);
	for (const alternate of locales) {
		const other = pages.get(attr(alternate, "href"));
		assert(other, `${url}: language counterpart exists`);
		assert(
			links(other.doc, "alternate").some((node) => attr(node, "href") === url),
			`${url}: reciprocal hreflang`
		);
	}
}
const sitemap = await readFile("dist/sitemap-0.xml", "utf8");
assert(!sitemap.includes("<lastmod>"), "No build-time lastmod");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
	(match) => match[1]
);
const expected = [...pages.entries()]
	.filter(([url, page]) => !page.noindex && page.canonical === url)
	.map(([url]) => url)
	.sort();
assert.equal(
	new Set(sitemapUrls).size,
	sitemapUrls.length,
	"No duplicate sitemap URLs"
);
assert.deepEqual(
	sitemapUrls.sort(),
	expected,
	"Sitemap covers precisely canonical, indexable pages"
);
assert(
	(await readFile("dist/robots.txt", "utf8")).includes(
		`${SITE.url}/sitemap-index.xml`
	)
);

let published = 0;
for (const file of await collect("public/products")) {
	const source = await readFile(file, "utf8");
	const route = `/${file.slice("public/".length)}`;
	const enhanced = await readFile(`dist${route}`, "utf8");
	const original = parse(source);
	const output = parse(enhanced);
	for (const nav of findAll(
		output,
		(node) =>
			attr(node, "data-seo-generated") === "true" && node.tagName === "nav"
	)) {
		nav.parentNode.childNodes = nav.parentNode.childNodes.filter(
			(node) => node !== nav
		);
	}
	const bodyText = (doc) =>
		textContent(findAll(doc, (node) => node.tagName === "body")[0])
			.replace(/\s+/g, " ")
			.trim();
	assert.equal(
		bodyText(output),
		bodyText(original),
		`${route}: financial content unchanged`
	);
	assert.equal(
		enhancePublishedHtml(enhanced, route),
		enhanced,
		`${route}: enrichment is idempotent`
	);
	published++;
}
console.log(
	`SEO checks passed: ${pages.size} HTML pages, ${localized} localized pages, ${sitemapUrls.length} canonical sitemap URLs; ${published} published pages preserve their body content.`
);
