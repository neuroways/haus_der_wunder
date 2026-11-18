# EMFD-P08 – Änderungsprotokoll v0.6.21

- `teezimmer.js`: eigenständige P08-Ansicht, bewusste Zufallsauswahl, Kartenübersicht, Hilfe und Rücksprung aus dem Kartendetail.
- `teezimmer.css`: responsive Überlagerung der bestehenden Raumillustrationen, mobile Touchflächen, Querformat und reduzierte Bewegung.
- `app.js`: P08-Routing aus Flur und Raumübersicht; bestehendes `#ort/P08` bleibt kompatibel.
- `index.html`: P08-Runtime und Styles registriert.
- Versionsmetadaten auf v0.6.21 angehoben.
- `tests/teezimmer-p08.test.cjs`: automatisierte P08-Regressions- und Architekturprüfungen ergänzt.
- `media/rooms/teezimmer_p08_background.webp`: verbindliches EMFD-FE-TZ-02-Hintergrundbild übernommen und in P08 sowie der Raumübersicht aktiviert. Der vorläufige JPG-Hintergrund wird nicht mehr referenziert.
