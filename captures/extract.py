#!/usr/bin/env python3
"""Turn the crawled nmr.gifcommit.com pages into src/data/site.json.

Each page is #left | #middle | #right. The middle column is the page's own
content, as runs of <div id="sectiontitle"><h1>…</h1></div> followed by
sectionpost / sectionitem blocks. Those blocks are kept as sanitised HTML
(p, br, a, strong, em, img, lists, tables) with asset URLs rewritten to the
mirrored copies under public/nmr/. News archives are split into posts.
  python3 captures/extract.py <dir of .shtml> > src/data/site.json
"""
import re, sys, json, glob, html, os, urllib.parse

SRC = sys.argv[1]
def local(u):
    u = u.replace('https://','http://')
    for host, folder in [('http://nmr-media.gifcommit.com/','nmr/media/'),('http://nmr-ffs.gifcommit.com/','nmr/ffs/'),('http://nmr.gifcommit.com/','nmr/site/'),('http://www.nomilkrecords.com/','nmr/old/')]:
        if u.startswith(host): return folder + u[len(host):]
    if u.startswith(('images/','standard/')): return 'nmr/site/' + u
    return u

ALLOWED = {'p','br','a','strong','em','b','i','img','ul','ol','li','h1','h2','h3','table','tr','td','th','tbody','span'}
def sanitize(frag):
    frag = re.sub(r'<(script|style|form|input|object|embed|iframe).*?</\1>', '', frag, flags=re.S|re.I)
    frag = re.sub(r'<(input|form|/form)[^>]*>', '', frag, flags=re.I)
    def tag(m):
        name = m.group(1).lower().lstrip('/'); closing = m.group(1).startswith('/')
        if name not in ALLOWED: return ''
        if closing: return f'</{name}>'
        attrs = m.group(2) or ''
        keep = []
        if name == 'a':
            h = re.search(r'href\s*=\s*["\']([^"\']+)["\']', attrs, re.I)
            if h:
                href = h.group(1).strip()
                if href.endswith('.shtml') and '://' not in href or href.startswith('http://nmr.gifcommit.com/'):
                    href = 'page:' + href.replace('http://nmr.gifcommit.com/','').replace('.shtml','')
                elif re.search(r'\.(mp3|jpg|gif|png|zip|mov|wmv)$', href, re.I): href = local(href)
                keep.append(f'href="{html.escape(href, quote=True)}"')
        if name == 'img':
            s = re.search(r'src\s*=\s*["\']([^"\']+)["\']', attrs, re.I); a = re.search(r'alt\s*=\s*["\']([^"\']*)["\']', attrs, re.I)
            if s: keep.append(f'src="{html.escape(local(s.group(1).strip()), quote=True)}"')
            keep.append(f'alt="{html.escape(a.group(1), quote=True) if a else ""}"')
        return f'<{name}{" " + " ".join(keep) if keep else ""}>'
    frag = re.sub(r'<(/?[a-zA-Z0-9]+)([^>]*)>', tag, frag)
    frag = re.sub(r'(?:\s*<br>\s*){3,}', '<br><br>', frag)
    frag = re.sub(r'<p>\s*</p>', '', frag)
    frag = re.sub(r'<(ul|ol)>((?:(?!<li>).)*?)</\1>', r'\2', frag, flags=re.S)  # a list with no items is not a list
    return frag.strip()

def text(frag):
    t = re.sub(r'<[^>]+>', ' ', frag); t = html.unescape(t); return re.sub(r'\s+', ' ', t).strip()

def middle(doc):
    i = doc.find('<div id="middle">'); j = doc.find('<div id="right">', i)
    if i >= 0: return doc[i:j if j > 0 else None]
    # Store pages: two columns of their own, no sidebars.
    i = doc.find('<div id="storeleft">'); j = doc.find('<div id="footer">', i)
    return doc[i:j if j > 0 else None] if i >= 0 else ''

def sections(mid):
    out = []
    parts = re.split(r'<div id="sectiontitle">\s*<h1>(.*?)</h1>\s*</div>', mid, flags=re.S)
    for k in range(1, len(parts), 2):
        title = text(parts[k]); body = parts[k+1]
        blocks = re.findall(r'<div id="(sectionpost|sectionitem|adpost)">(.*?)</div>\s*(?=<div id="section|<div id="adpost|$)', body, flags=re.S)
        out.append({'title': title, 'blocks': [{'kind': kd, 'html': sanitize(b), 'text': text(sanitize(b))} for kd, b in blocks]})
    return out

pages = {}
for f in sorted(glob.glob(os.path.join(SRC, '*.shtml'))):
    slug = os.path.basename(f)[:-6]
    doc = open(f, errors='ignore').read()
    t = re.search(r'<title>(.*?)</title>', doc, re.S)
    pages[slug] = {'title': html.unescape(t.group(1)).strip() if t else slug, 'sections': sections(middle(doc))}

def posts_from(sec_blocks):
    posts = []
    for b in sec_blocks:
        h = b['html']
        for m in re.finditer(r'<h2>(.*?)</h2>\s*<h1>(.*?)</h1>(.*?)(?=<h2>|$)', h, flags=re.S):
            body = m.group(3)
            by = re.search(r'<a href="mailto:[^"]*">posted by ([^<]+)</a>', body)
            body = re.sub(r'<a href="mailto:[^"]*">posted by [^<]+</a>', '', body)
            body = re.sub(r'(<br>\s*)+$', '', body.strip())
            posts.append({'date': text(m.group(1)), 'title': text(m.group(2)), 'html': body.strip(), 'by': by.group(1).strip() if by else None})
    return posts

news = []
for slug in ['news','07_05','07_02','06_11','06_09','06_08','06_07','06_06','06_05','06_04','06_02','06_01','05_11','05_10','05_09','05_08','05_07','05_06','05_05','05_04','05_03','05_02','05_01']:
    if slug not in pages: continue
    for s in pages[slug]['sections']:
        if 'news' in s['title'].lower() and 'archived' not in s['title'].lower():
            for p in posts_from(s['blocks']): p['source'] = slug; news.append(p)
seen = set(); dedup = []
for p in news:
    k = (p['date'], p['title'])
    if k in seen: continue
    seen.add(k); dedup.append(p)

BANDS = {'arr':'All Rights Reserved','tbr':'The Bank Robbers','hx':'Halifax','nhe':'No Hollywood Ending','ro':'Runaway Orange','sa':'Sleepaway','so':'Socratic','to':'Tourmaline','lf':'Lady Fantastic'}
bands = {}
for slug, name in BANDS.items():
    pg = pages.get(slug)
    if not pg: continue
    secs = pg['sections']
    b = {'slug': slug, 'name': name, 'title': pg['title'], 'members': [], 'bio': [], 'links': [], 'photo': f'nmr/media/photos/{slug}/promo_LR.jpg'}
    for s in secs:
        tl = s['title'].lower()
        joined = ' '.join(x['html'] for x in s['blocks'])
        if tl == name.lower() or tl == slug:
            # member lines: "Name - instrument"
            b['members'] = [text(x) for x in re.split(r'<br>|</p>', re.sub(r'<img[^>]*>', '', joined)) if ' - ' in text(x) and len(text(x)) < 60]
        elif tl == 'bio':
            b['bio'] = [text(p) for p in re.findall(r'<p>(.*?)</p>', joined, flags=re.S) if text(p)] or [t for t in re.split(r'<br>\s*<br>', joined) if text(t)]
            b['bio'] = [text(t) for t in b['bio']]
        elif 'link' in tl:
            b['links'] = [{'href': h, 'label': text(l), 'note': ''} for h, l in re.findall(r'<a href="([^"]+)">(.*?)</a>', joined)]
    bands[slug] = b

# Releases: the history table gives the order; each detail page gives the record.
releases = []
hist = pages['releases']['sections'][0]['blocks'][0]['html']
for slug in re.findall(r'href="page:(releases_[a-z0-9]+)"', hist):
    pg = pages.get(slug)
    if not pg: continue
    sec = next((x for x in pg['sections'] if re.match(r'^nmr', x['title'], re.I)), None)
    if not sec: continue
    h = sec['blocks'][0]['html']
    img = re.search(r'<img src="([^"]+)" alt="([^"]*)"', h)
    h1 = re.findall(r'<h1>(.*?)</h1>', h); h2 = re.findall(r'<h2>(.*?)</h2>', h)
    ps = [text(x) for x in re.findall(r'<p>(.*?)</p>', h, flags=re.S) if text(x) and '<img' not in x]
    releases.append({'slug': slug, 'catalog': sec['title'].upper(), 'cover': img.group(1) if img else None, 'coverAlt': img.group(2) if img else '',
                     'band': text(h1[0]) if h1 else '', 'title': text(h1[1]).strip('"') if len(h1) > 1 else '', 'facts': [text(x) for x in h2], 'description': ps,
                     'tracks': [text(x) for x in re.findall(r'<li>(.*?)</li>', h, flags=re.S)]})

# Tours: date / venue / bands, in the order listed.
tours = []
for sec in pages['tours']['sections']:
    if sec['title'].lower() != 'current shows': continue
    h = sec['blocks'][0]['html']
    for m in re.finditer(r'<h1>(.*?)</h1>\s*<h1>(.*?)</h1>\s*<p>(.*?)</p>', h, flags=re.S):
        tours.append({'date': text(m.group(1)), 'venue': text(m.group(2)), 'bands': text(m.group(3))})

# Store: every store_* page with a "selected item" block is one item.
store = []
for slug, pg in pages.items():
    if not slug.startswith('store_'): continue
    doc = open(os.path.join(SRC, slug + '.shtml'), errors='ignore').read()
    m = re.search(r'<div id="storepost">(.*?)<form', doc, flags=re.S)
    if not m: continue
    h = sanitize(m.group(1))
    img = re.search(r'<img src="([^"]+)" alt="([^"]*)"', h)
    h1 = [text(x) for x in re.findall(r'<h1>(.*?)</h1>', h)]
    price = next((x for x in h1 if '$' in x), None)
    ps = [text(x) for x in re.findall(r'<p>(.*?)</p>', h, flags=re.S) if text(x)]
    sizes = re.findall(r'<option value="([^"]+)">', doc[m.end():m.end() + 3000])
    kind = {'t': 'T-shirt', 'b': 'Button', 'p': 'Poster', 'h': 'Hat', 'z': 'Zip-up hoodie'}.get(slug[-1], 'CD')
    store.append({'slug': slug, 'code': slug.replace('store_', '').upper(), 'kind': kind, 'image': img.group(1) if img else None, 'imageAlt': img.group(2) if img else '',
                  'band': h1[0] if h1 else '', 'title': h1[1] if len(h1) > 1 else '', 'price': price, 'description': ps, 'sizes': [x for x in sizes if x and x != '---------------']})
store.sort(key=lambda x: x['code'])

# Audio: band / song / file, from the downloads page.
audio = []
for sec in pages['audio']['sections']:
    if 'download' not in sec['title'].lower(): continue
    h = sec['blocks'][0]['html']
    for m in re.finditer(r'<h1>(.*?)</h1>(.*?)(?=<h1>|$)', h, flags=re.S):
        band = text(m.group(1))
        for a, label in re.findall(r'<a href="(nmr/[^"]+\.mp3)">(.*?)</a>', m.group(2)):
            audio.append({'band': band, 'file': a, 'label': text(label), 'song': text(label)})

out = {'pages': pages, 'news': dedup, 'bands': bands, 'releases': releases, 'tours': tours, 'store': store, 'audio': audio}
json.dump(out, sys.stdout, ensure_ascii=False, indent=1)
