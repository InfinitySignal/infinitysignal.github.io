import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const docs = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/docs" }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		order: z.number().default(0),
		publishedAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
	}),
});

const docsEn = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/docs-en" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		order: z.number().default(0),
		publishedAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
	}),
});
export const collections = { docs, docsEn };
