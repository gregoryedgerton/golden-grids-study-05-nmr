import { GoldenGrid, GoldenBox } from "@gifcommit/golden-grids";
import type { PlacementValue } from "@gifcommit/golden-grids";
import { mount } from "../main";
import { Page } from "../lib/Page";
import { Band } from "../bands/Band";
import { useViewport, pick } from "../lib/viewport";
import { useExpandGroup } from "../lib/expand";
import { Prose } from "../lib/Prose";
import { news } from "../data";
import { FeaturedArtistsBand, FeaturedItemsBand, DownloadsBand, NewsletterBand, PostCard } from "../lib/modules";

/** The front page: current news, then the archive as the list it is. */
function CurrentNews() {
  const viewport = useViewport();
  const x = useExpandGroup();
  const [to, placement] = pick<readonly [number, PlacementValue]>(viewport, { mobile: [3, "bottom"], tablet: [5, "top"], desktop: [5, "top"] });
  const posts = news.slice(0, 5);
  return (
    <Band id="news" title="Current news" lesson="The last word from the office, August 2007: No Hollywood Ending at Chubby's in Red Bank before a tour, the Friends & Family channel on Bamboozle TV, Everybody's Talking on pre-order, and the radio player launched in July." note={`from=1 to=${to} · placement="${placement}" · clockwise=true · newest post in the largest square`}>
      <GoldenGrid from={1} to={to} placement={placement}>
        {posts.map((p, i) => <GoldenBox key={i} {...x.boxProps(`p${i}`)}><PostCard post={p} x={x} k={`p${i}`} /></GoldenBox>)}
      </GoldenGrid>
    </Band>
  );
}

function Archive() {
  const rest = news.slice(5);
  const years = ["2007", "2006"];
  return (
    <section className="list-band" id="archive" aria-labelledby="archive-title">
      <header className="band__header"><h2 id="archive-title" className="band__title">Archived news</h2>
        <p className="band__lesson">Everything the label posted from January 2006 to the summer of 2007, {rest.length} posts, newest first. The 2005 archive lived at nomilkrecords.com and is gone; the pages there now redirect to a parking page.</p></header>
      {years.map((y) => {
        const yy = rest.filter((p) => p.date.endsWith(y.slice(2)));
        if (!yy.length) return null;
        return (
          <div key={y} className="rows">
            <h3 className="band__title">{y}</h3>
            <ul className="list">
              {yy.map((p, i) => (
                <li key={i}>
                  <details>
                    <summary><span className="list__head"><time>{p.date}</time> {p.title}</span></summary>
                    <Prose html={p.html} />
                    {p.by && <p className="cell__source">posted by {p.by}</p>}
                  </details>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

mount(
  <Page current="index.html" title="news" standfirst="Hype, gossip, shows. No Milk Records, Jackson, New Jersey.">
    <CurrentNews />
    <FeaturedArtistsBand />
    <FeaturedItemsBand />
    <Archive />
    <DownloadsBand />
    <NewsletterBand />
  </Page>
);
