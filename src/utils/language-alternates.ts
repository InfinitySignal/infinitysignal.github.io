import { getCollection } from "astro:content";
import { localizedPath, type Locale } from "../i18n";
import { getProducts } from "./products";

export async function getLanguageAlternates(url: URL) {
	const basePath = decodeURI(localizedPath(url.pathname, "zh-CN"));
	const [zhDocs, enDocs] = await Promise.all([
		getCollection("docs"),
		getCollection("docsEn"),
	]);
	const common = [
		"/",
		"/contact/",
		"/products/",
		"/docs/",
		...getProducts()
			.filter((product) => !product.href && !product.landingPage)
			.map((product) => `/products/${product.slug}/`),
	];
	const pathsFor = (docs: typeof zhDocs | typeof enDocs) => {
		const paths = new Set(common);
		for (const doc of docs) {
			paths.add(`/docs/${doc.id}/`);
			if (doc.id.includes("/")) paths.add(`/docs/${doc.id.split("/")[0]}/`);
		}
		return paths;
	};
	const paths = { "zh-CN": pathsFor(zhDocs), en: pathsFor(enDocs) };
	return (["zh-CN", "en"] as Locale[])
		.filter((locale) => paths[locale].has(basePath))
		.map((locale) => ({ locale, path: localizedPath(basePath, locale) }));
}
