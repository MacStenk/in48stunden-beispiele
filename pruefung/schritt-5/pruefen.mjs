// Abnahme Schritt 5: misst die gebauten Seiten in echtem Chrome (Debug-Protokoll, ohne Zusatzpakete).
// Aufruf: BASE=http://localhost:4392 DBG=http://localhost:9333 OUT=<Ordner> node pruefen.mjs
// Misst je Seite: Kontrast (gerenderte Farben), Tastatur (echte Tab-Ereignisse), Bewegung (mit/ohne
// prefers-reduced-motion), Links, Netzwerk, Überlauf am Handy, Grundstruktur. Schreibt messung.json und Bilder.
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4392';
const DBG = process.env.DBG ?? 'http://localhost:9333';
const OUT = process.env.OUT ?? '.';
mkdirSync(`${OUT}/roh`, { recursive: true });

const SEITEN = ['/', '/beispiel-1/', '/beispiel-1/impressum/', '/beispiel-1/datenschutz/',
  '/beispiel-2/', '/beispiel-2/impressum/', '/beispiel-2/datenschutz/',
  '/beispiel-3/', '/beispiel-3/impressum/', '/beispiel-3/datenschutz/'];
const name = (s) => (s === '/' ? 'uebersicht' : s.replaceAll('/', ' ').trim().replaceAll(' ', '-'));
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

class Cdp {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.offen = new Map(); this.hoerer = [];
    ws.onmessage = (m) => {
      const d = JSON.parse(m.data);
      if (d.id && this.offen.has(d.id)) {
        const { res, rej } = this.offen.get(d.id); this.offen.delete(d.id);
        d.error ? rej(new Error(`${d.error.message}`)) : res(d.result);
      } else if (d.method) this.hoerer.forEach((h) => h(d));
    };
  }
  send(method, params = {}) { return new Promise((res, rej) => { const id = ++this.id; this.offen.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  on(h) { this.hoerer.push(h); }
}

async function neuerTab() {
  const t = await (await fetch(`${DBG}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  return { cdp: new Cdp(ws), id: t.id };
}
async function schliesse(id) { await fetch(`${DBG}/json/close/${id}`); }

async function ev(cdp, ausdruck) {
  const r = await cdp.send('Runtime.evaluate', { expression: ausdruck, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'Fehler in Seite');
  return r.result.value;
}

async function taste(cdp, key, code, vk, { shift = false, text } = {}) {
  const mod = shift ? 8 : 0;
  await cdp.send('Input.dispatchKeyEvent', { type: text ? 'keyDown' : 'rawKeyDown', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, modifiers: mod, ...(text ? { text } : {}) });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, modifiers: mod });
  await pause(120);
  await cdp.send('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression: `new Promise((res) => { let last = scrollY, ruhig = 0, n = 0; const t = setInterval(() => { n++; if (scrollY === last) { if (++ruhig >= 10) { clearInterval(t); res(); } } else { ruhig = 0; last = scrollY; } if (n > 120) { clearInterval(t); res(); } }, 50); })` });
}

// ---------- Funktionen, die IN der Seite laufen ----------
const HILFEN = `
const parse = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
const ueber = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
const lum = (c) => { const t = [c.r, c.g, c.b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2]; };
const verh = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const bgVon = (el) => { const stapel = []; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.backgroundImage !== 'none') return { bild: true }; const c = parse(cs.backgroundColor); if (c && c.a > 0) { stapel.push(c); if (c.a === 1) break; } } let basis = { r: 255, g: 255, b: 255, a: 1 }; for (let i = stapel.length - 1; i >= 0; i--) basis = ueber(stapel[i], basis); return basis; };
`;

const KONTRAST = `(() => { ${HILFEN}
  const aus = [];
  const sichtbar = (cs, r) => cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 2 && r.height > 2;
  const eintrag = (el, cs, text, pseudo, r) => {
    let bg = bgVon(el); if (bg.bild) { aus.push({ text, tag: el.tagName, pseudo, bild: true }); return; }
    if (pseudo) { const pb = parse(cs.backgroundColor); if (pb && pb.a > 0) bg = ueber(pb, bg); }
    let fg = parse(cs.color); fg = ueber(fg, bg);
    const fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight);
    const gross = fs >= 24 || (fs >= 18.66 && fw >= 700);
    const soll = gross ? 3 : 4.5, v = verh(fg, bg);
    aus.push({ text: text.slice(0, 40), tag: el.tagName.toLowerCase(), klasse: el.className || '', pseudo, fg: hex(fg), bg: hex(bg), verhaeltnis: Math.round(v * 100) / 100, soll, ok: v >= soll, gross, px: fs, gewicht: fw,
      x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height, bgSelf: hex(bg) });
  };
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (!sichtbar(cs, r) || ['SCRIPT','STYLE','SVG','PATH','CIRCLE','RECT'].includes(el.tagName.toUpperCase())) continue;
    const eigen = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (eigen) eintrag(el, cs, eigen, null, r);
    for (const p of ['::before', '::after']) {
      const pc = getComputedStyle(el, p), inh = pc.content;
      if (inh && inh !== 'none' && inh !== 'normal' && inh !== '""' && inh !== "''") eintrag(el, pc, 'Zeichen ' + inh, p, r);
    }
  }
  return aus; })()`;

const INFO_FOKUS = `(() => { ${HILFEN}
  const el = document.activeElement; if (!el || el === document.body) return { body: true };
  const cs = getComputedStyle(el), r = el.getBoundingClientRect();
  const umgebung = el.parentElement ? bgVon(el.parentElement) : { r: 255, g: 255, b: 255, a: 1 };
  const olc = parse(cs.outlineColor);
  const mitte = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return { tag: el.tagName.toLowerCase(), klasse: el.className || '', text: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 40), href: el.getAttribute('href'),
    fokusSichtbar: el.matches(':focus-visible'), outlineStil: cs.outlineStyle, outlineBreite: parseFloat(cs.outlineWidth), outlineAbstand: cs.outlineOffset, outlineFarbe: olc ? hex(olc) : cs.outlineColor,
    umgebung: umgebung.bild ? 'bild' : hex(umgebung), verhaeltnis: olc && !umgebung.bild ? Math.round(verh(olc, umgebung) * 100) / 100 : null,
    imFenster: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth,
    rahmenImFenster: (() => { const e = (parseFloat(cs.outlineOffset) || 0) + (parseFloat(cs.outlineWidth) || 0); return r.top - e >= -0.5 && r.bottom + e <= innerHeight + 0.5 && r.left - e >= -0.5 && r.right + e <= innerWidth + 0.5; })(), top: Math.round(r.top + scrollY), left: Math.round(r.left + scrollX), w: Math.round(r.width), h: Math.round(r.height),
    verdeckt: !(mitte === el || el.contains(mitte)), imInhalt: !!el.closest('#inhalt'), imKopf: !!el.closest('header'),
    nachSprungziel: !!(document.getElementById('inhalt') && (document.getElementById('inhalt').compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)) }; })()`;

const STRUKTUR = `(() => ({
  lang: document.documentElement.lang, titel: document.title, h1: document.querySelectorAll('h1').length,
  ueberschriften: [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => h.tagName.toLowerCase()).join(' '),
  main: document.querySelectorAll('main').length, nav: document.querySelectorAll('nav').length, kopf: document.querySelectorAll('header').length, fuss: document.querySelectorAll('footer').length,
  sprungmarke: !!document.querySelector('a.sprungmarke[href="#inhalt"]'), sprungziel: !!document.getElementById('inhalt'),
  bilderOhneAlt: [...document.querySelectorAll('img:not([alt])')].length, viewport: !!document.querySelector('meta[name=viewport]'),
  ueberlauf: document.documentElement.scrollWidth > document.documentElement.clientWidth, scrollBreite: document.documentElement.scrollWidth, fensterBreite: document.documentElement.clientWidth,
  animationen: document.getAnimations().length,
  bilder: [...document.querySelectorAll('svg, img, [role="img"], picture, canvas, video')].map((e) => { const v = e.closest('[aria-hidden="true"]'), t = e.querySelector(':scope > title');
    return { tag: e.tagName.toLowerCase(), klasse: e.getAttribute('class') || '', eltern: e.parentElement ? e.parentElement.tagName.toLowerCase() + '.' + (e.parentElement.getAttribute('class') || '') : '',
      versteckt: !!v, versteckerKlasse: v ? v.tagName.toLowerCase() + '.' + (v.getAttribute('class') || '') : null, alt: e.getAttribute('alt'), ariaLabel: e.getAttribute('aria-label'), titel: t ? t.textContent : null, role: e.getAttribute('role'), focusable: e.getAttribute('focusable') }; }),
  hintergrundBilder: [...document.querySelectorAll('body *')].filter((e) => getComputedStyle(e).backgroundImage !== 'none').map((e) => e.tagName.toLowerCase() + '.' + (e.getAttribute('class') || '')),
  links: [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.getAttribute('href'), text: (a.innerText || '').trim().slice(0, 30) })),
  ids: [...document.querySelectorAll('[id]')].map((e) => e.id) }))()`;

// ---------- Ablauf je Seite ----------
async function seite(pfad, breite, hoehe) {
  const { cdp, id } = await neuerTab();
  const netz = [], konsole = [];
  cdp.on((d) => {
    if (d.method === 'Network.responseReceived') netz.push({ url: d.params.response.url, status: d.params.response.status });
    if (d.method === 'Network.requestWillBeSent') netz.push({ url: d.params.request.url, angefragt: true });
    if (d.method === 'Log.entryAdded' && ['error', 'warning'].includes(d.params.entry.level)) konsole.push(d.params.entry.text);
    if (d.method === 'Runtime.exceptionThrown') konsole.push(d.params.exceptionDetails.text);
  });
  await cdp.send('Page.enable'); await cdp.send('Network.enable'); await cdp.send('Log.enable'); await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: breite, height: hoehe, deviceScaleFactor: 1, mobile: breite < 500 });
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  const geladen = new Promise((res) => cdp.on((d) => d.method === 'Page.loadEventFired' && res()));
  await cdp.send('Page.navigate', { url: BASE + pfad }); await geladen; await pause(400);
  const r = { pfad, breite, hoehe };

  r.struktur = await ev(cdp, STRUKTUR);
  r.kontrast = await ev(cdp, KONTRAST);
  r.netz = netz.filter((n) => !n.angefragt); r.netzAlleUrls = [...new Set(netz.map((n) => n.url))]; r.konsole = konsole;

  // Bild, ganze Seite
  const m = await cdp.send('Page.getLayoutMetrics');
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: m.cssContentSize.width, height: Math.ceil(m.cssContentSize.height), scale: 1 } });
  writeFileSync(`${OUT}/roh/${name(pfad)}-${breite}.png`, Buffer.from(shot.data, 'base64'));
  const oben = await cdp.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${OUT}/roh/${name(pfad)}-${breite}x${hoehe}.png`, Buffer.from(oben.data, 'base64'));

  // Tastatur: Tab durch die ganze Seite
  await cdp.send('Page.bringToFront'); await ev(cdp, 'window.scrollTo(0,0); document.activeElement && document.activeElement.blur(); 0');
  const reihe = []; let letzte = null;
  for (let i = 0; i < 40; i++) {
    await taste(cdp, 'Tab', 'Tab', 9);
    const info = await ev(cdp, INFO_FOKUS);
    if (info.body) { reihe.push({ ende: 'Fokus verlässt die Seite (kein Tastaturfang)' }); break; }
    const kennung = `${info.tag}|${info.href}|${info.text}`;
    if (kennung === letzte) { reihe.push({ ende: 'Fokus bleibt hängen' }); break; }
    letzte = kennung; reihe.push(info);
  }
  r.tab = reihe;
  // Sprungmarke: Enter, danach nächster Tab muss im Inhalt landen
  if (r.struktur.sprungmarke) {
    await ev(cdp, 'window.scrollTo(0,0); document.activeElement && document.activeElement.blur(); 0');
    await taste(cdp, 'Tab', 'Tab', 9); const erst = await ev(cdp, INFO_FOKUS);
    await taste(cdp, 'Enter', 'Enter', 13, { text: '\r' });
    const nachEnter = await ev(cdp, '({ hash: location.hash, scrollY: Math.round(scrollY) })');
    await taste(cdp, 'Tab', 'Tab', 9); const danach = await ev(cdp, INFO_FOKUS);
    r.sprung = { erstesFokusziel: `${erst.tag}.${erst.klasse}`, sichtbarBeiFokus: erst.imFenster, hash: nachEnter.hash, naechstesImInhalt: danach.imInhalt, naechstesNachSprungzielOhneKopf: danach.nachSprungziel && !danach.imKopf, naechstes: `${danach.tag} ${danach.text}` };
    // Shift+Tab: einen Schritt zurück
    await taste(cdp, 'Tab', 'Tab', 9, { shift: true }); const zurueck = await ev(cdp, INFO_FOKUS);
    r.sprung.shiftTabZiel = `${zurueck.tag} ${zurueck.text || zurueck.klasse}`;
  }

  // Bewegung: mit und ohne Einstellung
  r.bewegung = {};
  for (const modus of ['no-preference', 'reduce']) {
    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: modus }] });
    await pause(100);
    const stil = await ev(cdp, `(() => { const k = document.querySelector('.knopf'), n = document.querySelector('.kopf nav a'), f = document.querySelector('.fuss-links a');
      const td = (e) => e ? getComputedStyle(e).transitionDuration : null;
      return { scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior, knopf: td(k), nav: td(n), fuss: td(f), animationen: document.getAnimations().length }; })()`);
    const scroll = await ev(cdp, `(async () => { scrollTo(0, 0); await new Promise((r) => setTimeout(r, 80));
      const links = [...document.querySelectorAll('.kopf nav a')]; const a = links[links.length - 1]; if (!a) return null;
      if (a.pathname !== location.pathname || !document.querySelector(a.hash)) return { uebersprungen: 'Menülink führt auf andere Seite, kein Ziel auf dieser Seite' };
      const ziel = Math.round(Math.min(document.querySelector(a.hash).getBoundingClientRect().top + scrollY, document.documentElement.scrollHeight - innerHeight));
      a.click(); const t0 = performance.now(); const s0 = Math.round(scrollY); await new Promise((r) => setTimeout(r, 60)); const s1 = Math.round(scrollY);
      let dauer = null, ruhig = 0;
      await new Promise((res) => { const iv = setInterval(() => { const t = performance.now() - t0; if (Math.abs(scrollY - ziel) <= 1) { if (++ruhig >= 3) { dauer = Math.round(t - 30); clearInterval(iv); res(); } } else ruhig = 0; if (t > 3500) { clearInterval(iv); res(); } }, 10); });
      return { ziel, sofort: s0, nach60ms: s1, dauerMs: s0 === ziel ? 0 : dauer, endeY: Math.round(scrollY), href: a.getAttribute('href') }; })()`);
    // Hover: Farbverlauf des Knopfes
    let hover = null;
    const pos = await ev(cdp, `(() => { const k = document.querySelector('.knopf'); if (!k) return null; k.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = k.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
    if (pos) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 5 }); await pause(700);
      const vorher = await ev(cdp, `getComputedStyle(document.querySelector('.knopf')).backgroundColor`);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pos.x, y: pos.y });
      await pause(25); const bei25 = await ev(cdp, `getComputedStyle(document.querySelector('.knopf')).backgroundColor`);
      await pause(700); const bei725 = await ev(cdp, `getComputedStyle(document.querySelector('.knopf')).backgroundColor`);
      hover = { vorher, nach25ms: bei25, nach725ms: bei725 };
    }
    r.bewegung[modus] = { stil, scroll, hover };
  }
  await schliesse(id);
  return r;
}

const alle = [];
for (const s of SEITEN) {
  for (const [b, h] of [[1440, 900], [390, 844]]) {
    process.stderr.write(`messe ${s} ${b}x${h}\n`);
    alle.push(await seite(s, b, h));
  }
}
writeFileSync(`${OUT}/messung.json`, JSON.stringify(alle, null, 1));
console.log('fertig:', alle.length, 'Messläufe');
process.exit(0);
