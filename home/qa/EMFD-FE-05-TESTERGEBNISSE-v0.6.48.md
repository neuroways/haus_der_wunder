# EMFD-FE-05 – Testergebnisse v0.6.48

| Prüfung | Status | Ergebnis |
|---|---|---|
| 24 stabile O-IDs | PASS | O01–O24 vollständig und sortiert. |
| Vier Gruppen mit je sechs Karten | PASS | Ruhe, Kraft, Halt und Freude jeweils 6. |
| Alle entdecken | PASS | 24 Karten. |
| Keine Vorauswahl beim Erstbesuch | PASS | Einladung wird ohne gesetzte Sitzungsauswahl gerendert. |
| Gruppenwechsel | PASS | Alle fünf Auswahlmöglichkeiten bleiben erreichbar. |
| Kartenbildpfade | PASS | O01–O24 entsprechen Register und `imageSourceId`. |
| Direkte Kartenlinks | PASS | Bestehendes Routing `#karte/Oxx` bleibt unabhängig. |
| Rückkehrzustand | PASS | Gruppe und Scrollposition werden in `sessionStorage` erhalten. |
| Kartentexte | PASS | Keine automatische Textöffnung; vorhandene Detailfunktion unverändert. |
| Audiohoheit | PASS | Kein neuer Player, kein Autoplay, kein Start/Stopp im Ateliercode. |
| Bildproportionen | PASS | 7:12-Container mit `object-fit: contain`; kein Beschnitt. |
| Touch und horizontales Scrollen | PASS | 48-Pixel-Aktionen, zweispaltiges Grid, Seitenoverflow unterdrückt. |
| Reduzierte Bewegung | PASS | bestehende und neue Übergänge werden deaktiviert. |
| Lokale visuelle Prüfung | PASS | Einladung und Gruppengalerie in der lokalen Browser-Vorschau geprüft; CSS-Konflikt im Galeriekopf erkannt und behoben. |
| iPhone Safari auf realem Gerät | BLOCKED | In dieser Umgebung kein reales iPhone verfügbar. |
| Android Chrome auf realem Gerät | BLOCKED | In dieser Umgebung kein reales Android-Gerät verfügbar. |
| Live-Deployment | BLOCKED | Nicht ausgeführt; ausdrücklich nicht freigegeben. |

Automatisierte FE-05-, Atelier-, Medien- und Paketprüfungen wurden mit Node Test ausgeführt. Das vollständige Regressionsergebnis ist Bestandteil der Übergabe; umgebungsabhängige Servertests werden getrennt ausgewiesen, falls sie keinen lokalen Port öffnen können.
