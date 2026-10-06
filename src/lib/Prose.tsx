import { prose } from "../data";

/** The crawl's sanitised HTML (p, br, a, strong, em, img, lists, tables),
 *  rendered as it was written. The sanitiser in captures/extract.py is the
 *  only thing between the 2007 markup and this element. */
export function Prose({ html, className }: { html: string; className?: string }) {
  // The crawl's <h1>/<h2> were the site's box titles; here they are lines
  // of a passage under the band's own heading, so they become paragraphs.
  const html2 = prose(html).replace(/<h1>/g, '<p class="prose__h">').replace(/<\/h1>/g, "</p>").replace(/<h2>/g, '<p class="prose__sub">').replace(/<\/h2>/g, "</p>").replace(/<h3>/g, '<p class="prose__h">').replace(/<\/h3>/g, "</p>");
  return <div className={`prose${className ? ` ${className}` : ""}`} dangerouslySetInnerHTML={{ __html: html2 }} />;
}
