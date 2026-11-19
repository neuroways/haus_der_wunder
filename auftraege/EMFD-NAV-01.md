EMFD-NAV-01 · Rückwege und Navigation vereinheitlichen

Version 1.0 · 19.11.2026 · Basis v0.6.66
Status: technisch abgestimmter Entwicklungsauftrag zur Masterfreigabe. Keine Implementierungs- oder Veröffentlichungsfreigabe durch dieses Dokument.

1. Ziel und Quellen

Bestehende Herkunfts-, Tür-/Stations- und Fallbacklogik konsolidieren, nicht neu bauen. Grundlage: Claude-Code-Rückmeldungen zur Codeanalyse v0.6.66, Entscheidungsvorlage v1.2, Integrationsordnung EMFD-INT-01. Vor Umsetzung tatsächlichen Repository-Stand, Routen und Auftrags-ID prüfen; Abweichungen dokumentieren.

2. Anforderungen

• NAV-D01–03: Ein kontextbezogener Rückweg pro untergeordneter Ansicht; tatsächliche interne Herkunft, sichtbarer Zielname mit Linkspfeil, zugänglicher Name „Zurück zu …“ (grammatisch passend). Keine parallelen festen Rücklinks. Logo als unabhängige zentrale Orientierung erhalten.
• NAV-D04–05: Pfeil für Kontext, Tür ausschließlich für tatsächliche räumliche Übergänge, Logo weiterhin direkt zum Flur. Explizite Raumübersicht als Ziel darf als eigenständige Navigation erhalten bleiben, nicht als zweiter Rückweg.
• NAV-D06: Herkunft validieren; keine externen, ungültigen, selbstreferenziellen Ziele oder Rückwegzyklen. Bei fehlender Herkunft fachlicher Fallback gemäß Matrix.
• NAV-D07: Ist das Rückziel nachweislich der unmittelbar vorherige interne History-Eintrag, history.back() bzw. bestehende äquivalente Routerfunktion benutzen. Nicht anhand von history.length oder document.referrer allein entscheiden. Sonst sichere interne Ersatznavigation ohne künstlichen Rücksprung zur gerade verlassenen Ansicht (regelmäßig replace). Browser-Popstate/Hashchange ohne erneutes Pushen verarbeiten; Vorwärtsfunktion erhalten. Direktaufruf darf durch App-Rückweg nicht aus der App führen. Native Browser-Zurück-Funktion nicht global abfangen.
• NAV-D08: Gedankenblatt bleibt Dialog; Schließen kehrt zur unveränderten Karte zurück, inklusive Fokus und sinnvoller Scrollposition; keine zusätzliche Route erforderlich. Dialoge nicht in Rückwegketten einbauen.
• NAV-D09: Tür-/Stationssemantik und räumlichen Kontext als Schnittstelle für PLAYER-01 bereitstellen; keine neuen Raumverbindungen implementieren.

3. Navigationsmatrix

|Ansicht                                     |Rückziel bei gültiger Herkunft                           |Fallback ohne Herkunft                |
|--------------------------------------------|---------------------------------------------------------|--------------------------------------|
|Ankommen                                    |bestehende Einstiegslogik                                |kein erzwungener Rückweg              |
|Flur                                        |gültige interne Herkunft, sofern untergeordnete Ansicht  |zentrale Orientierung, kein Selbstlink|
|Alle Räume                                  |tatsächliche Herkunft                                    |Flur                                  |
|P01–P08 einschließlich Atelier und Teezimmer|Herkunft, z.B. Flur oder Alle Räume                      |Alle Räume                            |
|Musikzimmer                                 |tatsächliche Herkunft                                    |Flur                                  |
|Grammophon/Plattensammlung                  |tatsächliche Herkunft                                    |Musikzimmer                           |
|Kartengalerie                               |tatsächliche Herkunft (Flur, Teezimmer, Atelier usw.)    |Flur                                  |
|Einzelkarte                                 |tatsächliche Herkunft einschließlich Kartentisch/Ankommen|Kartengalerie                         |
|Kompositionsgeschichte (bestehende Route)   |tatsächliche Herkunft                                    |fachlich zugehörige Musikübersicht    |
|Raumgerät (Schnittstelle für PLAYER-01)     |tatsächliche Herkunft                                    |zugehöriger Raum                      |
|Gedankenblatt/andere Dialoge                |schließen, Ursprung bleibt sichtbar                      |kein eigener Routenfallback           |
|ungültige Herkunft                          |nicht verwenden                                          |fachlicher Fallback, sonst Flur       |

Routennamen aus Repository übernehmen; bestehende QR- und Geschichtenlinks kompatibel halten. Herkunft ist nicht gleich räumlicher Kontext. Bei transienten Ansichten (Karte, Galerie, Geschichte, Dialog) aktuellen Ortskontext erhalten. Flur, Alle Räume, Ankommen, Musikzimmer und P01–P08 gelten als eigene Orts-/Ordnungsbereiche. Direktaufruf einer ortsungebundenen Ansicht ohne Herkunft erhält keinen erfundenen Herkunftsraum.

4. Abgrenzung und Medien

Keine Begleiterkarte, keine neue untere Hauptnavigation, keine Raumarchitektur, keine neuen Medien, keine Player-Neuentwicklung, keine Änderung an Karteninhalten, Exporten oder Playlist-Zuordnungen. Audioverhalten wird in PLAYER-01 geändert, nicht hier. Bestehende Musiknavigation nicht regressieren.

5. Abnahmetests

|ID |Test                                                        |Erwartung                                                                    |
|---|------------------------------------------------------------|-----------------------------------------------------------------------------|
|N01|Flur → P01 → App-Rückweg                                    |Flur; kein neuer Rückweg-Eintrag                                             |
|N02|Flur → Alle Räume → P02 → App-Rückweg → Browser-Zurück      |Alle Räume, dann Flur, nicht P02                                             |
|N03|Browser-Vorwärts nach N02                                   |Alle Räume, dann P02, ohne doppelte Einträge                                 |
|N04|Direktaufruf P04/P08/anderer Raum                           |Rückweg Alle Räume, dann Flur; kein App-Verlassen                            |
|N05|QR-Direktaufruf Einzelkarte                                 |Karte zugänglich, Rückweg Kartengalerie, dann Flur                           |
|N06|Galerie aus Atelier/Teezimmer/Flur, Einzelkarte öffnen      |Schrittweise tatsächliche Herkunft                                           |
|N07|Einzelkarte aus Ankommen/Kartentisch                        |tatsächliche Herkunft erhalten                                               |
|N08|Musikzimmer, Grammophon, Sammlung, Geschichte               |bisherige Funktionen und Rückwege erhalten                                   |
|N09|Gedankenblatt öffnen/schließen, wiederholen                 |Karte, Fokus und sinnvoller Scrollzustand; keine History-Schleife            |
|N10|Ungültige, externe, zyklische oder veraltete Herkunft       |sicherer interner Fallback                                                   |
|N11|Reload und Browser-Zurück/Vorwärts                          |keine Schleifen oder ungewollten Pushes                                      |
|N12|alle Rücklinks und Logo                                     |Pfeil für Kontext, Tür nur räumlich, Logo Flur                               |
|N13|Smartphone hoch/quer, Tablet, Desktop, Tastatur/Screenreader|bedienbar, verständliche Namen, sichtbarer Fokus, keine abgeschnittenen Ziele|
|N14|zukünftige Geräteadresse (nach PLAYER-01)                   |Direktlink, Rückweg, Browser-History konsistent                              |

N14 ist ein gemeinsamer Integrationstest, bis PLAYER-01 nicht ausführbar. Nachbarraumwechsel erst testen, wenn echte Verbindungen existieren; keine simulierte UI als Implementierungsnachweis ausgeben.

6. Lieferumfang und Übergabe

Zentral integrieren. Ausgangs-/Zielversion, tatsächliche Dateiliste, Diffs, Routingmatrix mit konkreten Hashes, Tests (bestanden/fehlgeschlagen/nicht getestet/blockiert), offene Punkte und Konflikte dokumentieren. Vollständiges home/-ZIP nach Integrationsordnung; kein media/-ZIP nötig, sofern keine Medien geändert. Keine Live-Veröffentlichung. Bestehende Funktionen durch Regressionstests absichern. PLAYER-01 baut auf dem abgenommenen NAV-01-Stand auf.
