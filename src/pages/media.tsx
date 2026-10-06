import { GoldenGrid, GoldenBox } from "@gifcommit/golden-grids";
import type { PlacementValue } from "@gifcommit/golden-grids";
import { mount } from "../main";
import { Page } from "../lib/Page";
import { Band } from "../bands/Band";
import { useViewport, pick } from "../lib/viewport";
import { useExpandGroup, ExpandedCell } from "../lib/expand";
import { Player } from "../lib/clip";
import { Fact } from "../lib/boxes";
import { asset, pages, bands, BAND_ORDER } from "../data";
import { Prose } from "../lib/Prose";

/** Media: buddy icons, wallpapers, banners, video, podcast. The icons are
 *  the one content on the site that was already square. */
function imgs(slug: string) {
  const pg = pages[slug]; if (!pg) return [];
  const html = pg.sections.flatMap((s) => s.blocks.map((b) => b.html)).join(" ");
  const links = [...html.matchAll(/<a href="(nmr\/[^"]+\.(?:jpg|gif))"/g)].map((m) => m[1]);
  return [...html.matchAll(/<img src="([^"]+)" alt="([^"]*)"/g)].map((m, i) => ({ src: m[1], alt: m[2], full: links[i] ?? m[1] }));
}

function Icons() {
  const x = useExpandGroup();
  const all = BAND_ORDER.flatMap((s) => imgs(`icons_${s}`).map((i) => ({ ...i, band: bands[s].name })));
  // Eight squares a band, seven icons and a word; three bands carry 21 of
  // the 50-odd icons and the rest open from the band pages. The smallest
  // square of eight is 40px at 1440, which is about the icons' own size.
  // Two squares of type and six icons a band: the 520px second square is
  // too big for a 50px icon, the 320px third is as far as pixel art goes.
  const words: [string, string, string][] = [["Buddy\nicons", "AIM · AOL · instant messenger", `${all.length}\nicons`], ["Click,\nsave,\nset", "Download instructions, 2005", "50\n× 50"], ["Away\nmessage", "The roster, pixel by pixel", "2005\n–07"]];
  return (
    <>
      {words.map(([word, label, second], w) => {
        const shown = all.slice(w * 6, w * 6 + 6);
        const placement = (["right", "left", "right"] as PlacementValue[])[w]; // even count: right/left for landscape
        return (
          <Band key={w} id={w === 0 ? "icons" : `icons-${w + 1}`} title={w === 0 ? "Buddy icons" : `Buddy icons · ${shown[0]?.band ?? ""}`} lesson={w === 0 ? `${all.length} AIM buddy icons across the roster, 50 pixels square, animated GIFs most of them: a logo, a cover, a lyric, a face. They are the one thing on the old site that was already a square.` : `${shown.map((i) => i.alt.replace(/ Buddy Icon$/i, "")).filter(Boolean).join(" · ")}.`} note={`from=1 to=8 · placement="${placement}" · clockwise=${w !== 1} · type in the two largest squares, icons in the rest`}>
            <GoldenGrid from={1} to={8} placement={placement} clockwise={w !== 1}>
              <GoldenBox><Fact label={label} tone={w === 1 ? undefined : "ink"}>{word}</Fact></GoldenBox>
              <GoldenBox><Fact label={w === 0 ? "Across the roster" : w === 1 ? "Pixels" : "Years"} fitClass="fit--num" tone={w === 1 ? "ink" : undefined}>{second}</Fact></GoldenBox>
              {shown.map((im, i) => {
                const key = `ic${w}-${i}`;
                return (
                  <GoldenBox key={key} {...x.boxProps(key)}>
                    <figure className="media media--contain">
                      <img src={asset(im.src)} alt={im.alt} loading="lazy" style={{ imageRendering: "pixelated" }} />
                      <button className="media__open" {...x.triggerProps(key)}><span className="visually-hidden">Open {im.alt || "buddy icon"}</span></button>
                    </figure>
                    {x.isOpen(key) && (
                      <ExpandedCell id={x.panelId(key)} title={im.alt || "Buddy icon"} onClose={x.close} closeRef={x.closeRef}>
                        <img src={asset(im.src)} alt="" width={200} height={200} style={{ imageRendering: "pixelated", border: "1px solid var(--ink-soft)" }} />
                        <p className="cell__source">{im.band} · 50×50 · <a href={asset(im.src)} download>Download</a></p>
                      </ExpandedCell>
                    )}
                  </GoldenBox>
                );
              })}
            </GoldenGrid>
          </Band>
        );
      })}
    </>
  );
}

function Wallpapers() {
  const viewport = useViewport(); const x = useExpandGroup();
  const all = BAND_ORDER.flatMap((s) => imgs(`wallpapers_${s}`).map((i) => ({ ...i, band: bands[s].name })));
  const n = Math.min(all.length, pick(viewport, { mobile: 5, tablet: 8, desktop: 8 }));
  const shown = all.slice(0, n);
  return (
    <Band id="wallpapers" title="Wallpapers" lesson={`${all.length} desktop wallpapers, 800×600 to 1280×1024, each on the band's page as a thumbnail. Open one to see it whole and download it.`} note={`from=1 to=${n} · placement="bottom" · clockwise=false · ${n} of ${all.length}`}>
      <GoldenGrid from={1} to={n} placement="bottom" clockwise={false}>
        {shown.map((im, i) => {
          const key = `w${i}`;
          return (
            <GoldenBox key={key} {...x.boxProps(key)}>
              <figure className="media">
                <img src={asset(im.full)} alt={im.alt} loading="lazy" />
                <button className="media__open" {...x.triggerProps(key)}><span className="visually-hidden">Open {im.alt || "wallpaper"}</span></button>
                <figcaption className="media__caption">{im.band}</figcaption>
              </figure>
              {x.isOpen(key) && (
                <ExpandedCell id={x.panelId(key)} title={im.alt || "Wallpaper"} onClose={x.close} closeRef={x.closeRef}>
                  <img src={asset(im.full)} alt="" loading="lazy" style={{ maxWidth: "100%", height: "auto", display: "block", border: "1px solid var(--ink-soft)" }} />
                  <p className="cell__source">{im.band} · <a href={asset(im.full)} download>Download</a></p>
                </ExpandedCell>
              )}
            </GoldenBox>
          );
        })}
      </GoldenGrid>
    </Band>
  );
}

const VIDEOS = [
  { clip: "nmr/media/video/hx/sydney_clip.mp4", poster: "nmr/media/video/hx/sydney_poster.jpg", video: "nmr/media/video/hx/sydney_320x240.mp4", title: "Halifax, “Sydney”", note: "Music video, directed by Greg Edgerton. No Milk / Drive-Thru." },
  { clip: "nmr/media/video/tbr/u2_clip.mp4", poster: "nmr/media/video/tbr/u2_poster.jpg", video: "nmr/media/video/tbr/u2_320x240.mp4", title: "The Bank Robbers, live", note: "Live footage." },
  { clip: "nmr/media/video/tbr/may2004_clip.mp4", poster: "nmr/media/video/tbr/may2004_poster.jpg", video: "nmr/media/video/tbr/may2004_320x240.mp4", title: "The Bank Robbers, May 2004", note: "Footage from May 2004." },
];
function Video() {
  return (
    <Band id="video" title="Video" lesson="Three QuickTime files, offered then at 320×240 for cable and 160×120 for dial-up, re-encoded so they play here: Halifax's “Sydney” video and two Bank Robbers clips. A few seconds loop in each square; press play for the whole thing." note='from=1 to=3 · placement="top" · clockwise=true · clip in the square, the film on request'>
      <GoldenGrid from={1} to={3} placement="top">
        {VIDEOS.map((v) => <GoldenBox key={v.video}><Player clip={asset(v.clip)} poster={asset(v.poster)} alt={v.title} title={v.title} video={asset(v.video)} /></GoldenBox>)}
      </GoldenGrid>
    </Band>
  );
}
function Banners() {
  const all = ["tbr", "hx", "nhe", "nmr", "ro", "sa", "so", "to", "arr"].flatMap((s) => imgs(`banners_${s}`));
  if (!all.length) return null;
  const n = Math.min(all.length, 5);
  return (
    <Band id="banners" title="Banner ads" lesson={`${all.length} banners for other sites to post, 468×60 and 185×50, animated.`} note={`from=1 to=${n} · placement="left" · clockwise=true`}>
      <GoldenGrid from={1} to={n} placement="left">
        {all.slice(0, n).map((im, i) => <GoldenBox key={i}><figure className="media media--contain"><img src={asset(im.src)} alt={im.alt} loading="lazy" /></figure></GoldenBox>)}
      </GoldenGrid>
    </Band>
  );
}
function Podcast() {
  const sec = pages.podcast.sections[0];
  return (
    <section className="list-band" id="podcast" aria-labelledby="podcast-title">
      <header className="band__header"><h2 id="podcast-title" className="band__title">Podcast</h2><p className="band__lesson">Late Night Office Hours with Edgemin & Kyse: the label's online radio show, and the instructions it gave for subscribing in 2006.</p></header>
      <Prose className="cell__body" html={sec.blocks.map((b) => b.html).join("")} />
    </section>
  );
}
mount(
  <Page current="media.html" title="media" standfirst="Buddy icons, wallpapers, banners, video and the podcast: what the label made for fans to take away.">
    <Icons /><Wallpapers /><Video /><Banners /><Podcast />
  </Page>
);
