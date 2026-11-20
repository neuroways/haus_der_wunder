Übergabe an Claude · H00 Direkteintritt und Bildwechsel

20.11.2026 · „Ein Moment für dich · Das Haus der kleinen Wunder“

Ausgangspunkt: Die Halle ist bereits integriert. Setze die Änderung auf dem weiterführenden App-Teststand v0.6.78 im Branch claude/kue-dev-01 (b93ef4e9146bf2cb8f21ddfae054872de18eaf70, App-PR #4) um. Die Hallenintegration stammt aus PR #3. Prüfe vor dem Editieren den aktuellen Branch-HEAD.

1. Direkt eintreten

Bei „Direkt eintreten“ zeigt die App sofort H00-C01, mobil im mittleren Ausschnitt M. Türen, Hotspots, Musik, Hilfe und „Dein Moment“ sind direkt erreichbar. Beim Überspringen entfallen alle drei automatischen Hallenhinweise (welcome, music, moment) einschließlich Hervorhebungen und nachrückender Hinweise. Das gilt auch nach Umdrehen, Raumwechsel, Rückkehr und Reload. Hilfe bleibt bewusst aufrufbar. Die Aktion „Hinweise der Halle erneut zeigen“ darf sie auf ausdrücklichen Wunsch öffnen.

In home/entrance.js rufen die Hinweisaktion enter und der Tür-Hotspot beide enterHouse() auf. Ermittle daher den Eintrittsmodus anhand der Aktion und des bisherigen Tutorialzustands vor dessen Änderung. Gib ihn vor dem Routenwechsel an die Hallenlogik weiter. Speichere die Überspring-Entscheidung über Reload hinweg im vorhandenen Zustandsmodell. Falls der Eintritt außerhalb eines aktiven Tutorials durch den Tür-Hotspot erfolgt, behandle ihn ebenfalls als direkten Eintritt. In home/hall.js startet render() derzeit showNext(). Prüfe die Unterdrückung zentral bei automatischen Aufrufen von showNext(), auch nach dem Schließen anderer Dialoge. Die explizite Hilfeaktion braucht einen eigenen Aufrufpfad. Verwende weder Musikpräferenz noch alte Tutorial-Completion-Flags als Ersatz für den Eintrittsmodus.

Abnahme: Frischer Besuch → Direkt eintreten → sofort interaktive Halle ohne Einblendungen. Erneut prüfen nach Zurück, Umdrehen, Raumwechsel und Reload. Hilfe bewusst öffnen und Hinweise aufrufen. Den freiwilligen Tutorialpfad und die vorhandenen Licht- und Musikeinstellungen als Regression prüfen.

2. H00-C01 gegen das neue Bild tauschen

Verwende die von Svenja angehängte Fassung D0009185-576A-41FF-B222-BD5CC32D5624.jpeg, 1536 × 864, SHA256 496233b6fd5ca9ffd06f2fb02a27f0f2f3e393bf3c6261a0666c0fb62cc3617e. Es ist der Nordblick mit Küche links, Innenhof mittig und Teezimmer rechts. Registriere die Datei unter einem neuen versionierten Medienpfad und referenziere sie für H00-C01 im bestehenden Szenenregister. Aktualisiere daraus abgeleitete Mediengrößen und Offline-Einträge soweit im aktuellen Build erforderlich. H00-C02 bleibt die bestehende Gegenansicht.

Prüfe H00-C01-Hotspots und Bildausschnitte am neuen JPEG. Die frühere C01-Aus-Basis und die Layer aus dem Hallenpaket sind auf den anderen Master mit 1672 × 941 und anderer Bildgeometrie registriert. Für den Test die vorhandene gekennzeichnete Licht-Ersatzdarstellung nutzen, bis die Layer auf die angehängte Fassung angepasst sind. Die angeschnittene Laterne rechts erhält keinen zusätzlichen O08-Hotspot. O08 liegt weiterhin in C02. Bildprüfung mobil in L/M/R und Desktop-Wide. Verwende die bestehenden Szenen- und Hotspot-IDs.

Bildvorlage H00-C01

---
Ablage: Auftrags-ID von Claude vergeben (EMFD-H00-DIREKT-01). Angekommen ist die Bildvorlage als `D0009185-576A-41FF-B222-BD5CC32D5624.png`, PNG 1672 × 941, SHA256 0cd60aa446bf23184e16661987c30b5993b398123c93bd8f9cefddf27662fbae (nicht die beschriebene JPEG-Fassung).
