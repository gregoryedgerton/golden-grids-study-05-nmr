import { GoldenGrid, GoldenBox } from "@gifcommit/golden-grids";
import type { PlacementValue } from "@gifcommit/golden-grids";
import { mount } from "../main";
import { Page } from "../lib/Page";
import { Band } from "../bands/Band";
import { useViewport, pick } from "../lib/viewport";
import { useExpandGroup, ExpandedCell } from "../lib/expand";
import { Fact } from "../lib/boxes";
import { Player } from "../lib/clip";
import { asset, bands, store, audio, pages, brief } from "../data";
import { FeaturedArtistsBand, FeaturedItemsBand, DownloadsBand, ReleaseCard, releasesOf } from "../lib/modules";
import { Cased } from "../lib/Cased";

const slug = document.getElementById("root")!.dataset.band!;
const band = bands[slug];
const VIDEOS: Record<string, { clip: string; poster: string; video: string; title: string }[]> = {
  hx: [{ clip: "nmr/media/video/hx/sydney_clip.mp4", poster: "nmr/media/video/hx/sydney_poster.jpg", video: "nmr/media/video/hx/sydney_320x240.mp4", title: "“Sydney”, directed by Greg Edgerton" }],
  tbr: [
    { clip: "nmr/media/video/tbr/u2_clip.mp4", poster: "nmr/media/video/tbr/u2_poster.jpg", video: "nmr/media/video/tbr/u2_320x240.mp4", title: "The Bank Robbers, live" },
    { clip: "nmr/media/video/tbr/may2004_clip.mp4", poster: "nmr/media/video/tbr/may2004_poster.jpg", video: "nmr/media/video/tbr/may2004_320x240.mp4", title: "The Bank Robbers, May 2004" },
  ],
};

function Profile() {
  const viewport = useViewport();
  const x = useExpandGroup();
  const [to, placement] = pick<readonly [number, PlacementValue]>(viewport, { mobile: [3, "top"], tablet: [4, "left"], desktop: [4, "left"] });
  const tail = band.title.match(/\]\s*(.*)$/)?.[1]?.trim() ?? "";
  const place = tail.match(/([A-Z][\w .\/]+?,\s*[A-Z]{2})\b/)?.[1] ?? tail;
  const videos = VIDEOS[slug] ?? [];
  return (
    <Band id="profile" title={band.name} lesson={band.bio[0] ?? place} note={`from=1 to=${to} · placement="${placement}" · clockwise=false · hero right`}>
      <GoldenGrid from={1} to={to} placement={placement} clockwise={false}>
        <GoldenBox>
          {videos.length
            ? <Player clip={asset(videos[0].clip)} poster={asset(videos[0].poster)} alt={`${band.name}, from the video for ${videos[0].title}`} title={videos[0].title} video={asset(videos[0].video)} />
            : <figure className="media"><img src={asset(band.photo)} alt={`${band.name}, promotional photograph`} /></figure>}
        </GoldenBox>
        <GoldenBox {...x.boxProps("bio")}>
          <Fact label="Bio" body={<><p className="box__body--short">{brief(band.bio[0] ?? "", 140)}</p><p className="box__body--long">{brief(band.bio[0] ?? "", 380)}</p></>}
            expand={{ group: x, slotKey: "bio", title: `${band.name} — bio`, full: <div className="cell__body">{band.bio.map((p, i) => <p key={i}>{p}</p>)}</div>, source: "The label's own bio, as posted." }}>
            {band.name}
          </Fact>
        </GoldenBox>
        <GoldenBox>
          <Fact label="Members" fitClass="fit--light">{viewport === "mobile" && band.members.length > 3 ? `${band.members.length}\nmembers` : band.members.map((m) => m.split(" - ")[0]).join("\n") || place}</Fact>
        </GoldenBox>
        <GoldenBox>
          <Fact label="Hometown" fitClass="fit--light">{place.replace(/,\s*/, "\n")}</Fact>
        </GoldenBox>
      </GoldenGrid>
    </Band>
  );
}

function Releases() {
  const x = useExpandGroup();
  const rs = releasesOf(band.name);
  if (!rs.length) return null;
  // The band runs full width; squares the covers do not fill carry the
  // catalogue numbers and the years as type.
  const to = Math.max(rs.length, 3);
  const fill = Array.from({ length: to - rs.length }, (_, i) => rs[i % rs.length]);
  return (
    <Band id="releases" title={`${band.name} on GIFmilk`} lesson={`${rs.length === 1 ? "One record" : `${rs.length} records`} on the label: ${rs.map((r) => `${r.title} (${r.catalog})`).join("; ")}. Open a cover for the facts.`} note={`from=1 to=${to} · placement="bottom" · clockwise=true · catalogue numbers fill the rest`}>
      <GoldenGrid from={1} to={to} placement="bottom">
        {rs.map((r) => <GoldenBox key={r.catalog} {...x.boxProps(r.catalog)}><ReleaseCard r={r} x={x} /></GoldenBox>)}
        {fill.map((r, i) => <GoldenBox key={`f${i}`}><Fact label={i === 0 ? "Catalogue" : r.facts[0] ?? "Release"} fitClass="fit--num" tone={i % 2 ? undefined : "ink"}>{i === 0 ? r.catalog : (r.facts.find((f) => /running time/i.test(f)) ?? r.facts[0] ?? r.catalog).replace(/^Running Time:\s*/i, "").replace(/ minutes? /, "′ ").replace(/ seconds?/, "″")}</Fact></GoldenBox>)}
      </GoldenGrid>
    </Band>
  );
}

function Videos() {
  const videos = VIDEOS[slug] ?? [];
  if (videos.length < 2) return null;
  return (
    <Band id="video" title="Video" lesson="Two clips from the band's video page: a live set and the May 2004 footage, offered then at 320×240 for cable and 160×120 for dial-up. Press play for the whole thing." note='from=1 to=2 · placement="right"' cap="48rem">
      <GoldenGrid from={1} to={2} placement="right">
        {videos.map((v) => (
          <GoldenBox key={v.video}><Player clip={asset(v.clip)} poster={asset(v.poster)} alt={v.title} title={v.title} video={asset(v.video)} /></GoldenBox>
        ))}
      </GoldenGrid>
    </Band>
  );
}

function Promo() {
  const x = useExpandGroup();
  const icons = pages[`icons_${slug}`]; const walls = pages[`wallpapers_${slug}`];
  const iconImgs = icons ? [...icons.sections.flatMap((s) => s.blocks.map((b) => b.html)).join(" ").matchAll(/<img src="([^"]+)" alt="([^"]*)"/g)].map((m) => ({ src: m[1], alt: m[2] })) : [];
  const wallImgs = walls ? [...walls.sections.flatMap((s) => s.blocks.map((b) => b.html)).join(" ").matchAll(/<img src="([^"]+)" alt="([^"]*)"/g)].map((m) => ({ src: m[1], alt: m[2] })) : [];
  const links = walls ? [...walls.sections.flatMap((s) => s.blocks.map((b) => b.html)).join(" ").matchAll(/<a href="(nmr\/media\/wallpaper[^"]+)"/g)].map((m) => m[1]) : [];
  const all = [...iconImgs.map((i) => ({ ...i, kind: "Buddy icon" })), ...wallImgs.map((i) => ({ ...i, kind: "Wallpaper" }))];
  if (!all.length) return null;
  const n = Math.min(Math.max(all.length, 2), 8);
  return (
    <Band id="promo" title="Buddy icons and wallpapers" lesson={`${iconImgs.length} AIM buddy icons and ${wallImgs.length} desktop wallpapers the label made for the band, free to download then and still. Open one to see it whole.`} note={`from=1 to=${n} · placement="right" · clockwise=true`}>
      <GoldenGrid from={1} to={n} placement="right">
        {all.slice(0, n).map((im, i) => {
          const key = `im${i}`; const full = im.kind === "Wallpaper" ? (links[i - iconImgs.length] ?? im.src) : im.src;
          return (
            <GoldenBox key={key} {...x.boxProps(key)}>
              <figure className="media media--contain">
                <img src={asset(im.kind === "Wallpaper" ? full : im.src)} alt={im.alt} loading="lazy" style={im.kind === "Buddy icon" ? { imageRendering: "pixelated" } : undefined} />
                <button className="media__open" {...x.triggerProps(key)}><span className="visually-hidden">Open {im.alt || im.kind}</span></button>
                <figcaption className="media__caption"><Cased>{im.kind}</Cased></figcaption>
              </figure>
              {x.isOpen(key) && (
                <ExpandedCell id={x.panelId(key)} title={im.alt || im.kind} onClose={x.close} closeRef={x.closeRef}>
                  <figure className="cell__photo"><img src={asset(full)} alt="" style={{ maxWidth: "100%", height: "auto", display: "block" }} /><figcaption className="cell__source">{im.kind} · <a href={asset(full)} download>Download</a></figcaption></figure>
                </ExpandedCell>
              )}
            </GoldenBox>
          );
        })}
      </GoldenGrid>
    </Band>
  );
}

function Links() {
  if (!band.links.length) return null;
  return (
    <section className="list-band" id="links" aria-labelledby="links-title">
      <header className="band__header"><h2 id="links-title" className="band__title">Related links</h2></header>
      <ul className="list">{band.links.map((l) => <li key={l.href}><a href={l.href} rel="noopener">{l.label}</a> <span className="box__source">{l.href.replace(/^https?:\/\//, "")}</span></li>)}</ul>
    </section>
  );
}

const songs = audio.filter((s) => s.band.toLowerCase() === band.name.toLowerCase());
const items = store.filter((i) => i.band.toLowerCase() === band.name.toLowerCase() && i.image);

mount(
  <Page current={`band-${slug}.html`} title={band.name.toLowerCase()} standfirst={band.title.match(/\]\s*(.*)$/)?.[1]?.trim()}>
    <Profile />
    <Releases />
    {songs.length > 0 && <DownloadsBand songs={songs} title={`${band.name} MP3s`} lesson={`${songs.length === 1 ? "One song" : `${songs.length} songs`} the label gave away: ${songs.map((s) => `“${s.song}”`).join(", ")}.`} />}
    <Videos />
    <Promo />
    {items.length > 0 && <FeaturedItemsBand items={items} title={`${band.name} in the store`} />}
    <Links />
    <FeaturedArtistsBand except={slug} />
  </Page>
);
