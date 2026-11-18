# Playlist-Filterkorrektur – v0.6.24

Stand: 03.11.2026

Die Auswahl und Ergebniszahl wechselten korrekt, aber ausgefilterte Playlistkarten blieben auf einigen mobilen Browsern sichtbar. `display:grid` überlagerte dort die Darstellung des nativen `hidden`-Attributs.

Korrektur: `music-room.css` enthält nun `.playlist-card[hidden]{display:none}`.

- Alle: 25 Einträge einschließlich Main Theme
- Ruhe: O01–O06
- Kraft: O07–O12
- Halt: O13–O18
- Freude: O19–O24

Die Filterung verändert keine Audiofreigaben und startet keine Wiedergabe.
