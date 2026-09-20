// Linkprüfung: alle Links aller Seiten (aus messung.json), interne Ziele abrufen, Sprungmarken und Adressen prüfen,
// Erreichbarkeit aller Seiten von der Übersicht aus. Aufruf: BASE=http://localhost:4392 OUT=<Ordner> node links.mjs
import { readFileSync } from 'node:fs';
const BASE = process.env.BASE ?? 'http://localhost:4392', OUT = process.env.OUT ?? '.';
const daten = JSON.parse(readFileSync(`${OUT}/messung.json`, 'utf8')).filter((d) => d.breite === 1440);
const html = new Map();
const hole = async (pfad) => { if (!html.has(pfad)) { const r = await fetch(BASE + pfad); html.set(pfad, { status: r.status, typ: r.headers.get('content-type'), text: r.status === 200 ? await r.text() : '' }); } return html.get(pfad); };
const kanten = new Map(); const zeilen = []; let schlecht = 0, gesamt = 0;
for (const d of daten) {
  for (const l of d.struktur.links) {
    gesamt++;
    let urteil = 'ok', detail = '';
    if (l.href.startsWith('mailto:')) { const a = l.href.slice(7); const ok = /^[^@\s]+@example\.org$/.test(a); urteil = ok ? 'ok' : 'FEHLER'; detail = `Adresse ${a}${ok ? ' (example.org)' : ' (nicht example.org)'}`; }
    else if (l.href.startsWith('tel:')) { const ok = /^tel:0+$/.test(l.href); urteil = ok ? 'ok' : 'FEHLER'; detail = `Nummer ${l.href.slice(4)}${ok ? ' (nur Nullen)' : ''}`; }
    else if (/^https?:/.test(l.href)) { urteil = 'FEHLER'; detail = 'fremde Adresse'; }
    else {
      const u = new URL(l.href, BASE + d.pfad); const ziel = u.pathname;
      const seite = await hole(ziel);
      if (seite.status !== 200) { urteil = 'FEHLER'; detail = `Status ${seite.status}`; }
      else {
        detail = `Status 200 ${ziel}`;
        if (u.hash) { const id = u.hash.slice(1); const da = seite.text.includes(`id="${id}"`); if (!da) { urteil = 'FEHLER'; detail += `, Sprungziel #${id} fehlt`; } else detail += `, Sprungziel #${id} vorhanden`; }
        if (!kanten.has(d.pfad)) kanten.set(d.pfad, new Set()); kanten.get(d.pfad).add(ziel);
      }
    }
    if (urteil !== 'ok') schlecht++;
    zeilen.push({ seite: d.pfad, href: l.href, text: l.text, urteil, detail });
  }
}
// Erreichbarkeit von der Übersicht aus (über interne Links)
const gesehen = new Set(['/']); const schlange = ['/'];
while (schlange.length) { const p = schlange.shift(); for (const z of kanten.get(p) ?? []) if (!gesehen.has(z)) { gesehen.add(z); schlange.push(z); } }
const alle = daten.map((d) => d.pfad);
console.log(`Links geprüft: ${gesamt}, Fehler: ${schlecht}`);
for (const z of zeilen.filter((z) => z.urteil !== 'ok')) console.log('FEHLER', z.seite, z.href, z.detail);
const je = {}; for (const z of zeilen) { je[z.seite] ??= { ok: 0, fehler: 0 }; je[z.seite][z.urteil === 'ok' ? 'ok' : 'fehler']++; }
for (const [s, v] of Object.entries(je)) console.log(`  ${s.padEnd(26)} Links ok: ${v.ok}, Fehler: ${v.fehler}`);
console.log('Von der Übersicht erreichbar:', [...gesehen].length, 'von', alle.length, 'Seiten; nicht erreichbar:', alle.filter((p) => !gesehen.has(p)));
console.log('Sprungziele und Ziele im Beispiel (Auszug):'); for (const z of zeilen.filter((z) => z.seite === '/beispiel-3/').slice(0, 12)) console.log('  ', z.href.padEnd(28), z.detail);
process.exit(0);
