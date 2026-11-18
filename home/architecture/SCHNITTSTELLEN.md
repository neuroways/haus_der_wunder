# Schnittstellenverträge · Version 1

Alle Pfade beziehen sich auf `home/`. Bestehende Globals bleiben kompatibel; neue Fachmodule verwenden die folgenden Dienste. Die Factory-Exporte für Node erlauben Tests ohne Browser und erzeugen keine zweite produktive Instanz.

## Navigation · `shared/navigation.js`

- `route(value): string|null`: erlaubte interne Hash-Route; keine externen URLs, freien Pfadstücke, O00/O25 oder ungeprüften Rücksprungziele.
- `station(route): string|null`: unter anderem `gramophone`, `records`, `compositions`, `library`, `hall`. P04-/P08- und Haus-Aliase werden derselben Station zugeordnet.
- `go(route,{origin?,returnTo?,kind?,trigger?}={}): boolean`: validiert und setzt Hash; startet/stoppt keine Musik. Optionaler Trigger dient der Rückkehrposition. `kind` ist `door`, `station` oder `return`.
- `getContext()`: unveränderliches `{version,id,from,to,origin,kind,door,returnTo}`. `door` wird aus tatsächlichen Stationsgrenzen berechnet, unabhängig von einer gewünschten Übergangsdarstellung. Zwischen Grammophon, Sammlung und Kompositionsregal ist es `false`. Zwischen Bibliothek und Musikbereich ist es `true`.
- `returnRoute(fallback='#flur')`: geprüftes Rückkehrziel. Bei direktem Einstieg ohne Herkunft greift der geprüfte Fallback.
- `back(fallback='#flur')`: navigiert zu diesem Ziel, ohne `history.back()` auf eine externe Seite anzuwenden. Verschachtelte Rückkehr und Browser-Zurück werden entwirrt.
- `subscribe(fn)`: liefert Abmeldefunktion. Zusätzlich Browser-Ereignis `emfd:navigation` mit Kontext in `detail`.
- `capture(trigger?)`, `ready()`: Shell/Renderer-Hooks für Fokus und Scrollposition. Rückkehr sucht ID oder semantischen Link-/Buchschlüssel und fällt auf `main` zurück; ein alter Frame darf einen neueren nicht fokussieren.

Kontext bleibt innerhalb dieser geöffneten Anwendung im Arbeitsspeicher. Ein Reload/Direktlink erhält einen sicheren Fallback, keine vermeintlich rekonstruierte Herkunft. Browser-Vorwärts wird als neue validierte Navigation behandelt. Türkennzeichnung ist Metadatum für vorhandene/künftige Übergänge, keine neue Animation.

```js
EMFDNavigation.go('#musik/geschichten/O13', {
  origin:'#ort/P02', returnTo:'#ort/P02', trigger:button
});
// Nach Rückkehr wird der frühere Raum nicht durch einen späten Ladevorgang ersetzt.
EMFDNavigation.back('#musik');
```

Cover- und Geschichtenansichten nutzen den gemeinsamen Rückweg bereits. Ein Direktaufruf hat weiterhin den Musikplayer als Fallback. Ein aus der Bibliothek geöffnetes Kompositionsbuch bietet die sichere Rückkehr zur Bibliothek. Feste Links „Zum Flur“ behalten ihre Bedeutung.

## Stationen · `shared/stations.js`

`register(id,{render(host,options),leave(host)})` registriert genau einen Provider. Doppelte IDs und unvollständige Provider werden abgewiesen. `render(id,host,options)` gibt das Ergebnis des Providers zurück, auch ein Promise. `leave(host)` ist idempotent; `leaveAll()` wird vom Router vor dem Ersetzen der Seite aufgerufen. `list()` liefert registrierte IDs.

Registriert: `gramophone`, `records`, `compositions`, `library`. Kompositionsprovider akzeptiert `{cardId}` für einen Direktaufruf. Ein Provider darf ausschließlich seinen Host und eigene Dialoge bearbeiten. `leave` muss Listener und Ansichtsbindungen lösen und laufende Renderanfragen invalidieren. Es darf keine Audiositzung stoppen. Auch ein später fehlgeschlagener alter Provider darf einen neueren Provider nicht abmelden.

## Audio · `shared/audio.js`

`EMFDAudio` ist ein Port des vorhandenen `EMFDMusic`, kein Player. Nur der Bootstrap des zentralen Controllers ruft `attach(controller)` auf. Zweiter anderer Eigentümer wird abgewiesen. `publish()` ist ein Infrastrukturhook des Controllers.

- `snapshot()`: unveränderlicher Zustand mit `version`, `ready`, `state`, `pending`, `track`, `entryId`, `volume`, `enabled`, `globalSilence`, `repeat`, `queue`, `recordPlaced`, `message`. `track` enthält nur Identitäts-/Anzeigeangaben, keine Media-Instanz. `queue` ist eine eingefrorene Kopie.
- `subscribe(fn)`: sofortiger initialer Snapshot und weitere Änderungen; Rückgabe meldet ab.
- `select(entryId,{play=false,explicit=false,keepQueue=false})`: vorhandene Auswahl. `play:true` bei einem Cover wahrt Stille; `explicit:true` ist ausschließlich ein bewusster Start.
- `playlist(entryIds)`: vorhandene gefilterte Reihenfolge, ohne unbekannte Fassungsdateien zu erraten; fehlende Dateien werden wie bisher übersprungen.
- `availability(entryId)`: `checking`, `unknown`, `available`, `missing`.
- `command(name,value?)`: `play`, `pause`, `stop`, `next`, `previous`, `repeat` (`track`/`once`/`playlist`), `volume` (endliche Zahl 0–1), `silence`. Liefert den Delegationserfolg bzw. das vorhandene Wiedergabe-Promise; ohne Controller `false`. Ein Start bedeutet eine Anforderung, erst `state:'playing'` bestätigt Wiedergabe.

Navigation ist kein Audiobefehl. Ein bereits laufendes Stück bleibt beim Flur-, Musikstations-, Bibliotheks- und Kartenübersichtswechsel erhalten. Start am Grammophon und explizite Eintrittsentscheidung dürfen starten. Vorhandene bewusste Stille, Pause, Stoppen, Ruhemodus, Sichtbarkeits-/Seitenlebenszyklus und das bisherige Verhalten für gezogene verdeckte Karten bzw. Rückkehr ins Teezimmer bleiben bestehen. Wiederholung, natürliches Ende und Fehler bleiben in `audio-session.js` / `music-player.js`.

## Inhalte · `shared/content.js`

- `cardIds`: eingefroren exakt O01–O24; `isCardId(id)` prüft diese Menge.
- `music()`: Promise des bisherigen erweiterten Katalogs mit `primaryItems` (25), `items`/`playerItems` (32). Beschreibungen und Cover stammen aus vorhandenen Metadaten. Keine neuen Freigaben oder Audionachweise.
- `compositions()`: Promise von `{catalog,media}`. Prüft genau 24 eindeutige Karten-IDs. Coverpfade kommen aus der bestehenden Beschreibung; Volltexte werden nicht kopiert oder neu erzeugt.
- `story(cardOrEntryId)`: passende Originalgeschichte oder `null`. Varianten werden nur über den tatsächlichen Katalog auf ihre O-ID bezogen. Theme erhält keine erfundene Kompositionsgeschichte.
- `cardForEntry(entryId)`: O-ID oder `null`; keine Ableitung aus einem beliebigen Stringpräfix.
- `musicForCard(cardId)`: Aufnahme ausschließlich über `card-music-map.json` und `music-manifest.json`, sonst `null`.
- `musicManifest()` / `cardMusicMap()`: unabhängig ladbare Originalquellen für den Controller. Ein Fehler der Kartenzuordnung blockiert nicht das separat verfügbare Theme.
- `musicSources()`: gebündelte Manifest-Tracks und Kartenzuordnungen, wenn ein Verbraucher beide benötigt.
- `storyRoute(cardId)`: validierter bestehender Direktlink oder `null`.

Promises pro Quelldatei werden dedupliziert; erfolglose Requests werden aus dem Cache entfernt und können wiederholt werden. Ergebnisse sind tief eingefroren. Editierbare Ansichtszustände gehören in Fachmodule. Audio-HEAD-Verfügbarkeit ist bewusst kein Inhaltscache und wird weiter vom Controller erneuert.

## Leser · `shared/readers.js`

`openBook(id,trigger?)` öffnet vorhandene Bibliotheksbücher über `EMFDOriginStory.open` und liefert `false` für unbekannte/geplante Bücher. `weltenweberin` wählt `idee`/`character_worldweaver`, `klangwelten` wählt `musik`; keine Textduplikate.

`openComposition(cardOrEntryId,trigger?)` lädt die Originalgeschichte, öffnet über den bestehenden `EMFDMusicBooks.openStory` im gemeinsamen Leser und liefert ein Promise<boolean>. `false` bei fehlender Geschichte/Leser oder veralteter Ansicht. Ladefehler werden an den aufrufenden Adapter weitergegeben; dieser zeigt seine eigene Fehlermeldung. Ein neuerer Aufruf, Routenwechsel oder entfernter Trigger verhindert die verspätete Öffnung.

`EMFDMusicBooks.createBook/openStory/mount` bleiben die vorhandenen kompatiblen Umsetzungen für paginierte Kompositionen. Die Bibliothek steuert niemals deren Raum-DOM.

## Hilfe · `shared/help.js`, `shared/help-dialog.js`

`register(id,{matches(context),title,sections,priority=0})` mit `sections:[[Überschrift,Text],…]` liefert eine Abmeldefunktion; doppelte IDs sind Fehler. `resolve({route,navigation})` liefert den passendsten Eintrag nach Priorität oder `null`. `list()` liefert die Kontext-IDs. Höchste Priorität gewinnt, bei Gleichstand Registrierungsreihenfolge.

Musik registriert `music-room`, `music-collection`, `music-books`; der Bibliotheksadapter registriert `library`. Die gemeinsame Dialoghülle erweitert den vorhandenen Hilfehandler und stellt Inhalte beim Schließen wieder her. Ohne Registertreffer bleibt die bestehende Karten-/Atelier-/Teezimmerhilfe zuständig. Bestehende Schließen-, Fokus-, Tutorial- und Installationshilfe bleiben wiederverwendet. Inhalte werden als Text eingefügt.
