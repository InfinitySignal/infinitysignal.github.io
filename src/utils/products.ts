import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Locale } from "../i18n";
import productsData from "../data/products.json";

export interface Product {
	slug: string;
	en?: { title: string; description: string };
	title: string;
	description: string;
	logo?: string;
	href?: string;
	landingPage?: string;
	order?: number;
}

export interface ProductHtmlFile {
	fileName: string;
	href: string;
}

const PRODUCT_SLUG_PATTERN = /^[a-z0-9-]+$/;
const DEFAULT_PRODUCT_LOGO = "/_generated/brand.webp";

function assertValidProduct(product: Product): void {
	if (!PRODUCT_SLUG_PATTERN.test(product.slug)) {
		throw new Error(
			`Invalid product slug "${product.slug}". Use lowercase letters, numbers, and hyphens only.`
		);
	}
}

export function getProducts(locale: Locale = "zh-CN"): Product[] {
	const products = (productsData as Product[]).map((product) => ({
		...product,
		...(locale === "en" ? product.en : {}),
	}));
	products.forEach(assertValidProduct);

	return products.sort((a, b) => {
		const orderDiff = (a.order ?? 0) - (b.order ?? 0);
		if (orderDiff !== 0) return orderDiff;
		return a.title.localeCompare(b.title);
	});
}

export function getProductHref(
	product: Product,
	locale: Locale = "zh-CN"
): string {
	return (
		product.href ||
		`${locale === "en" && !product.landingPage ? "/en" : ""}/products/${product.slug}/`
	);
}

export function isExternalProduct(product: Product): boolean {
	return Boolean(product.href);
}

export function getProductLogo(product: Product): string {
	return (
		product.logo?.replace(
			/^\/products\/([^/]+)\/logo\.png$/,
			"/_generated/$1.webp"
		) || DEFAULT_PRODUCT_LOGO
	);
}

export function getProductHtmlFiles(slug: string): ProductHtmlFile[] {
	const productDir = join(process.cwd(), "public", "products", slug, "items");

	if (!existsSync(productDir)) {
		return [];
	}

	return readdirSync(productDir, { withFileTypes: true })
		.filter(
			(entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html")
		)
		.map((entry) => ({
			fileName: entry.name,
			href: `/products/${slug}/items/${encodeURIComponent(entry.name)}`,
		}))
		.sort((a, b) =>
			b.fileName.localeCompare(a.fileName, undefined, { numeric: true })
		);
}
