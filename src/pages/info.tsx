import { GoldenGrid, GoldenBox } from "@gifcommit/golden-grids";
import { mount } from "../main";
import { Page } from "../lib/Page";
import { Band } from "../bands/Band";
import { Fact } from "../lib/boxes";
import { pages } from "../data";
import { Prose } from "../lib/Prose";
import { NewsletterBand } from "../lib/modules";
import { Cased } from "../lib/Cased";

/** Contact, FAQ, jobs, links, street team: the label's involvement pages.
 *  The address gets a band; the rest are lists and prose, as they were. */
function Contact() {
  const pg = pages.contact;
  return (
    <>
      <Band id="contact" title="Contact" lesson="Demos and press kits to the P.O. box in Jackson; questions by email to the office; booking through each band's agent." note='from=1 to=3 · placement="bottom" · clockwise=true'>
        <GoldenGrid from={1} to={3} placement="bottom">
          <GoldenBox><Fact label="Mailing address" tone="ink">{"P.O. Box 1229\nJackson, NJ\n08527"}</Fact></GoldenBox>
          <GoldenBox><Fact label="Email" fitClass="fit--light" source="press · sales · street · design @nomilkrecords.com" spoken="press, sales, street and design, at nomilkrecords dot com">{"@nomilk\nrecords.com"}</Fact></GoldenBox>
          <GoldenBox><Fact label="Office" fitClass="fit--light">{"Red Bank,\nNew Jersey"}</Fact></GoldenBox>
        </GoldenGrid>
      </Band>
      <section className="list-band" aria-labelledby="contact-details-title">
        <header className="band__header"><h2 id="contact-details-title" className="band__title">Contact details</h2></header>
        {pg.sections.map((s) => <div key={s.title}><h3 className="band__title"><Cased>{s.title}</Cased></h3><Prose className="cell__body" html={s.blocks.map((b) => b.html).join("")} /></div>)}
      </section>
    </>
  );
}
function Faq() {
  const html = pages.faq.sections[0].blocks[0].html;
  const qa = [...html.matchAll(/<h1>(.*?)<\/h1>\s*<p>(.*?)<\/p>/gs)].map((m) => ({ q: m[1].replace(/<[^>]+>/g, ""), a: m[2] }));
  return (
    <section className="list-band" id="faq" aria-labelledby="faq-title">
      <header className="band__header"><h2 id="faq-title" className="band__title">F.A.Q.</h2><p className="band__lesson">Frequently asked questions, policy, facts: {qa.length} questions as the label answered them.</p></header>
      <ul className="list">{qa.map((x, i) => <li key={i}><details><summary>{x.q.replace(/^Q\.\s*/, "")}</summary><Prose html={`<p>${x.a.replace(/^A\.\s*/, "")}</p>`} /></details></li>)}</ul>
    </section>
  );
}
function Plain({ id, title, lesson }: { id: string; title: string; lesson?: string }) {
  const pg = pages[id];
  return (
    <section className="list-band" id={id} aria-labelledby={`${id}-title`}>
      <header className="band__header"><h2 id={`${id}-title`} className="band__title"><Cased>{title}</Cased></h2>{lesson && <p className="band__lesson">{lesson}</p>}</header>
      {pg.sections.map((s) => <div key={s.title}>{pg.sections.length > 1 && <h3 className="band__title"><Cased>{s.title}</Cased></h3>}<Prose className="cell__body" html={s.blocks.map((b) => b.html).join("")} /></div>)}
    </section>
  );
}
mount(
  <Page current="info.html" title="information" standfirst="How to reach the label, what it was asked most, who it worked with, and how to help.">
    <Contact />
    <Faq />
    <Plain id="jobs" title="Jobs & internships" lesson="Work for GIFmilk Records: the openings as posted." />
    <Plain id="street" title="Street team" lesson="Sign up, promote, flyer, sticker." />
    <Plain id="links" title="Links" lesson="The roster's own sites, the community, labels and distribution, composers, and the rest." />
    <NewsletterBand />
  </Page>
);
