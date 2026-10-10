import type { ReactNode } from "react";
import { Cased } from "../lib/Cased";

/**
 * A band is one small-range grid with one editorial job. Bands stack; they do
 * not nest. This wrapper adds the section landmark, a heading, the one-line
 * lesson, and a props readout — nothing else. The grid inside it is the
 * library's real API, used directly.
 *
 * `cap` limits the band's width; the grid is `width: 100%` of its parent with
 * an inline aspect-ratio, so height follows width. `kind` is the study's
 * register: `rule` bands draw hairlines between boxes with the library's
 * outline prop, `open` bands inset their content and draw none.
 */
export function Band({
  id, title, lesson, note, cap, kind = "open", children,
}: {
  id: string;
  title: string;
  lesson?: string;
  note?: string;
  cap?: string;
  kind?: "rule" | "open";
  children: ReactNode;
}) {
  return (
    <section className={`band ${kind}`} id={id} aria-labelledby={`${id}-title`}>
      <header className="band__header">
        <h2 id={`${id}-title`} className="band__title"><Cased>{title}</Cased></h2>
        {lesson && <p className="band__lesson">{lesson}</p>}
        {note && <p className="band__note">{note}{cap ? ` · width capped at ${cap}` : ""}</p>}
      </header>
      <div className="band__wrap" style={cap ? { maxWidth: cap } : undefined}>
        {children}
      </div>
    </section>
  );
}
