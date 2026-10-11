/** Markup that has already been escaped or is trusted, and must not be escaped again. */
export class SafeHtml {
  readonly value: string;
  constructor(value: string) {
    this.value = value;
  }
}

type Interpolation = SafeHtml | string | number | boolean | null | undefined | readonly Interpolation[];

const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escape(text: string): string {
  return text.replace(/[&<>"']/g, (c) => entities[c]!);
}

/** Marks a string as trusted markup. Only use for content we control (rendered Markdown from the repo). */
export function raw(markup: string): SafeHtml {
  return new SafeHtml(markup);
}

function render(value: Interpolation): string {
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(render).join("");
  if (value === null || value === undefined || value === false) return "";
  return escape(String(value));
}

/**
 * Tagged template that escapes every interpolated value unless it is SafeHtml.
 * Arrays are joined; null, undefined and false render as nothing.
 */
export function html(strings: TemplateStringsArray, ...values: Interpolation[]): SafeHtml {
  let out = strings[0]!;
  values.forEach((value, i) => {
    out += render(value) + strings[i + 1]!;
  });
  return new SafeHtml(out);
}
