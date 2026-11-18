# EMFD-START-02 · Änderungsprotokoll v0.6.61

Stand: 05.11.2026  
Basis: EMFD v0.6.60 Bibliothek 2.0  
Status: lokale, testfähige Entwicklungsfassung; keine Veröffentlichung

## Ergebnis

- Neue Besucher sehen zuerst die bestehende Haustür. Nach der Medienprüfung wird die Tür freigegeben.
- Der Geschenkablauf besitzt die Zustände `closed`, `opening`, `letter-visible`, `gift-card-visible` und `completed`.
- Umschlaganimation, Brief und Geschenkkarte können übersprungen werden. Reduzierte Bewegung wird berücksichtigt.
- Nach dem Geschenk öffnet sich der Flur und einmalig eine überspringbare Einführung zu Laterne, Grammophon, Türen, Karten und Hilfe.
- Die Installationshilfe unterscheidet iOS, unterstützte Installationsaufforderung und allgemeines Browsermenü. Sie bleibt freiwillig.
- Geschenk, Einführung und Installationshinweis werden unabhängig gespeichert. Wiederkehrende Besuche wiederholen sie nicht automatisch.
- „Über dieses Geschenk“ öffnet den Brief erneut; die Hilfe kann Einführung und Installationshinweis erneut öffnen.
- Der Lichtzustand des Flurs bleibt erhalten und ist auch bei fehlendem Flurbild bedienbar.
- Es gibt kein Autoplay. Die automatische Musikabfrage beim Einstieg wurde entfernt; eine Einstellung startet keine Wiedergabe.
- START-02 lädt höchstens zwei Bilder gleichzeitig. Die frühere vollständige Kartenbild-Vorladung wurde durch eine bedarfsgesteuerte Einzelreparatur ersetzt.
- Das Bildcache-Limit ist konsistent auf 20 MiB gesetzt.

## Neue Dateien

- `start-gate-v0.6.61.css`
- `tests/start-02-v0.6.61.test.cjs`
- `qa/browser-start02-check.cjs`
- fünf Browser-Prüfbilder unter `qa/start02-*.png`
- die vier START-02-Berichte unter `qa/`

## Geänderte Laufzeitdateien

- `start-gate.js`
- `app.js`
- `card-preload.js`
- `image-service-worker.js`
- `music-entry.js`
- `index.html`
- `package.json`
- `manifest.webmanifest`
- `deployment-layout.json`
- `README.md`
- `file-hashes.json`

Mehrere vorhandene Tests wurden ausschließlich auf die Versionskennung 0.6.61, die bereits aktive Cache-Kennung oder den neuen Geschenk-Wiedereinstieg angepasst. Karten-, Musik-, Teezimmer-, Gedankenblatt- und Bibliotheksinhalte wurden nicht redaktionell verändert.

## Nicht geändert

- Keine neuen Bilder oder Audiodateien erzeugt.
- Keine Medien in das `home/`-ZIP aufgenommen.
- Keine Veröffentlichung und keine Änderung an Live-Systemen.
- Keine neue Audioarchitektur, keine neuen Karten- oder Raumidentitäten.
