import { GoldenGrid, GoldenBox } from "@gifcommit/golden-grids";
import type { PlacementValue } from "@gifcommit/golden-grids";
import { mount } from "../main";
import { Page } from "../lib/Page";
import { Band } from "../bands/Band";
import { Fact } from "../lib/boxes";
import { useViewport, pick } from "../lib/viewport";
import { tours } from "../data";
import { FeaturedArtistsBand, NewsletterBand } from "../lib/modules";

/** The autumn 2006 run: who was out, and every date. */
function OnTour() {
  const viewport = useViewport();
  const counts = new Map<string, number>();
  // The label's band is the run of capitals at the start of each line.
  for (const t of tours) { const name = (t.bands.match(/^(?:[A-Z0-9'&-]+\s)*[A-Z0-9'&-]+/) ?? [t.bands])[0].trim(); counts.set(name, (counts.get(name) ?? 0) + 1); }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const [to, placement] = pick<readonly [number, PlacementValue]>(viewport, { mobile: [3, "top"], tablet: [4, "right"], desktop: [4, "right"] });
  return (
    <Band id="on-tour" title="Bands on tour" lesson={`${tours.length} dates listed for September and October 2006. Halifax on the road with Sugarcult, The Spill Canvas, Maxeen and So They Say, from the Fillmore to the House of Blues; No-Fi Soul Rebellion across the Northwest; the Jersey bands at home.`} note={`from=1 to=${to} · placement="${placement}" · clockwise=false · most dates largest`}>
      <GoldenGrid from={1} to={to} placement={placement} clockwise={false}>
        {top.map(([name, n]) => (
          <GoldenBox key={name}><Fact label={`${n} ${n === 1 ? "date" : "dates"}`} fitClass="fit--light">{name.toLowerCase()}</Fact></GoldenBox>
        ))}
      </GoldenGrid>
    </Band>
  );
}
function Dates() {
  return (
    <section className="list-band" id="dates" aria-labelledby="dates-title">
      <header className="band__header"><h2 id="dates-title" className="band__title">Current shows</h2><p className="band__lesson">Every date, in order. A tour is a list.</p></header>
      <ul className="list">
        {tours.map((t, i) => (
          <li key={i}><div className="list__head"><time>{t.date}</time> <strong>{t.venue}</strong></div><div style={{ fontSize: 15, color: "var(--ink-soft)" }}>{t.bands}</div></li>
        ))}
      </ul>
    </section>
  );
}
mount(<Page current="tours.html" title="tours" standfirst="Upcoming shows, concerts and fests, as listed in September 2006."><OnTour /><Dates /><FeaturedArtistsBand /><NewsletterBand /></Page>);
