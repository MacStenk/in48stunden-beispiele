# Wertet messung.json aus: Kontrast je Seite, mit Pixel-Gegenprobe am Bildschirmfoto.
import json, sys, os
from PIL import Image
ordner = sys.argv[1]
daten = json.load(open(f'{ordner}/messung.json'))
def name(p): return 'uebersicht' if p == '/' else p.strip('/').replace('/', '-')
def hexrgb(h): return tuple(int(h[i:i+2], 16) for i in (1, 3, 5))
def lum(c):
    t = [(v/255)/12.92 if v/255 <= .03928 else (((v/255)+.055)/1.055)**2.4 for v in c]
    return .2126*t[0] + .7152*t[1] + .0722*t[2]
def ratio(a, b):
    x, y = lum(a), lum(b); return (max(x, y)+.05)/(min(x, y)+.05)
print(f"{'Seite':28} {'Breite':>6} {'Texte':>5} {'kleinster':>9} {'Soll':>4} {'nicht ok':>8} | Pixel: geprüft / Abweichung bg")
gesamt_schlecht = []; abw_liste = []
for d in daten:
    k = [e for e in d['kontrast'] if not e.get('bild')]
    bilder = [e for e in d['kontrast'] if e.get('bild')]
    schlecht = [e for e in k if not e['ok']]
    kleinster = min(k, key=lambda e: e['verhaeltnis'] - e['soll'])
    png = f"{ordner}/roh/{name(d['pfad'])}-{d['breite']}.png"
    im = Image.open(png).convert('RGB'); W, H = im.size
    geprueft = abweichend = 0; textverh = []
    for e in k:
        # Hintergrund: fünf Punkte 3 px unter der Oberkante der Box, in der Mitte der Breite
        pts = [(int(e['x'] + e['w'] * f), int(e['y'] + 3)) for f in (.15, .3, .5, .7, .85)]
        pts = [(x, y) for x, y in pts if 0 <= x < W and 0 <= y < H]
        if not pts or e['h'] < 8: continue
        px = [im.getpixel(p) for p in pts]
        haeufig = max(set(px), key=px.count)
        geprueft += 1
        soll = hexrgb(e['bg'])
        if max(abs(haeufig[i]-soll[i]) for i in range(3)) > 6:
            abweichend += 1; abw_liste.append((d['pfad'], d['breite'], e['text'][:24], e['bg'], '#%02x%02x%02x' % haeufig))
        # Textfarbe: der vom Hintergrund am weitesten entfernte Pixel in der Box
        x0, y0, x1, y1 = int(e['x']), int(e['y']), int(e['x']+e['w']), int(e['y']+e['h'])
        box = im.crop((max(x0,0), max(y0,0), min(x1,W), min(y1,H)))
        if box.width*box.height and box.width*box.height < 90000:
            weit = max(box.getdata(), key=lambda p: ratio(p, soll))
            textverh.append((ratio(weit, soll), e['verhaeltnis'], e['soll'], e['text']))
    unter_pixel = [t for t in textverh if t[0] < t[2] - .05 and t[1] >= t[2]]  # Pixel schlechter als Soll, DOM sagt ok
    print(f"{d['pfad']:28} {d['breite']:>6} {len(k):>5} {kleinster['verhaeltnis']:>9} {kleinster['soll']:>4} {len(schlecht):>8} | {geprueft} / {abweichend}   Pixel-Text unter Soll (Antialias möglich): {len(unter_pixel)}")
    for e in schlecht: gesamt_schlecht.append((d['pfad'], d['breite'], e['text'], e['fg'], e['bg'], e['verhaeltnis'], e['soll'], e['px']))
    if bilder: print('   Hinweis, Text über Bild/Verlauf (nicht messbar):', [b['text'] for b in bilder][:5])
print()
print('Alle Kombinationen, die das Soll NICHT erfüllen:', len(gesamt_schlecht))
for g in gesamt_schlecht[:40]: print('  ', g)
# Verteilung der Kombinationen (Text/Fläche) je Seite, kleinste 3
print()
print('Kleinste drei Verhältnisse je Seite (Desktop):')
for d in daten:
    if d['breite'] != 1440: continue
    k = sorted([e for e in d['kontrast'] if not e.get('bild')], key=lambda e: e['verhaeltnis'])
    seen = []
    for e in k:
        key = (e['fg'], e['bg'])
        if key in [s[0] for s in seen]: continue
        seen.append((key, e))
        if len(seen) == 3: break
    print(f"  {d['pfad']:28}", ' | '.join(f"{e['fg']} auf {e['bg']} = {e['verhaeltnis']} (Soll {e['soll']}, {e['px']:.0f}px, {e['text'][:18]!r})" for _, e in seen))

print()
print('Pixel-Abweichungen beim Hintergrund (Element, erwartet laut DOM, gefunden im Bild):', len(abw_liste))
for a in abw_liste: print('  ', a)
