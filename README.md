# Beispielseiten für in48stunden

Drei Layout-Beispiele mit vollem Quelltext: Handwerk, Praxis, Coaching. Sie zeigen Aufbau, Raster und Verhalten
auf Handy und Desktop, keine fertigen Kundenseiten. Einfache, lesbare Dateien statt Baukasten.

- `/beispiel-1/` Bänder, Text links, Bild rechts, Ablauf als Treppe
- `/beispiel-2/` Bänder, mittig, mit Welle und Zeitleiste
- `/beispiel-3/` Kachelwand, ein einziges Raster

Angebot: https://in48stunden.de

## Selbst bauen

```sh
npm install
npm run build   # Seiten nach dist/
bin/gewicht     # baut und misst je Seite, scheitert über 500 KB
```

## Prüfen

`bin/pruefen/` misst die gebauten Seiten in echtem Chrome: Kontrast, Tastatur, reduzierte Bewegung, Links,
Netzwerk. Der Aufruf steht im Kopf von `bin/pruefen/pruefen.mjs`.

## Weiterlesen

- [`WIEDERHOLUNGEN.md`](WIEDERHOLUNGEN.md): was sich in den drei Beispielen wiederholt, Grundlage für das Starterpaket
- [`CLAUDE.md`](CLAUDE.md): die Regeln für die Arbeit an diesem Repo
