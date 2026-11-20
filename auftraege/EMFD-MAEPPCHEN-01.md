Auftrag an Claude · Mäppchen der Begleiterkarte

Setze das Mäppchen zuerst mit O08 „Die Laterne“ durchgängig um. Verwende den mitgelieferten Build als Grundlage. Lies im Medienpaket nur README.md und asset-register.json. Prüfe im Build gezielt den Ziehvorgang, die feste Navigation, den Karten- und Musikkatalog, das Buch und das Gedankenblatt. Nutze die vorhandenen Komponenten und IDs. Wenn eine Medienzuordnung fehlt, melde am Ende die genaue ID und den fehlenden Pfad und arbeite an den übrigen Funktionen weiter.

Schritt	Umsetzung
1. Begleitung	Nach dem Aufdecken erscheint „Mitnehmen“. Es gibt genau eine aktive Begleitung, ohne Ablaufdatum. Bei aktiver Begleitung führt der Zieh-Einstieg zum Mäppchen. Über die feste Navigation ist es aus jedem Raum erreichbar. Beim Schließen kehrst du an dieselbe Stelle zurück.
2. Inhalt	Das Mäppchen enthält die gezogene Karte, zwei separat entnehmbare Kärtchen mit Originalimpuls und Originalfrage, das Gedankenbuch, das Geschichtenheft und den Papierfalter. Lade die Inhalte über die aktive Karten-ID. Das Fragekärtchen bleibt beim Schreiben sichtbar.
3. Schreiben und zurücklegen	Speichere Gedankenbuch-Entwürfe lokal pro Begleitung. Schließen und Neustart erhalten Karte und Entwurf. „In die Schachtel zurücklegen“ bietet bei vorhandenem Text einen freiwilligen Export an. Erst die bestätigte Rückgabe gibt das Ziehen wieder frei. Wenn später dieselbe Karte erneut mitgenommen wird, beginnt ein frischer Entwurf.
4. Animation und Musik	Riemen unter der Schlaufe herausziehen, rechte Klappe an der mittleren Falz öffnen, Inhalte hinter ihren Fachkanten herausgleiten lassen. Der Falter kommt matt auf die Hand. Erst ein weiterer Tipp startet Licht und Verwandlung. Beim Abheben beginnt das Kartenlied über den bestehenden Audioplayer, dann erscheint das quadratische Cover. Beim Pausieren verblasst das Cover, der Falter landet und kehrt als Papier in die Lasche zurück. Für reduzierte Bewegung sanft überblenden.
5. Smartphone und PC/Wide	Verwende dieselben Grafiken und denselben Zustand mit zwei Layouts. Smartphone: ganzes Mäppchen im Hochformat, eine Buchseite, Frage darüber, Hand unten und Cover oben. Wide: Mäppchen links, Inhalt rechts, Buch als Doppelseite, Hand links unten und Cover rechts oben. Lege Positionen, Größen und Flugweg je Layout fest. Ein Ansichtswechsel erhält Buchseite, Entwurf und Audioposition. Für den Test dürfen Tisch und Himmel aus dem Hochformat zugeschnitten werden.
6. Exporte und Ablage	Kartenbild als PNG mit Motiv, Name und Impuls. Gedankenblatt und Geschichtenheft getrennt als PDF. Zusätzlich eine Mäppchen-Sicherung mit aktiver Karte und editierbarem Entwurf, die sich wieder importieren lässt. Einen verbundenen Ablageordner nur bei unterstütztem Ordnerzugriff anbieten. Auf iPhone und iPad über Export und Dateiauswahl arbeiten.

Reihenfolge: Erst O08 vom Ziehen bis zum Zurücklegen zum Laufen bringen. Danach die generische Zuordnung über die Karten-ID prüfen. Die zwei Wide-Hintergründe können später eingesetzt werden. Das Musikcover aus dem Mockup ist ein Platzhalter. Verwende im Build das freigegebene Cover und Audio aus dem Katalog, sofern vorhanden.

Abnahme: O08 mitnehmen → Mäppchen aus einem Raum öffnen → Frage lesen und Gedanken schreiben → App neu öffnen und Entwurf wiederfinden → Falter antippen, Lied abspielen und pausieren → Smartphone/Wide wechseln → Dateien exportieren und Sicherung importieren → Karte zurücklegen → erneut ziehen können.

Rückmeldung: Geänderte Dateien, bestandene Prüfschritte und fehlende Medienpfade genügen. Die Übergabe erfolgt als Entwicklungsstand ohne Veröffentlichung.

---
Ablage: Auftrags-ID von Claude vergeben (EMFD-MAEPPCHEN-01). Medienpaket EMFD-Maeppchen-Medien-v0.1 (26 PNG) unverändert unter `media/maeppchen/`, Register-IDs `maeppchen.<Nr>` in `home/data/registry-app.json`.
Rückfragen vom 20.11.2026 (Antworten der Nutzerin): Gedankenbuch-Entwürfe lokal speichern → **ja** (löst für das Mäppchen „Gedankenblatt flüchtig“ aus W6 ab). Ziehen sperren bis zur Rückgabe → **nein, Ziehen bleibt frei**; wer eine andere Karte mitnimmt, wird gefragt, ob die bisherige Begleitung zurückgelegt wird.
