import site from "./data/site.json";

/**
 * The site, as crawled from nmr.gifcommit.com on 2026-10-06 and parsed by
 * captures/extract.py. Everything here is the label's own: Greg Edgerton
 * and Kyle Kraszewski ran No Milk Records from Jackson, New Jersey, 2005
 * to 2007, and own the copy, the photographs and the recordings' artwork.
 */
export interface Block { kind: string; html: string; text: string }
export interface Section { title: string; blocks: Block[] }
export interface PageData { title: string; sections: Section[] }
export interface Post { date: string; title: string; html: string; by: string | null; source: string }
export interface Band { slug: string; name: string; title: string; members: string[]; bio: string[]; links: { href: string; label: string }[]; photo: string }
export interface Release { slug: string; catalog: string; cover: string | null; coverAlt: string; band: string; title: string; facts: string[]; description: string[]; tracks: string[] }
export interface Show { date: string; venue: string; bands: string }
export interface Item { slug: string; code: string; kind: string; image: string | null; imageAlt: string; band: string; title: string; price: string | null; description: string[]; sizes: string[] }
export interface Song { band: string; file: string; label: string; song: string }

/**
 * The label's name, renamed as the crawl is read. The study's parody name is
 * GIFmilk Records, so wherever the site's own text says "No Milk" (in any
 * case) or uses NMR as the label's short name, the page says GIFmilk. What is
 * left alone: catalogue numbers (NMR013), web addresses, file names and the
 * pictures, which are the label's as they were. `site.json` itself is the
 * crawl, unchanged; delete the call to `renamed` below to read it as written.
 */
export const BRAND = "GIFmilk Records";
const say = (text: string) => text.replace(/no milk records/gi, "GIFmilk Records").replace(/no milk/gi, "GIFmilk").replace(/\bNMR\b(?![- ]?\d)/g, "GIFmilk");
/** In HTML the name is wrapped so a stylesheet that sets type in capitals leaves its case alone. */
const sayHtml = (text: string) => say(text).replace(/GIFmilk(?: Records)?/g, (m) => `<span class="brand-case">${m}</span>`);
function rename(value: string): string {
  // A path or an address: no spaces, and a slash or a dot in it.
  if (!/\s/.test(value) && /[/.]/.test(value)) return value;
  // HTML: the text between tags, and alt text; never an address inside a tag.
  if (value.includes("<")) return value.replace(/(^|>)([^<]+)/g, (_, open, text) => open + sayHtml(text)).replace(/alt="([^"]*)"/g, (_, alt) => `alt="${say(alt)}"`);
  return say(value);
}
function renamed<T>(value: T): T {
  if (typeof value === "string") return rename(value) as T;
  if (Array.isArray(value)) return value.map(renamed) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, renamed(v)])) as T;
  return value;
}

const data = renamed(site as unknown as {
  pages: Record<string, PageData>; news: Post[]; bands: Record<string, Band>; releases: Release[]; tours: Show[]; store: Item[]; audio: Song[];
});

export const pages = data.pages;
export const news = data.news;
export const bands = data.bands;
export const BAND_ORDER = ["nhe", "lf", "tbr", "sa", "hx", "so", "to", "ro", "arr"] as const;
export const releases = data.releases;
export const tours = data.tours;
export const store = data.store;
export const audio = data.audio;

/** A mirrored asset, under public/nmr/. */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

/** Where an old page lives now. */
export function route(old: string): string {
  const s = old.replace(/^page:/, "").replace(/\.shtml$/, "");
  if (s === "news" || /^0[567]_\d\d$/.test(s)) return "./index.html#news";
  if (s in bands) return `./band-${s}.html`;
  if (s.startsWith("releases_")) return `./releases.html#${s.replace("releases_", "nmr")}`;
  if (s === "releases") return "./releases.html";
  if (s.startsWith("reviews")) return `./reviews.html${s === "reviews" ? "" : "#" + s.replace("reviews_", "nmr")}`;
  if (s.startsWith("tours")) return "./tours.html";
  if (s.startsWith("store")) return `./store.html${s === "store" ? "" : "#" + s.replace("store_", "").toLowerCase()}`;
  if (s === "audio") return "./audio.html";
  if (/^(icons|wallpapers|banners|video|podcast)/.test(s)) return `./media.html#${s}`;
  if (/^(contact|faq|jobs|links|street)$/.test(s)) return `./info.html#${s}`;
  return "./index.html";
}

/** Sanitised HTML from the crawl, with its links and images pointed here. */
export function prose(html: string): string {
  return html
    .replace(/href="page:([^"]+)"/g, (_, p) => `href="${route(p)}"`)
    .replace(/href="(nmr\/[^"]+)"/g, (_, p) => `href="${asset(p)}"`)
    .replace(/src="(nmr\/[^"]+)"/g, (_, p) => `src="${asset(p)}" loading="lazy"`)
    .replace(/href="(https?:[^"]+)"/g, (_, u) => `href="${u}" rel="noopener"`);
}

/** The first sentence or two of a passage, for a card's body; the rest is behind More. */
export function brief(text: string, max = 200): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return end > 60 ? cut.slice(0, end + 1) : cut.replace(/\s\S*$/, "") + "…";
}

export const bandOf = (name: string) => Object.values(bands).find((b) => b.name.toLowerCase() === name.toLowerCase());
