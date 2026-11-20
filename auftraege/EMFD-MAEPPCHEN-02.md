EMFD · Mäppchen der Begleiterkarte

Entwicklungsübergabe für Claude · v0.2 · 20.11.2026

(Ablage-ID in diesem Repository: EMFD-MAEPPCHEN-02. Beigefügt: `EMFD-Gluehwuermchen-Serie-v0.2.zip` – README, asset-register.json und fünf PNGs, abgelegt unter `media/maeppchen/gluehwuermchen-v0.2/`.)

Setze die Ansichten im aktuellen bei dir vorliegenden Bilderbuch-Build um. Diese Übergabe ersetzt die bisherigen Vorgaben zum Aufbau der Ansichten und zum Zeitpunkt des Musikstarts. Teste mit O21 „Der Tanz der Blätter“ aus der aktuellen iPhone-Ansicht und mit einer zweiten Karte, etwa O08 „Die Laterne“.

1. Aufbau der Bühne

|Bereich                       |Smartphone und schmale Fenster                                                                                                                                                                                   |PC/Wide                                                                                                                                                        |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
|Kopfzeile                     |Links **Zurück zum Mäppchen** in den Detailansichten. Im Mäppchen selbst führt **Schließen** zurück zum Raum. Kartentitel und kontextbezogene Aktionen bleiben erreichbar.                                       |Gleiche Rückwege. Eine gemeinsame Kopfzeile über der Bühne.                                                                                                    |
|Mäppchen                      |Das offene Mäppchen belegt die Bühne. Beim Antippen löst sich das gewählte Stück aus seinem Fach und ersetzt das Mäppchen in der Bühne. Das Stück beginnt direkt unter der Kopfzeile.                            |Mäppchen links, gewähltes Stück rechts auf derselben Tischfläche. Als Startwert ca. 40/60 Prozent. Ohne Auswahl bleibt rechts die Tischfläche frei.            |
|Leserichtung                  |Ein aktiver Inhalt und ein vertikaler Scrollbereich. Langer Text und große Schrift scrollen in der Detailansicht.                                                                                                |Rechts je nach Platz eine Seite oder Doppelseite. Kopfzeile und Rückweg bleiben erreichbar.                                                                    |
|Hörmoment                     |Eigene Szene innerhalb derselben Bühne. Oben das quadratische Cover, darunter die Begleiterkarte mit dem Glühwürmchen am unteren Rand. Die Hand kommt beim Start kurz von unten ins Bild.                        |Hörszene rechts auf einer deckenden Nachtfläche. Cover und Begleiterkarte dürfen nebeneinander stehen. Flugweg und Aufsetzpunkt an die Kartenposition anpassen.|
|Musik während anderer Aktionen|Bei laufender Musik am unteren Rand eine kleine Bedienzeile mit Liedtitel und **Pausieren**, gegebenenfalls **Weiterhören** bei pausierter Wiedergabe. Eingabefokus und Tastatur bestimmen den verfügbaren Platz.|Dieselbe Audiosteuerung, ohne Überlagerung des Lesetexts.                                                                                                      |

Wide ist ein Layout derselben Funktion. Nutze den vorhandenen aktiven Wide-Modus, sobald im Container ausreichend Platz ist. Falls der Stand keine passende Schwelle hat, starte mit 960 CSS-Pixeln verfügbarer Breite und 560 CSS-Pixeln Höhe. Darunter Einzelansicht. Drehung, Fenstergrößenwechsel und Umschalten erhalten Auswahl, Buchseite, Entwurf und Audioposition. Eine Browser-Zurück-Aktion aus dem Detail führt, sofern die App-Navigation dafür verwendet wird, erst ins Mäppchen. Fokus geht bei Rückkehr zum auslösenden Stück.

2. Stücke im Mäppchen und ihre Detailansichten

|Stück            |Erkennbar im Fach                                                                                     |Detail und Handlung                                                                                                                   |
|-----------------|------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
|Motivkarte       |Originalillustration sichtbar in der oberen Öffnung.                                                  |Aufrecht und vollständig, Titel einmal darunter und vorhandene Exportaktion erreichbar.                                               |
|Affirmationskarte|Elfenbein, Blattmotiv, sichtbares Etikett **Impuls**.                                                 |Originalimpuls groß, als echter Text auf dem Papier.                                                                                  |
|Fragekarte       |Blaugrau, Stern, sichtbares Etikett **Frage**.                                                        |Originalfrage als eigener Lesemoment. Aktion **Gedankenbuch öffnen** führt zum Entwurf, ohne Eingabefokus auszulösen.                 |
|Gedankenbuch     |Petrolfarbener Stoffeinband mit sichtbarem Etikett **Gedankenbuch**.                                  |Die Buchseite ist die eigentliche Schreibfläche. Frage auf Wunsch als kleines Kärtchen oberhalb bzw. daneben.                         |
|Geschichtenheft  |Helles fadengeheftetes Heft mit Etikett **Geschichten** und kleinem Ausschnitt der Kartenillustration.|Behalte die warme Papieroptik der aktuellen Leseansicht. Text beginnt oben auf der Seite. Langer Text bleibt skalierbar und scrollbar.|
|Papierfalter     |Matte Papierfigur in der Lasche.                                                                      |**Hörmoment öffnen** legt den Falter auf die vorhandene Hand. Bewusste Berührung löst den kurzen Übergang zur Karte aus.              |

Etiketten als HTML-Text mit Kontrast auf den vorhandenen Einbänden und Karten platzieren. Die erkennbaren Flächen mitsamt Namen sind als Schaltflächen bedienbar. Bestehenden Karten-, Buch- und Exportcode wiederverwenden.

iPhone-Schreiben: Die Tastatur erst beim Tippen auf die Schreibfläche aufrufen. Sobald sie erscheint, passt sich der Scrollbereich an die tatsächlich sichtbare Fläche an. Das Fragekärtchen kann sich zu Frage anzeigen einklappen und die Musikzeile Platz freigeben. Aktuelle Zeile und Rückweg bleiben erreichbar. Entwurf bleibt mit derselben Begleitung verknüpft.

3. Hörmoment und Rückgabe

1. Papier → kurzer Flug → Landung. Verwende das Glühwürmchen-Paket v0.2. Flügel nur im kurzen Flug bewegen. Auf der unteren Kartenecke zur festen Sitzpose wechseln. Dann Lied über den bestehenden Player starten und das Cover ruhig einblenden. Bei reduzierter Bewegung direkt überblenden. Falls der Browser den verzögerten Start blockiert, bleibe in der Sitzpose und biete Lied abspielen an.
2. Lied läuft. Das Glühwürmchen sitzt mit angelegten Flügeln und gleichmäßigem Licht. Tipp auf Pausieren dimmt es einmal sanft. Cover und Sitzpose bleiben stehen. Fortsetzen setzt die Wiedergabe an derselben Stelle fort. Beim Verlassen der Hörszene kann das Lied beim Lesen oder Schreiben weiterlaufen.
3. Karte zurücklegen. Die Aktion liegt im Mäppchen. Falls der Hörmoment offen ist, wechsle zuerst zum Mäppchen. Zeige dann die Bestätigung im Vordergrund und sperre die dahinterliegenden Aktionen. Noch behalten schließt die Rückfrage und erhält Begleitung, Entwurf und Wiedergabe. Erst bestätigtes Zurücklegen beendet die Begleitung und stoppt ihr Lied. Danach ist eine neue Ziehung möglich.
4. Cover und Lied über die aktive Karten-ID aus dem Musikkatalog laden. Dasselbe quadratische Cover wie im Musikzimmer vollständig einschließlich Rahmen anzeigen. Für Entwicklung darf das vorhandene Arbeitscover aus dem Player-Paket eingesetzt werden. Die Freigabe richtet sich nach dem Coverregister beziehungsweise dem aktuell freigegebenen Austauschstand.

Szenenauswahl und Wiedergabestatus unabhängig führen. Im mobilen Layout ist nur die aktive Ansicht im Bedien- und Fokusablauf. Beim Bestätigungsdialog darf keine Animation oder Bedienfläche den Dialog überdecken.

4. Medien und offene Punkte

• Mäppchen-Medien v0.1 für Leder, Fächer, Karten, Bücher, Hand, Holztisch und Nachthimmel.
• Glühwürmchen-Serie v0.2 für Papierfalter, Flugkörper, zwei Flügel und Sitzpose. Ansatzpunkte stehen im Assetregister.
• Player-Gesamtpaket mit 25 Covern enthält freigegebene und offene Arbeitsstände. O21 ist laut übermitteltem Stand noch offen. Nach Freigabe dasselbe Asset in beiden Ansichten aus dem Musikkatalog beziehen.
• Für den Wide-Test vorhandene Hochformat-Hintergründe verwenden. Erst nach Sichtprüfung entscheiden, ob Holztisch oder Himmel eine seitlich erweiterte 16:9-Fassung braucht.

5. Abnahme

• iPhone mit O21. Impuls, Frage, beide Bücher und Motivkarte sind im Mäppchen unterscheidbar. Nach jedem Antippen beginnt der gewählte Inhalt im sichtbaren Bereich.
• Frage lesen → Gedankenbuch öffnen → sichtbar schreiben → zurück → erneut öffnen. Tastatur erscheint erst bei Berührung der Seite, Zeile bleibt sichtbar, Entwurf bleibt erhalten.
• Hörmoment starten → Landung → korrektes Lied und Cover → pausieren → an gleicher Position fortsetzen. Während der Wiedergabe keine Dauerschleife. Bei reduzierter Bewegung funktioniert der gleiche Ablauf.
• Bei laufendem Lied zum Mäppchen und zum Text wechseln. Rückgabe öffnen und abbrechen, dann erneut öffnen und bestätigen. Auswahl und Schaltflächen bleiben sichtbar und bedienbar. Bestätigung stoppt das Begleitlied.
• Wide und schmalen Rückfall mit offener Buchseite, Entwurf und Wiedergabe testen. O08 als zweite Karten-ID prüfen.

Rückmeldung an Svenja mit geändertem Build, bestandenen Fällen und konkret fehlenden Dateipfaden.
