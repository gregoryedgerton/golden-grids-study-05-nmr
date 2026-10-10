import type { ReactNode } from "react";

/**
 * The parody name keeps its case wherever a stylesheet sets type in capitals
 * (labels, band titles, captions): "GIFmilk Records", never "GIFMILK RECORDS".
 * Strings from the crawl and the study's own go through this where they are
 * drawn; HTML from the crawl has the name wrapped by `data.ts`.
 */
export const BRAND_RE = /(GIFmilk(?: Records)?)/;
export function Cased({ children }: { children: ReactNode }): ReactNode {
  if (typeof children !== "string" || !BRAND_RE.test(children)) return children;
  return children.split(BRAND_RE).map((part, i) => (i % 2 ? <span key={i} className="brand-case">{part}</span> : part));
}
