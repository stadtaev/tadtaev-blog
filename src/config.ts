export const site = {
  author: "Stanislav Tadtaev",
  description: "Notes on software, systems and knowledge.",
  defaultOrigin: "https://tadtaev.dev",
  /** Words per minute used for the "min read" estimate. */
  readingSpeed: 220,
  /** Header logo: name in bold, suffix muted. */
  wordmark: { name: "tadtaev", suffix: ".dev" },
  tagline: "Thoughtfully built. Simply written.",
  /** Homepage intro. Lines of `lede` and `note` are separated by line breaks on wide screens only. */
  home: {
    eyebrow: "A PERSONAL NOTEBOOK",
    lede: ["Notes on software, systems,", "and making knowledge useful."],
    note: [
      "A software engineer thinking out loud about architecture,",
      ".NET, TypeScript, and AI-assisted engineering.",
    ],
  },
} as const;

type Strings = {
  /** Header link to the homepage. */
  writing: string;
  minRead: string;
  allWriting: string;
  thanks: string;
  backToNotebook: string;
  draft: string;
  /** Homepage list heading and post counter label. */
  writingLabel: string;
  notesLabel: string;
  noNotes: string;
  notFoundTitle: string;
  notFoundDescription: string;
  notFoundHeading: string;
  notFoundText: string;
  notFoundBack: string;
};

/**
 * Supported post languages, keyed by filename suffix (`note.ru.md`).
 * Posts render their own language's strings; the site chrome uses `defaultLanguage`.
 */
export const languages = {
  en: {
    label: "English",
    locale: "en-GB",
    strings: {
      writing: "Writing",
      minRead: "min read",
      allWriting: "← All writing",
      thanks: "Thanks for reading.",
      backToNotebook: "← Back to the notebook",
      draft: "Draft",
      writingLabel: "WRITING",
      notesLabel: "NOTES",
      noNotes: "No published notes yet.",
      notFoundTitle: "Page not found",
      notFoundDescription: "This page could not be found.",
      notFoundHeading: "Nothing here. Yet.",
      notFoundText: "The page may have moved.",
      notFoundBack: "← Back to writing",
    },
  },
  ru: {
    label: "Русский",
    locale: "ru-RU",
    strings: {
      writing: "Заметки",
      minRead: "мин чтения",
      allWriting: "← Все заметки",
      thanks: "Спасибо за чтение.",
      backToNotebook: "← Назад к блокноту",
      draft: "Черновик",
      writingLabel: "ЗАМЕТКИ",
      notesLabel: "ЗАМЕТОК",
      noNotes: "Опубликованных заметок пока нет.",
      notFoundTitle: "Страница не найдена",
      notFoundDescription: "Эта страница не найдена.",
      notFoundHeading: "Здесь пока ничего нет.",
      notFoundText: "Возможно, страница переехала.",
      notFoundBack: "← Назад к заметкам",
    },
  },
} as const satisfies Record<string, { label: string; locale: string; strings: Strings }>;

export type Language = keyof typeof languages;
export const defaultLanguage: Language = "en";

export const paths = {
  posts: "content/posts",
  pages: "content/pages",
  public: "public",
} as const;
