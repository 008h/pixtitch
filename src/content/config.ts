import { defineCollection, z } from "astro:content";

const patterns = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    x: z.number(),
    y: z.number(),
  }),
});

export const collections = {
  patterns: patterns,
};
