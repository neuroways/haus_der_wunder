# Migrationsprotokoll

## Implementiert

1. Referenz-ZIP und Arbeitskopie vollständig abgeglichen: 279 Dateien identisch. Ausgangs-Gesamttestsatz vor Änderungen gesichert.
2. Gemeinsame Dienste in `shared/` eingeführt und im vorhandenen `index.html` vor ihren Verbrauchern eingebunden; geänderte Skripte erhielten `arch01`-Revisionsparameter. Keine zusätzliche Laufzeitbibliothek.
3. Vorhandenen Hash-Router beibehalten. Neue Navigation beobachtet auch bestehende Links und Browser-Zurück. Feature-Registry und Bibliotheks-Kartenaufruf delegieren Navigation; Cover-/Playlistwechsel nutzen den gemeinsamen Dienst. Rücklinks der Musikunteransichten verwenden die geprüfte Herkunft.
4. Stationen `gramophone`, `records`, `compositions`, `library` registriert. Shell meldet alte Ansichten vor dem Rendern ab. Gerätebindung wird gelöst, Audio läuft weiter. Musik-Renderzähler invalidiert jetzt auch beim Austritt; Erfolg, Fehler und späte Regalmontage können eine andere Station nicht übernehmen.
5. Alleinigen Audiocontroller an `EMFDAudio` angeschlossen. Commands und unveränderliche Snapshots eingeführt. Die bestehende Media-Instanz bleibt alleiniger Eigentumspfad. Türwechsel startet kein Flur-Theme mehr. Kartenübersicht unterbricht nicht mehr pauschal. Navigation in eine gewöhnliche Kartenroute startet keine Musik mehr; vorhandene bewusste Kartenaktionen bleiben erhalten.
6. Katalog- und Kompositionszugriffe nach `EMFDContent` verschoben. Auch Manifest und Kartenzuordnung des Players nutzen den Dienst; der alte Ladepfad bleibt für isolierte Legacy-Verbraucher erhalten. Keine Quelle oder Metadatenfreigabe verändert. Fehlgeschlagene Ladevorgänge sind erneut versuchbar.
7. Bibliotheks-Leserzuordnungen nach `EMFDReaders` verschoben. Direkter Kompositionszugang steht zusätzlich über denselben Dienst bereit. Bestehende Buchseitenaufteilung, Texte, Regalmodule und origin-story-Leser bleiben erhalten.
8. Hilferegister eingeführt; Musiktexte bleiben im Musikmodul, Bibliothek registriert ihre Hilfe selbst. Allgemeine Darstellungshülle liegt in `shared/help-dialog.js` und benutzt den bisherigen Dialog/Handler. Kein zweiter Hilfedialog.
9. Gerätedaten liegen jetzt in einer WeakMap pro übergebenem Host. Tutorialgerät und Grammophon überschreiben nicht länger ein gemeinsames Katalogarray.
10. Filter-Selects erhalten explizite zugängliche Namen; Aussehen und Filterinhalt unverändert. Neue Architekturtests und Regressionen ergänzt; nur verlegte Source-Assertions sowie die ausdrücklich abgelöste Flur-/Karten-Audioregel angepasst.

## Unverändert und überprüft

Alle 24 Karten-IDs, Originaltexte, musikalischen Beschreibungen, Rechte-/Freigabestatus und Medien. Kein Teezimmer-Code oder -Stylesheet geändert. Keine Illustrationen oder Audiodateien hinzugefügt, keine Veröffentlichung. Die vollständige Dateiliste mit SHA-256 vor/nach liegt in den Prüfnachweisen. Das Anwendungsversionfeld bleibt 0.6.64.

## Anschließende unabhängige Weiterentwicklung

| Fachmodul | Stabile Grenze | Nächster möglicher Schritt |
|---|---|---|
| Musikzimmer-Übersicht | Navigation + Stationsregister | Eigene Raumübersicht ergänzen; Routingänderung ausdrücklich beschließen. ARCH-01 führt `#musik/player` nicht vorab ein. |
| Grammophon | Provider `gramophone`, `EMFDAudio`, `EMFDMusicDevice` | Renderfunktion in eigenes Modul verschieben, Transportbindung schrittweise vom Legacy-Controller zum Port verlagern. |
| Plattensammlung | Provider `records`, `EMFDContent.music`, `EMFDAudio.select/playlist` | Galerie-/Filterrenderer als eigenes Modul registrieren; Zustand bleibt fachintern. |
| Kompositionsgeschichten | Provider `compositions`, `EMFDContent`, `EMFDReaders`, `EMFDMusicBooks` | Regal-/Routenadapter auslagern, Buchleser und Originaltexte unverändert nutzen. |
| Bibliothek | Provider `library`, `mountLibrary`, `EMFDReaders` | Eigenständige Katalog-/Regalentwicklung ohne Musikraum-DOM oder Audiozugriff. |

Provider werden genau einmal registriert. Bei der Auslagerung muss der alte Provider entfernt werden; doppelte Eigentümerschaft wird bewusst zurückgewiesen. Neue Module dürfen keine zweite Audioinstanz erzeugen, keine Story-JSON-Dateien kopieren und keine O-IDs umnummerieren. Ein Codeumzug kann in kleinen Schritten erfolgen, weil Routing, Datenzugriff, Leser, Hilfe und Audiokommandos nun gesonderte Verträge besitzen.

## Rücknahme

Zur vollständigen Rücknahme dient das unveränderte Referenz-ZIP. Selektive Rücknahme muss `index.html`, gemeinsame Dienste und Adapter zusammen zurücksetzen; einzelne gemeinsame Skripte zu entfernen würde ihre Verbraucher brechen. `media/` muss für diese Lieferung nicht ersetzt werden. Keine Migration gespeicherter Nutzerdaten erforderlich; bisherige Lautstärke-, Stille-, Lese- und Eintrittspräferenzen behalten ihre Schlüssel.
