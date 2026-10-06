import { mount } from "../main";
import { Page } from "../lib/Page";
import { Prose } from "../lib/Prose";
import { pages, releases, asset } from "../data";
import { FeaturedArtistsBand } from "../lib/modules";

/** Reviews, record by record. Each is quotations with links to the zines
 *  that ran them, flat content, so a list, with the record's cover beside. */
function Reviews() {
  const reviewed = Object.keys(pages).filter((k) => /^reviews_\d+$/.test(k)).sort().reverse();
  return (
    <section className="list-band" id="reviews" aria-labelledby="reviews-title">
      <header className="band__header"><h2 id="reviews-title" className="band__title">Reviews archive</h2>
        <p className="band__lesson">What the zines said, record by record: Splendid, AbsolutePunk, PunkNews and the rest, quoted with a link to the full text where it still was in 2007. Seven records were reviewed.</p></header>
      <ul className="list">
        {reviewed.map((k) => {
          const pg = pages[k]; const sec = pg.sections.find((s) => /^nmr/i.test(s.title)); if (!sec) return null;
          const r = releases.find((x) => x.catalog === sec.title.toUpperCase());
          return (
            <li key={k} id={sec.title.toLowerCase()}>
              <details open={k === reviewed[0]}>
                <summary><span className="list__head"><span className="list__k">{sec.title.toUpperCase()}</span> {r ? `${r.band} · ${r.title}` : pg.title}</span></summary>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(80px, 120px) 1fr", gap: 12 }}>
                  {r?.cover && <img src={asset(r.cover)} alt={r.coverAlt} loading="lazy" style={{ width: "100%", height: "auto", border: "1px solid var(--ink-soft)" }} />}
                  <Prose html={sec.blocks.map((b) => b.html).join("\n")} />
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
mount(<Page current="reviews.html" title="reviews" standfirst="Press on the records, as the label collected it."><Reviews /><FeaturedArtistsBand /></Page>);
