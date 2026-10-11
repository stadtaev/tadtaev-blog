export const site = {
  author: "Stanislav Tadtaev",
  description: "Notes on software, systems and knowledge.",
  defaultOrigin: "https://tadtaev.dev",
  /** Words per minute used for the "min read" estimate. */
  readingSpeed: 220,
} as const;

export const paths = {
  posts: "content/posts",
  pages: "content/pages",
  public: "public",
  editor: "src/editor/index.html",
} as const;

/** Browser ES module builds served from /vendor/ for the editor, keyed by output filename. */
export const editorVendor = {
  "marked.js": "marked",
  "purify.js": "dompurify",
  "js-yaml.js": "js-yaml/browser",
} as const;
