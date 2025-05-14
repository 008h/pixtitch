import { defineCollection, z } from "astro:content";

const patterns = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
  }),
});

export const collections = {
  patterns: patterns,
};
