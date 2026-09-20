# Was sich wiederholt

Bericht zum Meilenstein 1, mit Blick auf **Layout**. Grundlage für das Starterpaket Stufe 2. Alle Zahlen
sind am Stand dieses Zweigs gemessen (Befehle unten je Abschnitt), nichts ist geschätzt, außer wo es dasteht.

## Kurz gesagt

- Ein Rahmen, zwei Rechtsseiten und elf Felder in `kunde.yml` sind in allen drei Beispielen gleich. Das ist
  der Kern, der ins Starterpaket wandert.
- Was ein Beispiel ausmacht, ist seine **Grundform**: Reihenfolge, Raster, Ausrichtung, Formsprache. Das
  liegt in der Seitendatei und im eigenen CSS und ist bewusst nicht vereinheitlicht.
- Das Seitengewicht (44 bis 92 KB) besteht zu 77 bis 89 % aus Schriften. Die Wahl der Familie zählt dabei
  mindestens so viel wie die Zahl der Schnitte.

## 1. Was in allen drei Beispielen gleich ist

| Baustein | Wo | Beleg |
|---|---|---|
| Rahmen: Kopf mit Name und Untertitel, Menü, Sprungmarke, Fuß mit einer Zeile, `theme-color` | `src/layouts/Rahmen.astro` | eine Datei für alle neun Seiten |
| Impressum- und Datenschutzseite (Vorlage) | `src/pages/beispiel-N/impressum.astro`, `datenschutz.astro` | `diff` zwischen den Beispielen: identisch bis auf den Ordnernamen |
| Impressum-Text | `src/inhalte/beispiel-N/impressum.md` | alle drei haben denselben Prüfwert (`md5`) |
| Datenschutz-Text | `datenschutz.md` | 14 von etwa 20 Zeilen sind in allen drei gleich |
| Felder je Betrieb | `kunde.yml` | dieselben elf Schlüssel: `name`, `branche`, `ort`, `inhaber`, `strasse`, `plz_ort`, `telefon`, `email`, `zeiten`, `menue`, `farben` |
| Fünf Inhalte je Seite | `start`, `angebot`, `ablauf`, `vertrauen`, `kontakt` (Markdown) | gleiche Namen, gleiche Kopfzeilen (`titel`, dazu `knopf` im Einstieg) |
| Grundstile: Maße, Fokus, Sprungmarke, reduzierte Bewegung, Fuß, Rechtstexte, `color-scheme`, `touch-action` | `src/gestaltung/basis.css` | 36 Zeilen, gelten überall |
| Foto-Platzhalter: `div.foto-platz` mit `aria-hidden` und einem SVG in Seitenfarben | `src/components/beispiel-N/Foto.astro` | Aufbau gleich, Zeichnung je Beispiel anders |
| Sinnbild als SVG, eingebunden per `link rel="icon"` | `public/beispiel-N/sinnbild.svg` | jede Seite |

**Auffällig:** In den drei Beispiel-CSS stehen **32 Selektoren in allen dreien** (`.knopf`, `.kopf nav a`,
`.kontakt-liste`, `.foto-platz`, `.ablauf li` und weitere), in mindestens zwei sind es 37. Sie sind nur
unterschiedlich ausgeführt. Das ist der größte Teil der Doppelung, die Stufe 2 beseitigen kann.

## 2. Die drei Grundformen und wodurch sie sich unterscheiden

| | Beispiel 1: Handwerk | Beispiel 2: Praxis | Beispiel 3: Coaching |
|---|---|---|---|
| Aufbau | Bänder von oben nach unten | Bänder von oben nach unten | ein einziges Raster aus acht Kacheln |
| Reihenfolge | Einstieg, Angebot, Ablauf, Vertrauen, Kontakt | Einstieg, **Vertrauen**, Angebot, Ablauf, Kontakt | Kacheln nach Raster, Lesereihenfolge wie Beispiel 1 |
| Ausrichtung | Kopf links/rechts | Kopf mittig, Rest linksbündig | alles linksbündig |
| Ablauf | ansteigende Stufen | waagerechte Zeitleiste, am Handy senkrecht | vier Spalten in dunkler Kachel |
| Angebot | drei gleiche Karten | Liste mit feinen Linien | drei Kacheln, eine hoch, zwei gestapelt |
| Form | 2 px Rundung, Plattenserife | volle Rundung, runde Grotesk | scharfe Ecken, Fugen von 2 px |
| Kontakt | dunkles Band | helle Karte | gelbe Kachel |
| Technik | Flex/Grid, Zähler | Grid, Zähler, Pseudo-Elemente | `grid-template-areas`, Untergitter (`subgrid`), Container-Einheiten |

**Was die Grundform ausmacht:** die Abschnittsfolge (steht in `index.astro`), das Raster und die Form. Die
Reihenfolge des Menüs steht dagegen in `kunde.yml` (`menue`) und folgt der Seite. Es gibt keinen Schalter „Layout",
die Seitendatei ist die Wahl.

## 3. Was je Kunde wechselt (Kandidaten für `kunde.yml`)

**Schon dort:** `name`, `branche`, `ort`, `inhaber`, `strasse`, `plz_ort`, `telefon`, `email`, `zeiten`, `menue`, `farben`.

**Steckt noch im Code und gehört nach `kunde.yml` oder in Markdown:**

| Feld | Heute | Beleg |
|---|---|---|
| Seitentitel | fest in der Seitendatei | `titel="..."` in den drei `index.astro` |
| Knopftext im Kontaktbereich | fest in Beispiel 1 („Jetzt schreiben") und 2 („Termin anfragen") | Kontaktbereich der jeweiligen `index.astro` |
| Schrift (Familie, Schnitte) | im CSS des Beispiels | `@font-face` in `beispiel-N.css` |
| `alt`-Text für Fotos | gibt es nicht (Platzhalter sind `aria-hidden`) | siehe Abschnitt 6 |
| Farbe des Sinnbilds | im SVG fest eingetragen | `public/beispiel-N/sinnbild.svg` |
| Anrede (Sie/Du) | im Text | `*.md` |
| Grundform | in der Seitendatei | Abschnitt 2 |

## 4. Was einmalig blieb (nicht verallgemeinern)

- **Beispiel 1:** `Stufen.astro` (gezeichnete Treppe im Kopf), der ansteigende Ablauf (Versatz je Schritt), die Plattenserife.
- **Beispiel 2:** `Welle.astro`, die Zeitleiste aus Kreisen und Linien (Pseudo-Elemente), die 2×2-Kacheln.
- **Beispiel 3:** die Kachelwand mit `grid-template-areas`, Untergitter und Container-Einheiten, das hohe Foto-Feld.

Das sind die Stellen, an denen ein Kunde sich für eine Grundform entscheidet. Sie gehören ins Starterpaket
als wählbare Vorlagen, nicht als Baustein, der überall gleich aussieht.

## 5. Die drei Dinge, die beim Starterpaket Stufe 2 zuerst zu bauen sind

1. **`kunde.yml` zur einzigen Quelle machen.** Die Felder aus Abschnitt 3 ergänzen (Seitentitel, Knopftext,
   Schrift, `alt`), und Impressum und Datenschutz **aus `kunde.yml` füllen**. Heute stehen sie dreimal als
   Kopie, 14 von etwa 20 Zeilen sind gleich.
2. **Die 32 gemeinsamen Selektoren in `basis.css` heben** und mit Variablen (Rundung, Schrift, Abstände)
   parametrieren. Ein Beispiel überschreibt dann nur, was seine Grundform ausmacht. Danach lässt sich die
   Grundform als Wahl anbieten (Bänder links/rechts, Bänder mittig, Kachelwand).
3. **Die Abnahme in den Build ziehen.** `bin/gewicht` bricht schon ab, wenn eine Seite über 500 KB wiegt.
   `bin/pruefen` (Kontrast, Tastatur, Links, Netzwerk) ist das Werkzeug dafür, braucht aber noch eine Hülle,
   die Server und Chrome selbst startet und bei einem Fehler mit Rückgabewert ungleich 0 endet.

Erst danach lohnt `bin/neue-seite`: Es kann nur so gut sein wie die Vorlage, die es kopiert.

## 6. Bei der ersten echten Kundenseite: zwei Pflichten

- **`alt` als Pflichtfeld im Foto-Baustein.** Heute sind alle 5 SVG (Schmuck und Foto-Platzhalter) bewusst
  `aria-hidden`, weil sie nichts mitteilen (gemessen, `bin/pruefen`, Abschnitt Bilder). Sobald ein echtes Foto
  eingesetzt wird, braucht es eine Beschreibung. Leer bleibt sie nur für reinen Schmuck.
- **Screenreader-Lauf.** In diesem Meilenstein nicht gemacht. Geprüft wurde nur in Chrome, ohne Safari und
  Firefox, ohne Seitenzoom auf 200 %, ohne echte Geräte. Für Layout-Beispiele vertretbar, für eine Kundenseite nicht.

## 7. Die Schriftfrage: Schnitte gegen Seitengewicht

Unkomprimierte Bytes aus `dist/` (`woff2` ist schon komprimiert), Startseite je Beispiel:

| | Seite | Schnitte | Schrift | Rest (HTML, CSS, Sinnbild) | Anteil Schrift |
|---|---|---|---|---|---|
| Beispiel 1 | 91,9 KB | 4 (Plattenserife und Serifenlose je 2) | 82,0 KB | 9,9 KB | 89 % |
| Beispiel 2 | 43,7 KB | 3 (eine Familie) | 33,5 KB | 10,2 KB | 77 % |
| Beispiel 3 | 58,1 KB | 2 (eine Familie) | 48,3 KB | 9,8 KB | 83 % |

- **Der Rest ist überall gleich (etwa 10 KB).** Jeder Unterschied im Gewicht kommt aus den Schriften.
- **Die Familie zählt so viel wie die Zahl der Schnitte.** Ein Schnitt kostet: Figtree 11 KB, Source Sans 3 15 KB,
  Schibsted Grotesk 24 KB, Zilla Slab 26 KB. Darum wiegen **zwei** Schnitte Schibsted (48 KB) mehr als **drei**
  Schnitte Figtree (34 KB).
- **Stellschrauben, nach Wirkung:** erst die Familie wählen (Kosten je Schnitt), dann Schnitte zählen. Jeder
  weitere Schnitt kostet 11 bis 26 KB. Der Zeichenumfang ist schon auf Lateinisch beschränkt.
- **Als Rechnung, nicht gemessen:** Zwei Schnitte einer schlanken Familie wie Figtree kämen auf etwa 32 KB Seite.
  **Nicht untersucht:** variable Schriften, Teilmengen nach tatsächlich gebrauchten Zeichen.

## 8. Die Abwägung „drei gleiche Karten" (Beispiel 1 und 2)

Die Regel gegen „drei gleiche Karten" (`design-taste-frontend`) trifft Beispiel 1 (drei Karten im Angebot) und
Beispiel 2 (vier gleiche Kacheln im Bereich „Die Praxis"). Beide sind **nicht umgebaut**, und das ist eine Abwägung, kein Fehler:
Bei drei **gleichrangigen** Leistungen sind gleiche Karten die ehrliche Form. Die Regel zielt auf Seiten, die
Ungleiches gleich aussehen lassen. Wo ein Betrieb eine Hauptleistung und Nebenleistungen hat, zeigt Beispiel 3, wie
die ungleiche Form aussieht (eine Kachel hoch, zwei gestapelt). Die Entscheidung gehört zum Kunden und zur Sache,
nicht zur Vorlage.

## 9. Das Prüfwerkzeug und was es gelehrt hat

`bin/gewicht` misst das Seitengewicht, `bin/pruefen/` misst in echtem Chrome Kontrast (gegen den zusammengesetzten
Hintergrund), Tastatur (echte Tab- und Enter-Ereignisse), reduzierte Bewegung (Einstellung umgeschaltet), Links und
Netzwerk. Wie es läuft, steht im Kopf von `bin/pruefen/pruefen.mjs`. Drei Regeln aus den Fehlern des Werkzeugs selbst:

1. Pseudo-Elemente (Zähler, Punkte) mit eigenem Hintergrund gegen **diesen** Hintergrund messen, nicht gegen den der Zeile.
2. Nach jedem Tab warten, bis das Scrollen zur Ruhe gekommen ist, sonst wirkt ein sichtbares Ziel „außerhalb".
3. Für die Pixel-Gegenprobe den häufigsten Farbton in der Box nehmen, nicht einzelne Punkte (sie treffen Buchstaben).

Dazu ein Befund aus der Messung: Ein Fokusrahmen von 3 px plus 3 px Abstand ragt über den Fensterrand, wenn ein
Link genau an der Kante sitzt. `scroll-padding-block` in `basis.css` verhindert das.
