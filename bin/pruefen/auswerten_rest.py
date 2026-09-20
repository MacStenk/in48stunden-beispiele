# Wertet Tastatur, Bewegung, Links, Netzwerk und Struktur aus messung.json aus.
import json, os, sys
ordner = sys.argv[1]
daten = json.load(open(f'{ordner}/messung.json'))
print('== TASTATUR (Tab durch die ganze Seite, echte Tab-Ereignisse) ==')
print(f"{'Seite':26} {'Br.':>4} {'Stops':>5} {'Ende':38} {'ohne sichtb.':>12} {'Kontrast min':>12} {'verdeckt':>8} {'ausserhalb':>10} {'min. Ziel px':>12} {'Rücksprung':>10}")
for d in daten:
    stops = [t for t in d['tab'] if 'tag' in t]; ende = [t['ende'] for t in d['tab'] if 'ende' in t]
    ohne = [t for t in stops if not (t['fokusSichtbar'] and t['outlineStil'] != 'none' and t['outlineBreite'] >= 2)]
    verh = [t['verhaeltnis'] for t in stops if t['verhaeltnis'] is not None]
    verd = [t for t in stops if t['verdeckt']]
    aus = [t for t in stops if not t['imFenster'] or not t.get('rahmenImFenster', True)]
    ziel = min((min(t['w'], t['h']) for t in stops), default=0)
    rueck = 0; prev = None
    for t in stops:
        if prev is not None and t['top'] < prev - 12: rueck += 1
        prev = t['top']
    print(f"{d['pfad']:26} {d['breite']:>4} {len(stops):>5} {(ende[0] if ende else 'kein Ende in 40 Tab')[:38]:38} {len(ohne):>12} {min(verh) if verh else '-':>12} {len(verd):>8} {len(aus):>10} {ziel:>12} {rueck:>10}")
print()
print('== Sprungmarke (nur Seiten mit Rahmen; Desktop und Handy) ==')
for d in daten:
    s = d.get('sprung')
    if s: print(f"{d['pfad']:26} {d['breite']:>4}  erstes Ziel: {s['erstesFokusziel']:<20} sichtbar: {s['sichtbarBeiFokus']}  nach Enter: {s['hash']}  nächster Tab nach Sprungziel und nicht im Kopf: {s['naechstesNachSprungzielOhneKopf']} ({s['naechstes'][:28]})  Shift+Tab -> {s['shiftTabZiel'][:26]}")
print()
print('== Ausreißer Fokus (Verhältnis unter 3, oder Umriss unter 2 px, oder nicht fokus-sichtbar) ==')
n = 0
for d in daten:
    for t in d['tab']:
        if 'tag' not in t: continue
        if t['verhaeltnis'] is None or t['verhaeltnis'] < 3 or t['outlineBreite'] < 2 or not t['fokusSichtbar']:
            n += 1; print('  ', d['pfad'], d['breite'], t['tag'], t['text'][:24], t['outlineFarbe'], 'auf', t['umgebung'], t['verhaeltnis'], t['outlineBreite'], t['fokusSichtbar'])
print('   Anzahl:', n)
print()
print('== Fokusfarben je Kombination (Umriss auf Umgebung), Mindestwert je Seite ==')
for d in daten:
    if d['breite'] != 1440: continue
    kombis = {}
    for t in d['tab']:
        if 'tag' in t and t['verhaeltnis'] is not None: kombis[(t['outlineFarbe'], t['umgebung'])] = t['verhaeltnis']
    print(f"  {d['pfad']:26}", '; '.join(f"{a} auf {b} = {v}" for (a, b), v in sorted(kombis.items(), key=lambda kv: kv[1])[:4]))
print()
print('== BEWEGUNG: prefers-reduced-motion ausprobiert ==')
for d in daten:
    if d['breite'] != 1440: continue
    b = d['bewegung']
    for modus in ('no-preference', 'reduce'):
        m = b[modus]; st = m['stil']; sc = m['scroll']; hv = m['hover']
        sc_t = 'kein Ziel auf Seite' if (sc is None or 'uebersprungen' in sc) else f"Ziel {sc['ziel']}: sofort {sc['sofort']}, nach 60 ms {sc['nach60ms']}, Dauer bis Ziel {sc['dauerMs']} ms"
        hv_t = '-' if not hv else f"Knopf {hv['vorher']} -> nach 25 ms {hv['nach25ms']} -> nach 725 ms {hv['nach725ms']}"
        print(f"  {d['pfad']:24} {modus:13} scroll-behavior={st['scrollBehavior']:6} Knopf={st['knopf']} Nav={st['nav']} Fuss={st['fuss']} Animationen={st['animationen']} | {sc_t} | {hv_t}")
print()
print('== STRUKTUR ==')
for d in daten:
    if d['breite'] != 1440: continue
    s = d['struktur']
    print(f"  {d['pfad']:24} lang={s['lang']} h1={s['h1']} Ueberschriften='{s['ueberschriften']}' main={s['main']} nav={s['nav']} kopf={s['kopf']} fuss={s['fuss']} Sprungmarke={s['sprungmarke']} Sprungziel={s['sprungziel']} Titel={s['titel']!r}")
print()
print('== ÜBERLAUF am Handy (390 px, echte Emulation) ==')
for d in daten:
    if d['breite'] == 390: print(f"  {d['pfad']:24} scrollWidth={d['struktur']['scrollBreite']} clientWidth={d['struktur']['fensterBreite']} Überlauf={d['struktur']['ueberlauf']}")
print()
print('== NETZWERK: alle Anfragen je Seite (Desktop) ==')
for d in daten:
    if d['breite'] != 1440: continue
    eigen = os.environ.get('BASE', 'http://localhost:4392')
    fremd = [u for u in d['netzAlleUrls'] if not u.startswith(eigen) and not u.startswith('data:')]
    schlecht = [n for n in d['netz'] if n.get('status', 200) >= 400]
    print(f"  {d['pfad']:24} Anfragen={len(d['netzAlleUrls'])} fremd={fremd} Status>=400={[ (n['url'].split('4392')[-1], n['status']) for n in schlecht]} Konsole={d['konsole']}")

print()
print('== Fokus-Ziele unter 24 x 24 px (WCAG 2.5.8) ==')
for d in daten:
    if d['breite'] != 1440: continue
    for t in d['tab']:
        if 'tag' in t and (t['w'] < 24 or t['h'] < 24): print('  ', d['pfad'], t['tag'], repr(t['text'][:26]), f"{t['w']}x{t['h']}")
print()
print('== Fokus verdeckt oder außerhalb des Fensters (nach Ruhe des Scrollens) ==')
n = 0
for d in daten:
    for t in d['tab']:
        if 'tag' in t and (t['verdeckt'] or not t['imFenster'] or not t.get('rahmenImFenster', True)):
            n += 1; print('  ', d['pfad'], d['breite'], t['tag'], repr(t['text'][:24]), 'verdeckt' if t['verdeckt'] else '', 'außerhalb' if not t['imFenster'] else '', f"top={t['top']} h={t['h']}")
print('   Anzahl:', n)

print()
print('== BILDBESCHREIBUNGEN: jedes svg/img/role=img, Desktop ==')
gesamt = 0; ungeklaert = 0
for d in daten:
    if d['breite'] != 1440: continue
    for b in d['struktur']['bilder']:
        gesamt += 1
        if b['tag'] == 'img': art = 'beschrieben (alt)' if b['alt'] else ('bewusst leer (alt="")' if b['alt'] == '' else 'UNGEKLAERT')
        elif b['versteckt']: art = 'bewusst versteckt (aria-hidden)'
        elif b['ariaLabel'] or b['titel']: art = 'beschrieben'
        else: art = 'UNGEKLAERT'
        if art == 'UNGEKLAERT': ungeklaert += 1
        print(f"  {d['pfad']:12} {b['tag']}.{b['klasse'] or '-':10} in {b['eltern']:<22} -> {art}  (versteckt durch {b['versteckerKlasse']}, focusable={b['focusable']})")
    if d['struktur']['hintergrundBilder']: print('  CSS-Hintergrundbilder:', d['pfad'], d['struktur']['hintergrundBilder'])
print('   Bilder/SVG gesamt:', gesamt, '| ungeklärt:', ungeklaert)
