# 🎯 Dart Card Pro for Home Assistant

Eine performante, anpassbare Custom Lovelace Card für Home Assistant zum Mitzählen bei Dart-Spielen – inklusive **Web Audio API Sound-Output (Caller)** und flexiblen Themes.

---

## 🌟 Features

* ⚡ **Instant Audio-Caller:** Nutzt die Browser Web Audio API für Sound-Wiedergabe mit 0 ms Latenz.
* 🎨 **Theme Support:** Mehrere integrierte Themes (Classic, Neon, Dark, Minimal) sowie Vollanpassung über den UI-Editor.
* 📊 **Statistiken & Average:** Automatische Berechnung des 3-Dart-Averages und Zählung der Aufnahmen.
* ⚡ **Fast-Score Grid:** Schnelleingabe für häufige Scores (26, 41, 60, 100, 180 etc.).
* 🔄 **Reset & Undo:** Spielstand mit einem Klick auf 501 zurücksetzen oder fehlerhafte Eingaben rückgängig machen.
* 🛠️ **UI-Editor:** Vollständig konfigurierbar direkt in der Home Assistant Benutzeroberfläche.

---

## 📦 Installation 

### Über HACS

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=mbssmartsolutions&repository=dart-card-pro&category=plugin)

oder

### Als benutzerdefiniertes Repository hinzufügen
1. Öffne **HACS** in Home Assistant.
2. Klicke oben rechts auf die drei Punkte (`⋮`) → **Benutzerdefinierte Repositories**.
3. Füge die URL dieses Repositories ein:
   `https://github.com/mbssmartsolutions/dart-card-pro`
4. Wähle als Kategorie **Lovelace**.
5. Klicke auf **Hinzufügen** und anschließend auf **Installieren**.
6. Lade dein Dashboard im Browser neu (`Strg + F5`).

---

## 🛠️ Home Assistant Helfer anlegen (`input_number`)

Damit die Karte die Punkte eines Spielers verwalten kann, benötigt sie einen `input_number`-Helfer in Home Assistant.

### Über die Benutzeroberfläche erstellen:
1. Gehe in Home Assistant auf **Einstellungen** → **Geräte & Dienste** → **Helfer**.
2. Klicke unten rechts auf **+ Helfer erstellen** und wähle **Zahlenwert-Eingabe** (`input_number`).
3. Vergib folgende Einstellungen:
   * **Name:** `Dart Score Spieler 1` (oder ein beliebiger Name)
   * **Minimum:** `0`
   * **Maximum:** `501` (oder `1001` für längere Spiele)
   * **Schrittgröße:** `1`
   * **Anzeigemodus:** *Eingabefeld* oder *Schieberegler*
4. Klicke auf **Erstellen**.

*Alternativ in der `configuration.yaml`:*
```yaml
input_number:
  dart_score_player1:
    name: "Dart Score Spieler 1"
    initial: 501
    min: 0
    max: 501
    step: 1
```

---

## 🔊 Sound / Caller einrichten

Damit die Card bei geworfenen Punkten die Zahlen ansagt:

1. Erstelle im Home Assistant Ordner `www` einen Unterordner namens `caller`:
   Pfad: `/config/www/caller/`
2. Platziere deine MP3-Dateien dort. Benenne sie nach den Punktezahlen:
   * `1.mp3`, `2.mp3`, ..., `180.mp3`
3. Falls du den `www`-Ordner neu erstellt hast, starte Home Assistant einmal neu.

> **Hinweis:** In der Karte entspricht der Pfad `/config/www/caller/` der Angabe `caller` im Editor.

---

## ⚙️ Konfiguration (YAML Beispiel)

Du kannst die Karte bequem über den visuelle Editor konfigurieren oder manuell in YAML:

```yaml
type: custom:dart-card-pro
entity: input_number.dart_score_player1
name: Spieler 1
text: Punkte eingeben:
theme: classic
show_avg: true
show_grid: true
enable_sound: true
caller_folder: caller
```

---

<img width="1276" height="797" alt="Bildschirmfoto vom 2026-08-09 23-17-42" src="https://github.com/user-attachments/assets/2bc72543-7270-45fe-80b4-1b4fd63c04c0" />

---

## 📄 Lizenz

Dieses Projekt steht unter der [MIT License](LICENSE).
