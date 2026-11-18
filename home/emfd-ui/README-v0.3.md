# EMFD UI Components v0.3 – skalierbare SVG-Rahmen

Weiterentwicklung von v0.2; keine Änderungen an der Host-PWA. Keine zusätzlichen Raum- oder Kartenbilder.

## Start

Im Paketordner `python3 -m http.server 8080` ausführen, dann `http://localhost:8080/demo.html` öffnen. Lokaler Webserver nötig wegen ES-Modulen.

## Integration

- `css/`, `js/` **und** `assets/frames/` zusammen übernehmen. CSS-URLs sind relativ zur CSS-Datei.
- Stylesheet `css/emfd-ui.css` laden, umgebendes Element mit `emfd-ui` versehen.
- `import {button, icon, roomCard, bottomNav} from './js/emfd-ui.js'`.
- Beispiel: `button({label:'Eine Tageskarte ansehen',iconName:'star',variant:'primary',frame:'ornate',full:true})`.
- `frame:'simple'` für schlichten SVG-Rahmen, `frame:'ornate'` für dekorative Ecken. `variant:'ornate'` bleibt aus v0.2 kompatibel.
- Für Navigation `href` setzen; für Aktionen `onClick`. Keine Autoplay- oder Backend-Logik.

## Technik

- 9-Slice-SVG-Rahmen: vier Eckbereiche behalten ihre Geometrie, die Seitenkanten strecken sich.
- Text und Icons bleiben echte DOM-Elemente und lassen sich austauschen; mehrzeilige Labels bleiben möglich.
- SVG-Rahmen haben `pointer-events:none`; Fokusindikator und Interaktion bleiben HTML/CSS.
- Keine zusätzlichen Abhängigkeiten, keine globale Eventregistrierung.

## Prüfgrenzen

Die Rahmendetails sind eigenständige vektorbasierte Annäherungen an die Mockups, **keine nachgezeichneten Pixelkonturen**. Tests auf echten Geräten, Browser-Screenshots und Barrierefreiheitsabnahme stehen aus. Sehr schmale Buttons unter 90 CSS-Pixel sind für die ornamentale 9-Slice-Variante nicht vorgesehen. Farben und Schriften bleiben abstimmbar.
