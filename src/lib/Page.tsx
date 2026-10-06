import type { ReactNode } from "react";
import { Tools } from "./tools";
import { asset, BAND_ORDER, bands } from "../data";
import "../styles.css";

/**
 * The shell every page shares, after the original's: the logo and the P.O.
 * box, five groups of navigation (Information, Involvement, Artists, Media,
 * Store), the page, and a footer. Plain links between plain HTML files.
 */
export const NAV = [
  { group: "Information", links: [["index.html", "News"], ["releases.html", "Releases"], ["reviews.html", "Reviews"], ["tours.html", "Tours"]] },
  { group: "Involvement", links: [["info.html#contact", "Contact"], ["info.html#faq", "F.A.Q."], ["info.html#jobs", "Jobs & internships"], ["info.html#links", "Links"], ["info.html#street", "Street team"]] },
  { group: "Artists", links: BAND_ORDER.map((s) => [`band-${s}.html`, bands[s].name] as [string, string]) },
  { group: "Media", links: [["audio.html", "Audio"], ["media.html#banners", "Banners"], ["media.html#icons", "Buddy icons"], ["media.html#podcast", "Podcast"], ["media.html#video", "Video"], ["media.html#wallpapers", "Wallpapers"]] },
  { group: "Store", links: [["store.html", "Store"]] },
] as const;

export function Page({ current, title, standfirst, children }: { current: string; title: string; standfirst?: string; children: ReactNode }) {
  return (
    <>
      <a className="skip" href="#content">Skip to content</a>
      <Tools />
      <header className="masthead">
        <div className="masthead__row">
          <a className="masthead__logo" href="./index.html"><img src={asset("nmr/site/images/nmr_logo.gif")} alt="No Milk Records" width="54" height="40" /></a>
          <p className="masthead__address"><strong>No Milk Records</strong><br />P.O. Box 1229 Jackson, NJ<br />08527 United States</p>
        </div>
        <nav className="nav" aria-label="Site">
          {NAV.map((g) => {
            const here = g.links.some(([href]) => href.split("#")[0] === current);
            return (
              <details className={`nav__group${here ? " nav__group--here" : ""}`} key={g.group} open={here && window.innerWidth < 1100}>
                <summary className="nav__head">{g.group}<span className="nav__count" aria-hidden="true">{g.links.length}</span></summary>
                <ul>
                  {g.links.map(([href, label]) => (
                    <li key={href}>
                      {href.split("#")[0] === current ? <a href={`./${href}`} aria-current="page">{label}</a> : <a href={`./${href}`}>{label}</a>}
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
          <p className="nav__cart" aria-label="Cart, empty; the store's checkout is retired"><span className="nav__cartglyph" aria-hidden="true">▣</span> Cart · 0</p>
        </nav>
        <h1 className="masthead__title">{title}</h1>
        {standfirst && <p className="masthead__standfirst">{standfirst}</p>}
      </header>

      <main id="content">{children}</main>

      <footer className="colophon">
        <p>
          A layout study of the No Milk Records website, <a href="https://nmr.gifcommit.com/news.shtml">nmr.gifcommit.com</a>,
          as it stood in 2007: a DIY punk and emo label run from Jackson, New Jersey, 2005–2007, by Greg Edgerton and Kyle
          Kraszewski. The copy, photographs, artwork and recordings are the label's own and are used with its owner's
          permission; the original site design was by Macabre Studios. Built with{" "}
          <a href="https://github.com/gregoryedgerton/golden-grids">Golden Grids</a> ·{" "}
          <a href="https://www.npmjs.com/package/@gifcommit/golden-grids">npm</a> ·{" "}
          <a href="https://gregoryedgerton.github.io/golden-grids/">generator</a>.
        </p>
      </footer>
    </>
  );
}
