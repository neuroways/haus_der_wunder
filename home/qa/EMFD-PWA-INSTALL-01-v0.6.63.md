# EMFD-PWA-INSTALL-01 · v0.6.63

## Fehler und Ursache
Auf dem iPhone zeigte der Home-Bildschirm-Installationsdialog `https://flowisaurus.de/home/` und `Ein Moment`. Ursache: altes PWA-Manifest (`start_url`, `scope`, `id`, `short_name`); iOS-Metatitel fehlte.

## Behobene Konfiguration
- Name und Kurzname: `Haus der kleinen Wunder`.
- Start-URL und App-Scope: `https://flowisaurus.de/wunderhaus/home/` (ohne `#ankommen` oder `#flur`).
- Apple-Metatitel und HTML-Dokumenttitel aktualisiert.
- Manifest-Verweis hat neue Cache-Version.
- `shared-layout.json`, `deployment-layout.json` und `package.json` angepasst.
- PWA-Pfadtest aktualisiert und drei neue spezifische Regressionstests hinzugefügt.

## Unverändert
- Die interne Standardroute bei leerem Hash bleibt `ankommen` (wird im JavaScript ermittelt, nicht als Fragment in der URL erzwungen).
- Die eigentliche Hausnavigation, Bilder und Audio sowie der Start-02-Ablauf bleiben unverändert.
- Eigene Domain `Haus-der-Wunder.de` wird nicht eingerichtet, weil hierfür DNS/Hosting nötig ist.

## Abnahme auf echtem iPhone
1. Neues `home/`-Paket nach `/wunderhaus/home/` deployen, Manifest und HTML mit frischem Safari-Aufruf prüfen.
2. Bestehende Home-Bildschirm-Installation mit falschem Pfad entfernen und aus Safari neu hinzufügen.
3. Bestätigen, dass Titel `Haus der kleinen Wunder` und Zielpfad `/wunderhaus/home/` angeboten werden (das iPhone kann die Label-Darstellung kürzen).
4. App öffnen, Start-Ablauf und Wiederkehr prüfen. Keine unfreiwillige Weiterleitung auf `/home/`.

Keine Serveränderung, kein Live-Deployment, keine Browsergeräte-Abnahme in diesem Paket.
