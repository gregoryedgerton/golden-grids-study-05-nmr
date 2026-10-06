import { useRef, useState } from "react";
import { GoldenGrid, GoldenBox } from "@gifcommit/golden-grids";
import type { PlacementValue } from "@gifcommit/golden-grids";
import { useViewport, pick } from "./viewport";
import { useExpandGroup, ExpandedCell } from "./expand";
import { Fact } from "./boxes";
import { Fit } from "./fit";
import { Prose } from "./Prose";
import { Band } from "../bands/Band";
import { asset, bands, BAND_ORDER, store, audio, releases, brief, type Post, type Item, type Song, type Release } from "../data";

/**
 * The modules the original repeated in its side columns on every page:
 * featured artists, featured items, top downloads, the newsletter, the
 * radio players. Here they are bands of their own, placed where a page
 * wants a break, as the site placed them beside everything.
 */

export function FeaturedArtistsBand({ except }: { except?: string }) {
  const viewport = useViewport();
  const roster = BAND_ORDER.filter((s) => s !== except);
  const [to, placement] = pick<readonly [number, PlacementValue]>(viewport, { mobile: [4, "top"], tablet: [6, "left"], desktop: [6, "left"] });
  return (
    <Band id="featured-artists" title="Featured artists" lesson="The roster in 2007: No Hollywood Ending with a new record in stores, Lady Fantastic writing one, The Bank Robbers and Sleepaway on the road; Halifax and Socratic as alumni; All Rights Reserved, rest in peace." note={`from=1 to=${to} · placement="${placement}" · clockwise=true`}>
      <GoldenGrid from={1} to={to} placement={placement}>
        {roster.map((s) => {
          const b = bands[s];
          return (
            <GoldenBox key={s}>
              <a className="media" href={`./band-${s}.html`} aria-label={b.name}>
                <img src={asset(b.photo)} alt={`${b.name}, promotional photograph`} loading="lazy" />
                <p className="media__caption">{b.name}</p>
              </a>
            </GoldenBox>
          );
        })}
      </GoldenGrid>
    </Band>
  );
}

export function FeaturedItemsBand({ items, title = "Featured items" }: { items?: Item[]; title?: string }) {
  const viewport = useViewport();
  const x = useExpandGroup();
  const list = (items ?? store.filter((i) => i.image && i.price)).slice(0, 5);
  const [to, placement] = pick<readonly [number, PlacementValue]>(viewport, { mobile: [3, "top"], tablet: [5, "bottom"], desktop: [5, "bottom"] });
  return (
    <Band id="featured-items" title={title} lesson="From the store: CDs, shirts, buttons and posters, most of them marked down for the summer sale. Orders took two to three weeks; the staff was small." note={`from=1 to=${to} · placement="${placement}" · clockwise=true`}>
      <GoldenGrid from={1} to={to} placement={placement}>
        {list.map((i) => <GoldenBox key={i.code} {...x.boxProps(i.code)}><ItemCard item={i} x={x} /></GoldenBox>)}
      </GoldenGrid>
    </Band>
  );
}

/** The contents of a store item's square. Only a direct GoldenBox counts as
 *  a GoldenGrid child, so these card components return the INSIDE of the
 *  box and the band wraps each in <GoldenBox {...x.boxProps(key)}>. */
/** The price as the store printed it: "$5.00 SALE!!!" is a sale price. */
export function priceOf(item: Item) {
  if (!item.price) return { amount: null as string | null, sale: false };
  const m = item.price.match(/\$[\d.]+/);
  return { amount: m ? m[0] : item.price, sale: /sale/i.test(item.price) };
}

export function ItemCard({ item, x }: { item: Item; x: ReturnType<typeof useExpandGroup> }) {
  const key = item.code;
  const { amount, sale } = priceOf(item);
  return (
    <>
      <figure className="media media--contain product">
        {item.image && <img src={asset(item.image)} alt={item.imageAlt || `${item.band} ${item.title}`} loading="lazy" />}
        <button className="media__open" {...x.triggerProps(key)}><span className="visually-hidden">Open {item.band} {item.title}</span></button>
        {sale && <span className="product__tag" aria-hidden="true">Sale</span>}
        {!amount && <span className="product__tag product__tag--out" aria-hidden="true">Sold out</span>}
        <figcaption className="media__caption"><span className="product__price">{amount ?? "—"}</span> {item.band} · {item.kind}</figcaption>
      </figure>
      {x.isOpen(key) && (
        <ExpandedCell id={x.panelId(key)} title={`${item.band} · ${item.title}`} onClose={x.close} closeRef={x.closeRef}>
          <ProductView item={item} />
        </ExpandedCell>
      )}
    </>
  );
}

/**
 * The product page, as a store of the time had it: the picture large, the
 * name and price, a size and a quantity, Add to cart, and what is in
 * stock. The store took PayPal to the label's address; the checkout is
 * retired, so the button is present and disabled and says why.
 */
export function ProductView({ item }: { item: Item }) {
  const { amount, sale } = priceOf(item);
  const sizes = item.sizes;
  const available = amount !== null;
  return (
    <div className="product-view">
      <figure className="product-view__media">
        {item.image && <img src={asset(item.image)} alt={item.imageAlt || `${item.band} ${item.title}`} />}
      </figure>
      <form className="product-view__form" onSubmit={(e) => e.preventDefault()} aria-describedby={`${item.code}-note`}>
        <p className="product-view__band">{item.band}</p>
        <h4 className="product-view__title">{item.title}</h4>
        <p className="product-view__price">
          {amount ? <><span className="product-view__amount">{amount}</span>{sale && <span className="product-view__sale">Summer sale</span>}</> : <span className="product-view__amount product-view__amount--out">Sold out</span>}
        </p>
        {item.description.map((p, i) => <p key={i} className="product-view__copy">{p}</p>)}
        <dl className="product-view__facts">
          <div><dt>Item</dt><dd>{item.code}</dd></div>
          <div><dt>Type</dt><dd>{item.kind}</dd></div>
          <div><dt>Availability</dt><dd>{available ? (sizes.length ? `In stock: ${sizes.join(", ")}` : "In stock") : "Sold out"}</dd></div>
          <div><dt>Shipping</dt><dd>2–3 weeks to process, fill, pack and ship</dd></div>
        </dl>
        <div className="product-view__controls">
          {sizes.length > 0 && (
            <label>Size
              <select name="size" defaultValue="" disabled={!available}>
                <option value="">Choose a size</option>
                {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          )}
          <label>Quantity<input type="number" name="qty" min={1} max={9} defaultValue={1} disabled={!available} /></label>
          <button type="submit" className="btn btn--buy" disabled aria-disabled="true">{available ? "Add to cart" : "Sold out"}</button>
        </div>
        <p id={`${item.code}-note`} className="cell__source">The store's PayPal checkout was retired with the label in 2007; the button is here as it was, and does nothing.</p>
      </form>
    </div>
  );
}

/**
 * A song in a square, playable at every size. The native player needs
 * about 260px; below that the square gets a single play/pause control and
 * the time, driven by the same <audio>. One song plays at a time.
 */
export function SongCard({ song, label }: { song: Song; label?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState("");
  const toggle = () => {
    const a = ref.current; if (!a) return;
    if (a.paused) { document.querySelectorAll("audio").forEach((o) => { if (o !== a) o.pause(); }); a.play().catch(() => {}); } else a.pause();
  };
  const fmt = (t: number) => (isFinite(t) ? `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}` : "");
  return (
    <div className="box song">
      <p className="box__label">{label ?? song.band}</p>
      <div className="box__fit"><Fit as="p" max={120}>{song.song}</Fit></div>
      <audio ref={ref} className="box__audio" controls preload="none" src={asset(song.file)} aria-label={`${song.band}, ${song.song}`}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(`${fmt(e.currentTarget.currentTime)}${isFinite(e.currentTarget.duration) ? ` / ${fmt(e.currentTarget.duration)}` : ""}`)} />
      <button type="button" className="song__play" onClick={toggle} aria-label={`${playing ? "Pause" : "Play"} ${song.song} by ${song.band}`} aria-pressed={playing}>
        <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>{time && <span className="song__time">{time}</span>}
      </button>
    </div>
  );
}

export function DownloadsBand({ songs, title = "Top downloads", lesson }: { songs?: Song[]; title?: string; lesson?: string }) {
  const viewport = useViewport();
  const list = (songs ?? audio).slice(0, 4);
  const [to, placement] = pick<readonly [number, PlacementValue]>(viewport, { mobile: [3, "bottom"], tablet: [4, "right"], desktop: [4, "right"] });
  return (
    <Band id="downloads" title={title} lesson={lesson ?? "MP3s the label gave away: a song or two from each record. Right-click and save, the page said; here they play."} note={`from=1 to=${to} · placement="${placement}" · clockwise=true · <audio> in each square`}>
      <GoldenGrid from={1} to={to} placement={placement}>
        {list.map((s) => <GoldenBox key={s.file}><SongCard song={s} /></GoldenBox>)}
      </GoldenGrid>
    </Band>
  );
}

export function NewsletterBand() {
  const viewport = useViewport();
  const single = viewport === "mobile";
  // The form needs the room at 820, where a unit square is 257px; at 1440
  // the type takes the hero and the form has 453px in the square beside it.
  const typeHero = viewport === "desktop";
  return (
    <Band id="newsletter" title="NMR newsletter" lesson="Name and email, for news on shows and releases; the original went to a mailing list run from the label's office. Nothing is sent from here." note={`from=1 to=${single ? 1 : 3} · placement="bottom" · clockwise=false · type fills the hero`}>
      <GoldenGrid from={1} to={single ? 1 : 3} placement="bottom" clockwise={false}>
        {!single && typeHero && <GoldenBox><Fact label="No Milk Records" tone="ink">{"Hype,\ngossip,\nshows"}</Fact></GoldenBox>}
        <GoldenBox>
          <div className="box">
            <p className="box__label">Sign up</p>
            <form className="form" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="nl-name">Name</label><input id="nl-name" name="name" autoComplete="off" />
              <label htmlFor="nl-email">E-mail</label><input id="nl-email" name="email" type="email" autoComplete="off" />
              <button className="btn" type="submit">Subscribe</button>
              <p className="box__source">A demonstration; nothing is sent.</p>
            </form>
          </div>
        </GoldenBox>
        {!single && !typeHero && <GoldenBox><Fact label="No Milk Records" tone="ink">{"Hype,\ngossip,\nshows"}</Fact></GoldenBox>}
        <GoldenBox>
          <Fact label="Since 2005" fitClass="fit--light">{"Jackson,\nNew Jersey"}</Fact>
        </GoldenBox>
      </GoldenGrid>
    </Band>
  );
}

/** A news post as a card: date, the title fitted, the first lines, More for the rest. */
export function PostCard({ post, x, k }: { post: Post; x: ReturnType<typeof useExpandGroup>; k: string }) {
  const first = post.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return (
    <>
      <Fact
        label={post.date}
        body={<><p className="box__body--short">{brief(first, 140)}</p><p className="box__body--long">{brief(first, 380)}</p></>}
        source={post.by ? `posted by ${post.by}` : undefined}
        expand={{ group: x, slotKey: k, title: `${post.date} · ${post.title}`, full: <Prose className="cell__body" html={post.html} />, source: post.by ? `Posted by ${post.by}.` : undefined }}
      >
        {post.title}
      </Fact>
    </>
  );
}

export function ReleaseCard({ r, x }: { r: Release; x: ReturnType<typeof useExpandGroup> }) {
  const key = r.catalog;
  return (
    <>
      <figure className="media media--contain" id={key.toLowerCase()}>
        {r.cover && <img src={asset(r.cover)} alt={r.coverAlt} loading="lazy" />}
        <button className="media__open" {...x.triggerProps(key)}><span className="visually-hidden">Open {r.band}, {r.title}</span></button>
        <figcaption className="media__caption">{r.catalog} · {r.band}</figcaption>
      </figure>
      {x.isOpen(key) && (
        <ExpandedCell id={x.panelId(key)} title={`${r.catalog} · ${r.band} · ${r.title}`} onClose={x.close} closeRef={x.closeRef}>
          <div className="cell__body">
            {r.facts.map((f) => <p key={f}><strong>{f}</strong></p>)}
            {r.description.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </ExpandedCell>
      )}
    </>
  );
}

export const releasesOf = (bandName: string) => releases.filter((r) => r.band.toLowerCase() === bandName.toLowerCase());
