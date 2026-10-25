import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

await mkdir("public/_generated", { recursive: true });
await sharp("public/logo.png")
	.resize(256, 256)
	.webp({ quality: 85 })
	.toFile("public/_generated/brand.webp");
const products = JSON.parse(await readFile("src/data/products.json", "utf8"));
for (const product of products) {
	if (!/^\/products\/[^/]+\/logo\.png$/.test(product.logo || "")) continue;
	await sharp(`public${product.logo}`)
		.resize(128, 128)
		.webp({ quality: 85 })
		.toFile(`public/_generated/${product.slug}.webp`);
}
// A code-rendered brand card, using the existing logo and approved brand positioning.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<rect width="1200" height="630" fill="#f8fafc"/>
<rect y="610" width="1200" height="20" fill="#0284c7"/>
<g font-family="Arial, sans-serif" fill="#111827">
<text x="80" y="330" font-size="78" font-weight="700">InfinitySignal</text>
<text x="80" y="405" font-size="36">AI · Data Insights · Fintech</text>
<text x="80" y="510" font-size="26" fill="#475569">Transforming Chaos into Clear Signal</text>
<text x="80" y="565" font-size="24" fill="#64748b">infinitysignal.cn</text></g></svg>`;
const logo = await sharp("public/logo.png").resize(136, 136).png().toBuffer();
await writeFile(
	"public/_generated/og-brand.png",
	await sharp(Buffer.from(svg))
		.composite([{ input: logo, left: 80, top: 75 }])
		.png()
		.toBuffer()
);
console.log("Prepared optimized brand/product logos and 1200×630 share image.");
