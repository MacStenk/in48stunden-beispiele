# Regeln für dieses Repo

Hier entstehen **Layout-Beispiele** für das Angebot „in48stunden". Es sind keine fertigen Kundenseiten.
Gezeigt werden Aufbau, Anordnung, Raster, Abschnittsfolge und das Verhalten auf Handy und Desktop.
Texte nur so weit, dass erkennbar ist, was an der Stelle steht. Keine ausgefeilten Werbetexte.

## Stack

- Astro, statisch. Markdown als Quelle der Wahrheit.
- **Kein zweites Rendering-System:** kein React, kein Vue, kein Svelte, kein shadcn. Auch nicht als Insel.
- Sichtbare Schicht ist frei (CSS, Schriften, kleine Effekte), der Kern bleibt sortiert.
- Schriften liegen lokal. Keine fremden Server, kein Nachladen von Google Fonts.

## Vor dem Bauen: Skills laden

Für jede Layout-Arbeit gelten diese Skills, nicht das Bauchgefühl:

- `frontend-design` — Entwurfsplan und Selbstkritik, bevor Code entsteht
- `ui-ux-pro-max` — Stile, Paletten, Schriftpaare, UX-Regeln, Abstandsstufen
- `design-taste-frontend` — Regeln gegen die typische KI-Optik, Endprüfung
- `modern-web-guidance` — aktuelles HTML und CSS

Aus allen wird nur Farbe, Schrift, Aufbau, Bewegung und Zugänglichkeit übernommen. Ihre Empfehlungen zu
React-Zubehör gelten hier nicht.

## Nicht blind arbeiten

Erst grobe Struktur, dann ansehen, dann verfeinern. Nach jedem größeren Abschnitt ein Bildschirmfoto in
Handybreite (etwa 390 px) und Desktopbreite (etwa 1440 px) machen, ansehen, dann korrigieren. Die Bilder
gehören als Beleg in den Issue-Kommentar.

## Vorlagen

Fertige Astro-Vorlagen dürfen als Ausgangspunkt dienen, wenn die Lizenz es erlaubt. Herkunft und
Lizenztext kommen ins Repo. Keine Vorlage mit React-, Vue- oder Svelte-Anteilen. Kostet das Aufräumen mehr
als Selbstbauen, wird selbst gebaut und das im Kommentar begründet.

## Pflichten je Beispiel

- Ordner und Adressen neutral: `beispiel-1`, `beispiel-2`, `beispiel-3`. Branche nur als Untertitel.
- Keine erfundenen Firmennamen. Wo der Name stünde: Platzhalter „Dein Firmenname".
- Keine Fotos von Menschen. Bilder sind gestaltete SVG-Platzhalter im Farbton der Seite.
- Eine Zeile unten: Beispielseite, Name, Angaben und Fotos stellt der Kunde.
- Impressum und Datenschutz vorhanden, mit Platzhaltern gefüllt.
- Tastatur bedienbar, sichtbarer Fokus, ausreichender Kontrast, Bildbeschreibungen gesetzt.
- Bewegung ruhig: Szenenwechsel 400 bis 500 ms, kleine Reaktionen 150 bis 200 ms, weich an und aus,
  immer nur eine Bewegung. `prefers-reduced-motion` wird beachtet.
- `bin/gewicht` bleibt grün: jede Seite unter 500 KB (1 KB = 1024 Byte).

## Arbeitsweise

- Gearbeitet wird auf einem Zweig, ein Commit je Schritt, Conventional Commits auf Deutsch.
- **Kein Push auf `main`, kein Merge.** Das macht Steven.
- Jede Meldung im Issue nennt Belege: Befehl und Ausgabe, Messwert, Bildschirmfoto. „Fertig" ohne Beleg
  gilt nicht. Was nicht geprüft wurde, wird als ungeprüft benannt.
