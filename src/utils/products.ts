import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import productsData from "../data/products.json";

export interface Product {
	slug: string;
	title: string;
	description: string;
	logo?: string;
	order?: number;
}

export interface ProductHtmlFile {
	fileName: string;
	href: string;
}

const PRODUCT_SLUG_PATTERN = /^[a-z0-9-]+$/;
const DEFAULT_PRODUCT_LOGO = "/logo.png";

function assertValidProduct(product: Product): void {
	if (!PRODUCT_SLUG_PATTERN.test(product.slug)) {
		throw new Error(
			`Invalid product slug "${product.slug}". Use lowercase letters, numbers, and hyphens only.`
		);
	}
}

export function getProducts(): Product[] {
	const products = [...(productsData as Product[])];
	products.forEach(assertValidProduct);

	return products.sort((a, b) => {
		const orderDiff = (a.order ?? 0) - (b.order ?? 0);
		if (orderDiff !== 0) return orderDiff;
		return a.title.localeCompare(b.title);
	});
}

export function getProductHref(product: Product): string {
	return `/products/${product.slug}/`;
}

export function getProductLogo(product: Product): string {
	return product.logo || DEFAULT_PRODUCT_LOGO;
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
			a.fileName.localeCompare(b.fileName, undefined, { numeric: true })
		);
}
