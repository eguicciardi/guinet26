import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";

export const BLOG_PATH = "src/data/blog";
export const LINK_PATH = "src/data/links";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

const linkDump = defineCollection({
  loader: glob({ pattern: "*.md", base: `./${LINK_PATH}` }),
  // schema: z.object({
  //   title: z.string(),
  //   author: z.string(),
  //   authorWebsite: z.string(),
  //   resourceUrl: z.string(),
  //   pubDatetime: z.date(),
  //   tags: z.array(z.string()).default(["external link"]),
  //   description: z.string(),
  // }),
});

export const collections = { blog, linkDump };
