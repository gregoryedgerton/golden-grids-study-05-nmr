import { GoldenGrid, GoldenBox } from "@gifcommit/golden-grids";
import type { PlacementValue } from "@gifcommit/golden-grids";
import { mount } from "../main";
import { Page } from "../lib/Page";
import { Band } from "../bands/Band";
import { useViewport, pick } from "../lib/viewport";
import { useExpandGroup } from "../lib/expand";
import { releases } from "../data";
import { ReleaseCard, FeaturedItemsBand } from "../lib/modules";

/** Thirteen records, 2005 to 2007: the five newest as one band, the eight
 *  before them as another; 5 and 8 are the counts the sequence gives. */
function Recent() {
  const viewport = useViewport(); const x = useExpandGroup();
  const [to, placement] = pick<readonly [number, PlacementValue]>(viewport, { mobile: [5, "right"], tablet: [5, "bottom"], desktop: [5, "bottom"] });
  const rs = releases.slice(0, 5);
  return (
    <Band id="recent" title="Release history · the latest" lesson={`${rs.map((r) => `${r.band}, ${r.title} (${r.catalog})`).join("; ")}. Open a cover for the running time, the studio and the label's own words.`} note={`from=1 to=${to} · placement="${placement}" · clockwise=true · newest largest`}>
      <GoldenGrid from={1} to={to} placement={placement}>{rs.map((r) => <GoldenBox key={r.catalog} {...x.boxProps(r.catalog)}><ReleaseCard r={r} x={x} /></GoldenBox>)}</GoldenGrid>
    </Band>
  );
}
function Earlier() {
  const viewport = useViewport(); const x = useExpandGroup();
  const rs = releases.slice(5, 13);
  const to = pick(viewport, { mobile: 5, tablet: 8, desktop: 8 });
  const placement = pick<PlacementValue>(viewport, { mobile: "left", tablet: "right", desktop: "right" });
  return (
    <Band id="earlier" title="Release history · 2005–2006" lesson={`The first eight: ${rs.map((r) => `${r.band}, ${r.title}`).join("; ")}.`} note={`from=1 to=${to} · placement="${placement}" · clockwise=false${to < 8 ? " · five of eight at 390" : ""}`}>
      <GoldenGrid from={1} to={to} placement={placement} clockwise={false}>{rs.map((r) => <GoldenBox key={r.catalog} {...x.boxProps(r.catalog)}><ReleaseCard r={r} x={x} /></GoldenBox>)}</GoldenGrid>
    </Band>
  );
}
mount(
  <Page current="releases.html" title="releases" standfirst="CDs, LPs, EPs and four Friends & Family samplers, NMR004 to NMRX001.">
    <Recent /><Earlier /><FeaturedItemsBand items={undefined} title="In the store" />
  </Page>
);
