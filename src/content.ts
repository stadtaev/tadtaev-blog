import { glob, readFile } from "node:fs/promises";
import { basename } from "node:path";
import matter from "@11ty/gray-matter";
import { z } from "zod";
import { site } from "./config.ts";

const text = z
  .string({ error: "must be a non-empty string" })
  .refine((value) => value.trim() !== "", "must be a non-empty string");
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "filename must use lowercase letters, numbers and hyphens");
const common = {
  slug,
  title: text,
  description: text,
  draft: z.boolean({ error: "must be true or false" }).default(false),
};

const postSchema = z.object({ ...common, date: z.iso.date({ error: "must be a real YYYY-MM-DD date" }) });

/** Page slugs that would collide with generated output. */
const reservedPageSlugs = ["posts", "editor", "vendor", "index", "404", "feed", "sitemap", "robots"];

const pageSchema = z.object({
  ...common,
  slug: slug.refine((value) => !reservedPageSlugs.includes(value), "is reserved; rename the file"),
  /** Large heading on the page; the title is used when omitted. */
  heading: text.optional(),
  /** Small uppercase label above the heading. */
  eyebrow: text.optional(),
  /** Position in the main navigation, lowest first. Pages without it are not linked from the nav. */
  nav: z.number({ error: "must be a number" }).optional(),
});

/** `body` is the Markdown without front matter. */
export type Post = z.infer<typeof postSchema> & { body: string; minutes: number };
/** A standalone page from content/pages/<slug>.md, served at /<slug>/. */
export type Page = z.infer<typeof pageSchema> & { body: string };

type FrontMatter = { file: string; data: Record<string, unknown>; body: string };

export class ContentError extends Error {
  constructor(file: string, message: string) {
    super(`${file}: ${message}`);
    this.name = "ContentError";
  }
}

function readFrontMatter(file: string, source: string): FrontMatter {
  try {
    const { data, content } = matter(source);
    return { file, data, body: content };
  } catch (error) {
    throw new ContentError(file, `invalid front matter: ${(error as Error).message}`);
  }
}

function validate<T extends z.ZodType>(schema: T, { file, data }: FrontMatter): z.output<T> {
  // The filename is the slug; it wins over any `slug` key in the front matter.
  const result = schema.safeParse({ ...data, slug: basename(file, ".md") });
  if (result.success) return result.data;
  throw new ContentError(
    file,
    result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "),
  );
}

export function readingMinutes(markdown: string): number {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / site.readingSpeed));
}

function toPost(entry: FrontMatter): Post {
  return { ...validate(postSchema, entry), body: entry.body, minutes: readingMinutes(entry.body) };
}

function toPage(entry: FrontMatter): Page {
  return { ...validate(pageSchema, entry), body: entry.body };
}

export const parsePost = (file: string, source: string): Post => toPost(readFrontMatter(file, source));
export const parsePage = (file: string, source: string): Page => toPage(readFrontMatter(file, source));

/**
 * Parses every Markdown file in `dir` except README.md.
 * Drafts are skipped before validation, so an unfinished draft never breaks a production build.
 * With `includeDrafts`, an invalid draft is skipped with a warning; invalid published content always throws.
 */
async function loadDir<T>(dir: string, convert: (entry: FrontMatter) => T, includeDrafts: boolean): Promise<T[]> {
  const files = (await Array.fromAsync(glob(`${dir}/*.md`))).filter((path) => basename(path) !== "README.md");
  const entries = await Promise.all(
    files.map(async (path) => readFrontMatter(basename(path), await readFile(path, "utf8"))),
  );
  return entries.flatMap((entry) => {
    const isDraft = entry.data.draft === true;
    if (isDraft && !includeDrafts) return [];
    try {
      return [convert(entry)];
    } catch (error) {
      if (!isDraft) throw error;
      console.warn(`Skipping invalid draft: ${(error as Error).message}`);
      return [];
    }
  });
}

/** Loads posts newest first. */
export async function loadPosts(dir: string, { includeDrafts = false } = {}): Promise<Post[]> {
  const posts = await loadDir(dir, toPost, includeDrafts);
  return posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

/** Loads pages ordered by nav position, then slug. */
export async function loadPages(dir: string, { includeDrafts = false } = {}): Promise<Page[]> {
  const pages = await loadDir(dir, toPage, includeDrafts);
  return pages.sort((a, b) => (a.nav ?? Infinity) - (b.nav ?? Infinity) || a.slug.localeCompare(b.slug));
}
