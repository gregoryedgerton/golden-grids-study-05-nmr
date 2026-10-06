import { GoldenGrid, GoldenBox } from "@gifcommit/golden-grids";
import type { PlacementValue } from "@gifcommit/golden-grids";
import { mount } from "../main";
import { Page } from "../lib/Page";
import { Band } from "../bands/Band";
import { useViewport } from "../lib/viewport";
import { audio, pages, asset } from "../data";
import { SongCard, FeaturedArtistsBand } from "../lib/modules";
import { Prose } from "../lib/Prose";

/** Every MP3 the label gave away, playable. Fourteen songs: 8 + 5 + 1. */
function Songs({ title, list, placement, clockwise, lesson, id }: { title: string; list: typeof audio; placement: PlacementValue; clockwise: boolean; lesson: string; id: string }) {
  const viewport = useViewport();
  // Five a band: the smallest of five squares is 170px at 1440, room for a
  // song title; the smallest of eight is 40px, room for nothing.
  const n = Math.min(list.length, 5);
  // At 390 an eight-square band leaves 36px for a song title, which is no
  // room at all; the list is the honest shape there, every song still playable.
  if (viewport === "mobile") return (
    <section className="list-band" id={id} aria-labelledby={`${id}-title`}>
      <header className="band__header"><h2 id={`${id}-title`} className="band__title">{title}</h2><p className="band__lesson">{lesson}</p></header>
      <ul className="list">{list.map((s) => <li key={s.file}><div className="list__head"><span className="list__k">{s.band}</span> <strong>{s.song}</strong></div><audio controls preload="none" src={asset(s.file)} aria-label={`${s.band}, ${s.song}`} style={{ width: "100%", marginTop: 6 }} /></li>)}</ul>
    </section>
  );
  return (
    <Band id={id} title={title} lesson={lesson} note={`from=1 to=${n} · placement="${placement}" · clockwise=${clockwise} · <audio> in every square`}>
      <GoldenGrid from={1} to={n} placement={placement} clockwise={clockwise}>
        {list.slice(0, n).map((s) => <GoldenBox key={s.file}><SongCard song={s} /></GoldenBox>)}
      </GoldenGrid>
    </Band>
  );
}
function Note() {
  const sec = pages.audio.sections.find((s) => s.title === "important information");
  return sec ? <section className="list-band"><header className="band__header"><h2 className="band__title">Important information</h2></header><Prose className="cell__body" html={sec.blocks.map((b) => b.html).join("")} /></section> : null;
}
const first = audio.slice(0, 5), second = audio.slice(5, 10), third = audio.slice(10);
mount(
  <Page current="audio.html" title="audio" standfirst="Music, songs, download, MP3: fourteen tracks from the catalogue, free then and now.">
    <Songs id="songs-1" title="Audio downloads" list={first} placement="top" clockwise lesson={`${first.map((s) => `${s.band}, “${s.song}”`).join("; ")}.`} />
    <Songs id="songs-2" title="Audio downloads, continued" list={second} placement="bottom" clockwise={false} lesson={`${second.map((s) => `${s.band}, “${s.song}”`).join("; ")}.`} />
    <Songs id="songs-3" title="Audio downloads, the rest" list={third} placement="top" clockwise={false} lesson={`${third.map((s) => `${s.band}, “${s.song}”`).join("; ")}.`} />
    <Note />
    <FeaturedArtistsBand />
  </Page>
);
