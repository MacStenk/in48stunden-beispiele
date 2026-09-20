# Entwurfsplan Beispiel 3 (Coaching), vor dem Code

Ziel laut Issue: eine **dritte Grundform**, nicht eine dritte Farbe. Texte nur andeutend.

## Wo die beiden ersten stehen
- Beispiel 1: Kopf links/rechts, danach gestapelte Bänder, Ablauf als ansteigende Treppe.
- Beispiel 2: Kopf mittig mit Welle, danach gestapelte Bänder, Ablauf als waagerechte Zeitleiste.
- Beide sind eine **Folge von Bändern von oben nach unten**. Darin steckt der Unterschied zu allem, was folgt.

## Selbstkritik an meinem ersten Entwurf (verworfen)
Erste Fassung von Beispiel 3: dunkles Marineblau, Bernstein, große Serifenschrift, Nummern 01 bis 04 über jeder Überschrift, Großbuchstaben-Zeile über der Überschrift, Pfeil im Knopf, Geviertstrich als Listenpunkt, wieder gestapelte Bänder (nur mit zweispaltigem Ablauf und Zeilenliste). `frontend-design` und `design-taste-frontend` nennen genau diese Muster als Standard. Im Aufbau war es zu nah an den beiden anderen: wieder Bänder von oben nach unten. Verworfen.

## Entwurf: Kachelwand
Die Seite ist **ein einziges Raster aus acht Kacheln**, kein Stapel. Trennlinien sind die Fugen des Rasters (2 px Tinte), keine Karten mit Schatten.

Desktop (6 Spalten), jede Zelle belegt, keine Lücke:
```
+-----------------------------+-----------+
| EINSTIEG (kobalt)           |           |
| Überschrift, ein Satz, Knopf|   FOTO    |
|                             | (Fläche,  |
+--------------+--------------+  hoch)   |
| FORMAT 1     | FORMAT 2     |           |
| (hoch)       +--------------+           |
|              | FORMAT 3     |           |
+--------------+--------------+-----------+
| ABLAUF (tinte), vier Schritte nebeneinander |
+-----------------------------+-----------+
| ÜBER MICH                   | KONTAKT   |
| (papier)                    | (gelb)    |
+-----------------------------+-----------+
```
Mittel (ab 40 em, 2 Spalten): Einstieg, Foto, Formate (1 hoch, 2 und 3 gestapelt), Ablauf, Über mich neben Kontakt.
Handy: eine Spalte in dieser Reihenfolge, Foto als flacher Streifen nach dem Einstieg.

- **Ausrichtung:** links, überall. Nichts mittig.
- **Lesereihenfolge = Tab-Reihenfolge:** Einstieg, Formate, Ablauf, Über mich, Kontakt. Die Fläche für das Foto ist Schmuck und nicht fokussierbar.
- **Kern-Technik (aus `modern-web-guidance`, Leitfaden css-layout):** `grid-template-areas` für die Seite, `subgrid` für die Formate (Kacheln 1 bis 3 teilen sich die Spuren der Wand), davor derselbe Aufbau als Rückfall für alte Browser, Container-Einheiten (`cqi`) für Schriftgrößen nach Kachelbreite. Alles Baseline. Kein Skript.
- **Das eine Merkwürdige:** die Wand selbst. Jede Kachel hat eine andere Größe, aber nur eine Farbfläche ist laut (gelb, der Kontakt).

## Werte
- **Farbe (5):** Kobalt `#2036C9` (große Fläche), Papier kühl `#EDF0F7` und `#DCE1EF` (helle Kacheln), Tinte `#0E1230` (Text, Fugen, dunkle Kachel), Signalgelb `#FFD23F` (der einzige Akzent), Text auf Kobalt `#F6F7FB`.
  Kontraste gerechnet: Text auf Kobalt 8,1:1, Gelb auf Kobalt 6,0:1, Tinte auf Gelb 12,7:1, Kobalt auf Papier 7,6:1, Tinte auf Papier 16,0:1, gedämpfter Text `#414A6B` auf Papier 7,6:1.
- **Schrift:** Schibsted Grotesk, eine Familie, zwei Schnitte lokal: 800 für Überschriften und Kacheltitel, 400 für Text. Zwei Dateien (49 KB). Keine Serifenschrift (Beispiel 1 hat schon eine Plattenserife).
- **Form:** eine einzige Formensprache, keine Rundung, Ecken scharf, Fugen 2 px. Beispiel 1 hat 2 px Rundung, Beispiel 2 volle Rundungen: dies ist die dritte Haltung.
- **Bewegung:** nur Farbwechsel auf Knöpfen und Links, 160 bis 180 ms. Kein Eintrittseffekt. Die Seite ist ein Raster, sie soll stillstehen.
- **Foto-Platzhalter:** hohe Fläche mit Kreisbögen in Kobalt, Tinte und Gelb, ohne Beschriftung.

## Empfehlungen der Skills, die ich bewusst nicht übernehme (ein Satz warum)
- *Echte Bilder statt Platzhalter (`design-taste-frontend`):* Steven hat gestalteten Platzhalter ohne Foto entschieden, das gilt.
- *Tailwind, React, GSAP, Motion (alle vier Skills):* Kern bleibt statisch, kein Tailwind nachträglich (Issue, Punkt 7).
- *Hell und Dunkel beides gestalten (`design-taste-frontend`, Abschnitt 8):* Beispiele sind Layout-Vorführungen, nicht fertige Seiten. Ein zweiter Farbsatz je Beispiel wäre Politur.
- *Kein Serif, kein Inter (`design-taste-frontend`):* Übernommen. Kein Serif, kein Inter.
- *Brutalism laut `ui-ux-pro-max` für „Coaching":* Die Datenbank schlug es vor. Für Menschen in einem Berufswechsel wäre rohe Anti-Gestaltung falsch. Ich übernehme daraus nur scharfe Ecken und sichtbares Raster, nicht die rohe Haltung.

## Aus der Selbstkritik gestrichen
Nummern über Überschriften (nur der Ablauf ist eine echte Folge und bekommt Zahlen), Großbuchstaben-Zeile, Pfeil im Knopf, Geviertstrich, Marineblau-Bernstein, Serifenschrift, Zweispalter mit klebender Überschrift.
