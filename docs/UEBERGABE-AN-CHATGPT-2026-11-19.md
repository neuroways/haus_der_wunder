# Übergabe an ChatGPT · 19.11.2026

**So benutzt du sie:** Alles unterhalb der Linie in den ChatGPT-Planungschat einfügen. Falls ChatGPT den Planungsprompt (`docs/CHATGPT-PLANUNG-PROMPT.md`) noch nicht kennt, diesen vorher einfügen. Die Objektstudien direkt mit anhängen.

---

**EMFD-Rückmeldung von Claude Code · Codeanalyse v0.6.66 · Stand 19.11.2026**

Claude Code hat den gesamten Code der 2D-App gelesen und eine interne Codekarte angelegt. Für die Planung des Umbaus sind daraus zwei Bereiche wichtig. Bitte übernimm das als aktuellen Stand und plane die beiden Themen als Entwicklungsaufträge im vereinbarten Format. Die Objektstudien hänge ich an.

## 1. Rückwege vereinheitlichen

**Ist-Stand im Code**
- Es gibt bereits einen zentralen Rückweg-Mechanismus: Die Navigation merkt sich, woher man kam, und kann sicher dorthin zurückführen (auch bei Direktaufruf mit sinnvollem Ersatzziel, Standard: Flur). Die Musikansichten (Grammophon, Plattensammlung, Kompositionsgeschichten) nutzen ihn schon.
- Diese Stellen haben noch **feste Ziele** und erzeugen das uneinheitliche Verhalten:
  - Raumseiten P01–P03, P05–P07: oben zwei Links „Alle Räume“ und „Zum Flur“, unabhängig davon, woher man kam.
  - Raumübersicht „Alle Räume“ und Teezimmer: immer „Zurück zum Flur“.
  - Kartengalerie (`#karten`): Rückweg je nach gemerktem Einstieg Flur, Teezimmer oder Atelier, sonst Flur.
  - Einzelkarte: „Zurück ins Teezimmer“, „Zurück zum Anfang“, „Zurück zum Kartentisch“ oder „Zurück zu den Bildkarten“, je nach gemerktem Einstieg.
  - Zusätzlich: Die Zurück-Links zum Flur werden app-weit als Tür-Symbol dargestellt; das Logo oben führt immer in den Flur.
- Eine untere Hauptnavigation gibt es seit v0.6.66 nicht mehr.

**Was die Planung festlegen muss**
- Welche Regel gilt: „zurück dorthin, woher ich kam“, „immer eine Ebene höher im Haus“ (z. B. Raum → Alle Räume → Flur) oder eine Mischung?
- Ob Raumseiten einen oder zwei Rückwege zeigen und wie sie heißen (Wortlaut).
- Wie sich Rückwege bei einem Direktaufruf verhalten (z. B. Link aus einem Gedankenblatt-QR-Code direkt auf eine Karte).
- Ob die Tür-Symbolik für „Zurück“ bleibt.

## 2. Musikgeräte in den Räumen (Geräteplayer)

**Ist-Stand im Code**
- Jeder Raum P01–P08 hat ein Gerät mit eigenem Bild und einer festen Liste von Karten-Stücken:
  P01 Fensterdose (O01, O02, O22) · P02 Musikschatulle (O03, O18, O16) · P03 Klangschale (O21, O13, O10, O05) · P04 Atelier-Spieluhr (O07, O11, O12) · P05 Windspiel (O09, O14, O15) · P06 Klangkästchen (O08, O15, O16, O19) · P07 Windharfe (O20, O17, O23) · P08 Teespieluhr (O24, O04, O06).
- Im Raum erscheint der Bereich „Musik dieses Zimmers“: ein Knopf mit dem Gerätebild („<Gerät> abspielen“) und darunter die Liste der Stücke mit „Musik abspielen“ und „Geschichte lesen“.
- Antippen startet die Raum-Playlist (erst nach bewusster Wahl, kein Autoplay). Dann wird das **Gerätebild als Player** angezeigt: darunter ein Titelschild (Titel, Kategorie) und die Steuerung zurück · Start · Stopp · weiter · Wiederholen. Lautstärke steuert der gemeinsame Musikdialog.
- Technisch ist das der Plattenspieler des Musikzimmers, bei dem Plattenteller, Tonarm und Cover ausgeblendet und der Korpus gegen das Gerätebild getauscht werden. Es gibt einen einzigen Player für die ganze App; ein Raumwechsel startet nichts.
- **Was fehlt:** kein Cover und keine Geschichte am Gerät, keine gerätetypische Bewegung oder Zustandsanzeige (spielt / pausiert / still), das Gerät bleibt ein statisches Bild. Für Screenreader heißt die Steuerung noch „Schallplattenspieler“.
- Vorhandene Medien: je Gerät ein Bild `media/raumgeraete/P01–P08.webp` (freigestellt). Diese stehen noch nicht im zentralen Medienmanifest.

**Was die Planung festlegen muss**
- Wie das Gerät im Raum erscheint und sich annähert („Annäherung an das Gerät im selben Raum“, kein Raumwechsel).
- Welche Zustände sichtbar sind (still, bereit, spielt, pausiert, Stück nicht verfügbar) und wie sie sich zeigen, auch ohne Animation (reduzierte Bewegung) und ohne Ton.
- Ob Cover, Titel und „Geschichte lesen“ direkt am Gerät erscheinen.
- Gerätetypische Bewegung je Gerät (z. B. Windspiel schwingt, Klangschale vibriert) als Idee oder Beschluss.
- **Objektstudien:** Welche Studie zu welchem Gerät gehört und ob daraus neue Gerätebilder oder Einzelteile (z. B. bewegliche Elemente) entstehen sollen. Für die Umsetzung braucht Claude Code fertige Bilddateien mit fester Zuordnung (Gerät P0x, Zustand/Teil, Format, Seitenverhältnis); Claude Code erzeugt keine Bilder selbst. Fehlt eine Datei noch, gehört sie in die Medientabelle des Auftrags als „fehlt“ mit genauer Beschreibung.

## Vorschlag zur Reihenfolge
1. Rückwege (betrifft viele Ansichten, keine neuen Medien nötig, gut abgrenzbar).
2. Geräteplayer, ggf. in zwei Aufträgen: zuerst Verhalten und Zustände mit den vorhandenen Gerätebildern, danach Bewegung und neue Bildteile aus den Objektstudien.

Bitte bestätige den Stand, kläre die offenen Planungsfragen mit mir und erstelle danach die Aufträge.
