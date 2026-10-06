import { GoldenGrid, GoldenBox } from "@gifcommit/golden-grids";
import type { PlacementValue } from "@gifcommit/golden-grids";
import { mount } from "../main";
import { Page } from "../lib/Page";
import { Band } from "../bands/Band";
import { useViewport, pick } from "../lib/viewport";
import { useExpandGroup } from "../lib/expand";
import { store, pages } from "../data";
import { ItemCard, NewsletterBand } from "../lib/modules";
import { Prose } from "../lib/Prose";

/** The store, by category, each category a band; the policy as it was. */
const KINDS = ["CD", "T-shirt", "Poster", "Button", "Zip-up hoodie", "Hat"];
function Category({ kind, index }: { kind: string; index: number }) {
  const viewport = useViewport(); const x = useExpandGroup();
  const items = store.filter((i) => i.kind === kind && i.image);
  if (!items.length) return null;
  const n = Math.min(Math.max(items.length, 2), pick(viewport, { mobile: 5, tablet: 7, desktop: 8 }));
  const orient: [PlacementValue, boolean][] = [["bottom", true], ["right", false], ["top", false], ["left", true], ["bottom", false], ["right", true]];
  const [placement, clockwise] = orient[index % orient.length];
  const label = kind === "CD" ? "CDs" : kind === "Hat" ? "Hats" : kind + "s";
  return (
    <Band id={kind.toLowerCase().replace(/\W+/g, "-")} title={label} lesson={`${items.length} ${items.length === 1 ? "item" : "items"}: ${items.map((i) => `${i.band} ${i.title}`).join("; ")}. Open one for the price, the sizes and the description.`} note={`from=1 to=${n} · placement="${placement}" · clockwise=${clockwise}${n < items.length ? ` · ${n} of ${items.length} at this width` : ""}`}>
      <GoldenGrid from={1} to={n} placement={placement} clockwise={clockwise}>
        {items.slice(0, n).map((i) => <GoldenBox key={i.code} {...x.boxProps(i.code)}><ItemCard item={i} x={x} /></GoldenBox>)}
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
      <p className="cell__source">The store took PayPal to nomilkrecords@mail.com. The buttons are not connected here.</p>
    </section>
  );
}
mount(
  <Page current="store.html" title="store" standfirst="CDs, t-shirts, buttons, posters, a hoodie and a trucker hat; most of it on the summer sale.">
    {KINDS.map((k, i) => <Category key={k} kind={k} index={i} />)}
    <Policy />
    <NewsletterBand />
  </Page>
);
