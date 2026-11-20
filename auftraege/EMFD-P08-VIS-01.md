Setze die beigefügte P08-Entwicklungsübergabe im aktuellen Testzweig um. Aktualisiere die beiden Teezimmeransichten und binde Smartphone-Ausschnitte, Licht und Ofen, Kartentisch sowie die Spieluhr-Nahansicht anhand von Medienzuordnung.json ein. Prüfe den Hallendurchblick gegen die dort hinterlegten Prüfsummen. Wintergarten-Gegenansicht, Spieluhrmechanik und Textilien bleiben zur Bildfreigabe offen. Melde die Testversion, die eingebundenen Medien-IDs und die Ergebnisse der Abnahmetests zurück. Die Veröffentlichung erfolgt separat nach Freigabe.

EMFD-P08 · Entwicklungsübergabe an Claude Code

Auftrag: Teezimmer P08 im aktuellen Testzweig integrieren und die bisherigen Teezimmerbilder durch die geprüften Bildkandidaten ersetzen. Das Paket ist zur Bildabnahme vorgesehen. Die Veröffentlichung erfolgt separat nach Freigabe.

Anlage: EMFD-P08-VIS-01_Teezimmer-v0.7-r1.zip

Umsetzung

1. Prüfe im aktuellen Checkout die P08-Routen, die gemeinsame Szenenkomponente und das Medienregister. Der letzte Abgleich ergab v0.6.78 im Test und v0.6.69 live. Prüfe die ZIP-Einträge gegen SHA256SUMS.txt. Verwende Medienzuordnung.json für Pfade, Zustände, Hotspots und Ausschnitte. Übernimm die passenden Einträge aus Medienregister-P08-Eintraege.json in das bestehende Register.
2. Binde die zwei Perspektiven über scene.P08-C01.kandidat und scene.P08-C02.kandidat ein. Die Wide-Bilder liegen unter media/rooms/P08/optimized/ und die verlustfreien Arbeitsdateien unter media/rooms/P08/originals/. Verwende die sechs Zuschnitte aus der JSON für die Laufzeit. qa/crops/ dient als Vergleich. Der direkte Einstieg zeigt C01 Mitte, der Einstieg aus der Halle C01 links. Beim Umdrehen wechseln links und rechts. Die Mitte bleibt Mitte. Die Ausgänge zur Halle folgen der Herkunftsmatrix. Der Wintergartenanschluss bleibt bis zur bestätigten Gegenszene vorläufig.
3. Setze Aus-Basis, registrierte Ein-Ebenen und Kartenstapel vor dem Ausschnitt zusammen. Die exakte sRGB-Addition steht in lighting.blend. Ofenfeuer ist in C02 als Aus/Ein vorbereitet. O04 ist in C02 bereits im Raumbild enthalten. Verwende seine Ebene nur bei einer Basis ohne Kissen, damit es nicht doppelt erscheint. Die echten Wide-Quellen messen 1664 × 936 px. Für die Testauslieferung ist 1280 × 720 WebP vorhanden.
4. Öffne am Kartentisch die D01-Nahansicht samt registriertem Stapel und nutze die vorhandene Kartenanimation. Beim Öffnen zieht die App keine Karte und startet keine Musik. Die aktuelle Begleiterkarte bleibt bestehen, bis bewusst eine neue gezogen wird. Nutze die Originalrückseite v1.2 aus quellen/karten/ als belegte Quelle für den zentralen Kartenpfad. Der erwartete Serverpfad lieferte beim letzten Abgleich HTTP 404. W2/K-23 bleibt offen. Die Papierfläche allein löst keine Aktion aus.
5. Verwende für MP-P08 die neue Spieluhr-Nahumgebung und vorläufig die statische Walzenansicht. Playlist und gemeinsamer Audioplayer bleiben über die vorhandene Geräte-ID angebunden. Musik startet erst bei bewusster Bedienung. Die fünf historischen Ebenen mit Drehteller und Figuren sind registriert und können nach Freigabe der sichtbaren Mechanik für die Animation verwendet werden.
6. Nutze das gemeinsame Szenen-UI mit geschlossenem „Dein Moment“ beim Einstieg. Die beiden T03-Durchblicksebenen unter anschlusskandidaten/ passen nur zu den H00-Ausgangsbildern mit den SHA-256-Werten in visualSupplement.hall. Verwende sie im Test zur Abnahme bei exakter Übereinstimmung. Läufer und Tartan bleiben separate Gestaltungsvorschläge und sind standardmäßig aus.

Abnahme im Teststand

Prüfe den Einstieg aus der Halle, den direkten Einstieg, Umdrehen, alle sechs Ausschnitte, Wide mit automatischem Rückfall, Licht und Ofen, den O04-Hotspot, den Kartentisch mit Originalrückseite und die manuell gestartete Playlist. Prüfe auf dem iPhone, ob abgeschnittene Ziele über die vorhandene Aktionsliste erreichbar sind. Melde Testversion, eingebundene Medien-IDs, betroffene Dateien und die verbleibenden Bildfreigaben zurück. Für Wintergarten, Spieluhrmechanik und Textilien gilt der Freigabestand aus dem Produktionsbericht.

---
Ablage: Auftrags-ID von Claude vergeben (EMFD-P08-VIS-01, nach dem Paket). Paketteile im gemeinsamen Repository unter docs/development/auftraege/EMFD-P08-VIS-01/; Medienzuordnung hier unter auftraege/EMFD-P08-VIS-01-Medienzuordnung.json. Medien: von der Nutzerin direkt auf STRATO /wunderhaus/media/rooms/P08/ (67 Dateien, alle per SHA-256 geprüft), nicht im Repository.
