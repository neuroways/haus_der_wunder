# EMFD-P04 – Testergebnisse v0.6.20

| Prüfung | Status | Ergebnis |
|---|---|---|
| Atelier erreichbar | PASS | `#atelier` |
| Flurnavigation | PASS | Hin- und Rückweg vorhanden |
| Tischansicht | PASS | `#atelier/tisch/Oxx` |
| 24 Karten erreichbar | PASS | 24 stabile IDs |
| Gruppenfilter | PASS | vier Gruppen, je sechs Karten |
| Zufallskarte | PASS | Auswahl ausschließlich aus O01–O24 |
| Kartentexte | PASS | vollständig zugeordnet und freiwillig geöffnet |
| Vorwärts/Rückwärts | PASS | zyklisch und stabil |
| Direktzugriffe | PASS | Hash-Routen für Karten und Tisch |
| Lichtzustand | PASS | Atelier besitzt und verändert ihn nicht |
| Audio unabhängig | PASS | keine zweite Audioinstanz oder Stop-Aktion |
| Responsive CSS | PASS | Hochformat, Querformat, kleine Breiten |
| Tastatur/Screenreader | PASS | semantische Links, Buttons, Labels und Dialoge |
| Offline | BLOCKED | Basis besitzt keinen Service Worker |
| Regression | PASS | 52 automatisierte Tests bestanden |
| Audiodatei-Test | BLOCKED | Audiodateien wurden nicht binär geliefert |
| iPhone Safari real | BLOCKED | kein physisches Gerät ausgeführt |
| Android Chrome real | BLOCKED | kein physisches Gerät ausgeführt |

Automatisiert: 52 PASS, 0 FAIL, 1 SKIP. Browser: Hauptansicht, Tisch, Übersicht, Filter, Alle-Reset, Kartendetail und Textdialog geprüft.
