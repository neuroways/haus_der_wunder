# Testergebnisse · EMFD-ARCH-01

Prüfstand: 7. November 2026, lokale unveröffentlichte Anwendung. Node-Testläufe und interaktive Browserprüfung.

## Automatisierte Ergebnisse

| Prüfsatz | Ergebnis |
|---|---|
| Neue Architekturtests | **30 bestanden, 0 fehlgeschlagen** |
| Architektur + gezielte Bestandsregression | **148 bestanden, 0 fehlgeschlagen** |
| Gesamter älterer Prüfsatz vor Änderungen | 275 Tests: 234 bestanden, 40 fehlgeschlagen, 1 übersprungen |
| Gesamter Prüfsatz nach Änderungen | 305 Tests: 264 bestanden, dieselben 40 fehlgeschlagen, 1 übersprungen |
| Zusätzliche Fehler gegenüber dem Referenzstand | **0** |

Der Gesamttestsatz ist ausdrücklich nicht vollständig grün. Der gespeicherte Vergleich führt alle 40 schon vorhandenen Fehler namentlich auf. Dazu gehören ältere Versions-/Oberflächenannahmen und im lokalen Bestand fehlende externe Medien. Diese Fehler wurden nicht durch Abschalten von Tests verdeckt. Vier bestehende Testdateien wurden hinsichtlich verschobener Verantwortlichkeiten aktualisiert: Story-Datenzugriff, Leserzuordnung und die durch ARCH-01 ausdrücklich abgelöste automatische Flur-/Karten-Audioregel. Die neue Regel ist zusätzlich mit ausführbaren Audio-/Navigationstests abgesichert.

## Nachgewiesene Architekturgrenzen

- Alle 25 kanonischen Stücke werden über den gemeinsamen Audioport ausgewählt, gestartet, pausiert und gestoppt; dabei wird insgesamt genau eine Media-Instanz angelegt. Die sieben nicht zugeordneten Fassungen erhalten keine geratenen Audiodateien.
- Laufende Musik, Pause und bewusste Stille bleiben über Musikunterstationen, Bibliothek und Flur erhalten. Laufende Musik behält dieselbe Media-Instanz, Abspielposition und Play-Aufrufzahl. Auch die Kartenübersicht unterbricht nicht mehr pauschal.
- Ein Türwechsel startet kein Audio, auch nicht bei gespeicherter Musikzustimmung. Bewusster Start, Reihenfolge, Wiederholung, natürliches Ende, Audiofehler, fehlende Dateien und Lautstärke verwenden weiterhin den einen Controller.
- Alle 24 unveränderten Geschichten sowie der tatsächliche Variantenbezug öffnen den vorhandenen Leser. Theme und ungültige O-IDs erhalten keine erfundenen Geschichten. Bibliotheksbücher behalten ihre bisherigen Originalabschnitte.
- Gemeinsame Quellen werden bei parallelen Zugriffen nur einmal angefragt; Daten sind unveränderlich; Fehlversuche lassen sich wiederholen. Das Musikmanifest bleibt unabhängig von einem fehlgeschlagenen Karten-Mapping ladbar.
- Navigation weist externe bzw. ungültige Rückkehrziele ab, kennzeichnet Türen/Stationswechsel, behandelt Direktlinks, Browser-Zurück, verschachtelte Rückkehr und schnell aufeinanderfolgende Ziele.
- Späte erfolgreiche/fehlerhafte Musikanfragen und Regalmontagen können einen anderen Host bzw. Fokus nicht übernehmen. Stationsabbau ist idempotent. Ein alter abgelehnter Provider meldet keinen neuen ab.
- Zwei Gerätehosts besitzen getrennte Katalogbindungen. Der reale Bibliotheksadapter montiert idempotent, delegiert Leser/Navigation und gibt seinen eigenen Bereich frei.
- Das Hilferegister priorisiert konkrete Kontexte, lässt Abmeldung zu und erhält den bestehenden Rückfall. Modulgrenzen- und Ladefolgetests verhindern zusätzliche Audioerzeuger und direkte fremde DOM-Zugriffe.

## Interaktive Browserprüfung

Normaler Browserbereich und mobile 390 × 844 px; temporäre Größenänderung anschließend zurückgesetzt.

1. Bibliothekscover → Buchrückseite → „Buch lesen“ öffnet den bisherigen 13-Kapitel-Leser.
2. Bibliothek → Kompositionsgeschichte O03 öffnet exakt „Das unbeschriebene Blatt“. Nach Schließen zeigt das Regal den Rückweg zur Bibliothek. Rückkehr stellt Fokus auf den auslösenden Story-Link wieder her. In der mobilen gescrollten Ansicht lag die Rückkehr bei 456,5 px nach zuvor 464 px; die neu verfügbare Seitenhöhe begrenzt die Position.
3. Sammlung: Halt + Trance + Cello liefert „Die Wurzel“, 1 Platte. Der Story-Link öffnet O13; Rückweg heißt „Zurück zur Plattensammlung“. Alle drei Filter und der einzelne Treffer bleiben erhalten.
4. Cover-Klick bei fehlender Aufnahme führt zum Grammophon mit „Die Wurzel“, leerem Plattenteller und dem bestehenden freundlichen Suchhinweis. Kein fälschlicher Wiedergabestatus.
5. Musikzimmer-Hilfe erscheint im vorhandenen Dialog. Nach Stationswechsel zeigt die unveränderte Teezimmer-Hilfe wieder ihre bisherigen Inhalte; kein neuer Dialog oder Überschreiben des Rückfalls.
6. In den geprüften Browser-Fehlerlogs keine TypeError-, ReferenceError-, SyntaxError- oder Unhandled-Meldungen. Erwartete fehlende externe Mediendateien bleiben als eigene Bestandsgrenze bestehen.

## Grenzen der Abnahme

Die lokalen Audiodateien O01–O24 und THEME fehlen weiterhin. Automatisierte Transportprüfungen nutzen kontrollierte Audio-Doubles mit den echten Manifest-/Mappingdaten; sie beweisen Zustandsführung, Zuordnung und eine Instanz, nicht den realen Klang. Ein Hörtest aller 25 Originaldateien, Codec-/Dauerprüfung, iPhone-Audiositzung und physische Wiedergabe bleiben mit den Originalmedien nachzuholen. Gleiches gilt für produktive Server-/Installationsbedingungen; veröffentlicht wurde nichts.

Kein Teezimmer-Code, keine Texte, Karten-IDs, Medien oder Freigaben wurden verändert. Die erhaltenen Bestandsdateien und alle neuen/geänderten Dateien sind mit SHA-256 im Prüfarchiv dokumentiert.
