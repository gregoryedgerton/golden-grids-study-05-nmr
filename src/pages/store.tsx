import { useState } from "react";
import { GoldenGrid, GoldenBox } from "@gifcommit/golden-grids";
import type { PlacementValue } from "@gifcommit/golden-grids";
import { mount } from "../main";
import { Page } from "../lib/Page";
import { Band } from "../bands/Band";
import { Fact } from "../lib/boxes";
import { useViewport, pick } from "../lib/viewport";
import { useExpandGroup } from "../lib/expand";
import { store, pages } from "../data";
import { ItemCard, NewsletterBand, priceOf } from "../lib/modules";
import { Prose } from "../lib/Prose";

/**
 * The store, as the original had it: browse by artist, browse by category,
 * a policy, and every item on a page of its own with a PayPal button. Here
 * the two browse controls filter the bands, each category is a band, and an
 * item opens in place to its product view: picture, price, sizes, quantity,
 * availability, and an Add to cart that is present and retired.
 */
const KINDS = ["CD", "T-shirt", "Poster", "Button", "Zip-up hoodie", "Hat"];
const label = (kind: string) => (kind === "CD" ? "CDs" : kind === "Hat" ? "Hats" : kind + "s");
const ARTISTS = [...new Set(store.map((i) => i.band))].sort();

function StoreBar({ artist, setArtist, kinds }: { artist: string; setArtist: (a: string) => void; kinds: string[] }) {
  const count = store.filter((i) => i.image && (!artist || i.band === artist)).length;
  return (
    <section className="list-band" id="browse" aria-labelledby="browse-title">
      <header className="band__header"><h2 id="browse-title" className="band__title">Browse</h2>
        <p className="band__lesson">{store.length} items in the catalogue, {store.filter((i) => priceOf(i).sale).length} of them on the summer sale, {store.filter((i) => !i.price).length} sold out. Choose an artist to see only their merch; the tabs jump to a category.</p></header>
      <form className="storebar" onSubmit={(e) => e.preventDefault()}>
        <label>Browse by artist
          <select value={artist} onChange={(e) => setArtist(e.target.value)}>
            <option value="">All artists ({store.length})</option>
            {ARTISTS.map((a) => <option key={a} value={a}>{a} ({store.filter((i) => i.band === a).length})</option>)}
          </select>
        </label>
        <label>Showing<output>{count} {count === 1 ? "item" : "items"}</output></label>
      </form>
      <ul className="tabs" aria-label="Categories">
        {kinds.map((k) => <li key={k}><a href={`#${k.toLowerCase().replace(/\W+/g, "-")}`}>{label(k)}</a></li>)}
      </ul>
    </section>
  );
}

function Category({ kind, index, artist }: { kind: string; index: number; artist: string }) {
  const viewport = useViewport(); const x = useExpandGroup();
  const items = store.filter((i) => i.kind === kind && i.image && (!artist || i.band === artist));
  if (!items.length) return null;
  const n = Math.min(Math.max(items.length, 2), pick(viewport, { mobile: 5, tablet: 7, desktop: 8 }));
  const orient: [PlacementValue, boolean][] = [["bottom", true], ["right", false], ["top", false], ["left", true], ["bottom", false], ["right", true]];
  const [placement, clockwise] = orient[index % orient.length];
  const fill = n - items.length;
  const low = Math.min(...items.map((i) => parseFloat(priceOf(i).amount?.slice(1) ?? "999")));
  return (
    <Band id={kind.toLowerCase().replace(/\W+/g, "-")} title={label(kind)} lesson={`${items.length} ${items.length === 1 ? "item" : "items"}: ${items.map((i) => `${i.band} ${i.title}`).join("; ")}. Open one for the price, the sizes, what is in stock, and the cart.`} note={`from=1 to=${n} · placement="${placement}" · clockwise=${clockwise}${n < items.length ? ` · ${n} of ${items.length} at this width` : ""}${fill > 0 ? ` · ${fill} square${fill > 1 ? "s" : ""} of type` : ""}`}>
      <GoldenGrid from={1} to={n} placement={placement} clockwise={clockwise}>
        {items.slice(0, n).map((i) => <GoldenBox key={i.code} {...x.boxProps(i.code)}><ItemCard item={i} x={x} /></GoldenBox>)}
        {fill > 0 && <GoldenBox><Fact label={label(kind)} tone="ink" fitClass="fit--num">{isFinite(low) ? `from\n$${low.toFixed(2)}` : "Sold\nout"}</Fact></GoldenBox>}
        {fill > 1 && <GoldenBox><Fact label="Shipping" fitClass="fit--light">{"2–3\nweeks"}</Fact></GoldenBox>}
      </GoldenGrid>
    </Band>
  );
}

function Policy() {
  const sec = pages.store_hx001t?.sections.find((s) => s.title === "store policy");
  if (!sec) return null;
  return (
    <section className="list-band" id="policy" aria-labelledby="policy-title">
      <header className="band__header"><h2 id="policy-title" className="band__title">Store policy</h2></header>
      <Prose className="cell__body" html={sec.blocks.map((b) => b.html).join("")} />
      <p className="cell__source">The store took PayPal to nomilkrecords@mail.com. The checkout was retired with the label; the buttons are here as they were.</p>
    </section>
  );
}

function Store() {
  const [artist, setArtist] = useState("");
  const kinds = KINDS.filter((k) => store.some((i) => i.kind === k && i.image && (!artist || i.band === artist)));
  return (
    <>
      <StoreBar artist={artist} setArtist={setArtist} kinds={kinds} />
      {kinds.map((k, i) => <Category key={k + artist} kind={k} index={i} artist={artist} />)}
      {!kinds.length && <p className="list-band store__empty">Nothing in the store for that artist.</p>}
      <Policy />
      <NewsletterBand />
    </>
  );
}

mount(
  <Page current="store.html" title="store" standfirst="CDs, t-shirts, buttons, posters, a hoodie and a trucker hat; most of it on the summer sale.">
    <Store />
  </Page>
);
