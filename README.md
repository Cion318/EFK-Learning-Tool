# EFK Learning Tool

Eine vollständig clientseitige Lernplattform für die IHK-Prüfung **Elektrofachkraft für Industrie** – als statische Single-Page-App, ohne Backend, direkt über GitHub Pages veröffentlichbar.

---

## Inhaltsverzeichnis

1. [Projektstruktur](#projektstruktur)
2. [GitHub Pages aktivieren](#github-pages-aktivieren)
3. [Lokale Vorschau](#lokale-vorschau)
4. [Kapitel-Konfiguration (`chapters/index.json`)](#kapitel-konfiguration)
5. [Neues Kapitel hinzufügen](#neues-kapitel-hinzufügen)
6. [JSON-Format & Pflichtfelder](#json-format--pflichtfelder)
7. [DE/EN-Dateipaar-Anforderungen](#deen-dateipaar-anforderungen)
8. [Namenskonventionen](#namenskonventionen)
9. [Farbwelt & Design](#farbwelt--design)
10. [localStorage & Datenspeicherung](#localstorage--datenspeicherung)
11. [Prüfungslogik](#prüfungslogik)
12. [Technische Annahmen](#technische-annahmen)

---

## Projektstruktur

```
efk-learning-tool/               ← Repository-Wurzel
│
├── docs/                        ← GitHub Pages Root (aus /docs veröffentlichen)
│   ├── index.html               ← Einzige HTML-Datei (SPA-Shell)
│   ├── assets/
│   │   ├── styles.css           ← Alle Styles (Design-Token-basiert)
│   │   └── app.js               ← Gesamte App-Logik (kein Build nötig)
│   └── chapters/
│       ├── index.json           ← Kapitel-Reihenfolge & Bezeichnungen
│       ├── de/
│       │   ├── EFK01.json       ← Deutsche Fragen für Kapitel EFK01
│       │   └── EFK02.json
│       └── en/
│           ├── EFK01.json       ← Englische Fragen für Kapitel EFK01
│           └── EFK02.json
│
└── README.md                    ← Diese Datei
```

> **Wichtig:** Alle Dateien liegen unter `docs/`. GitHub Pages veröffentlicht ausschließlich aus diesem Ordner.

---

## GitHub Pages aktivieren

1. Repository auf GitHub erstellen und alle Dateien pushen.
2. Repository → **Settings** → **Pages** öffnen.
3. Unter **Source** den Branch `main` (oder `master`) auswählen.
4. Unter **Folder** den Eintrag **`/docs`** wählen.
5. Auf **Save** klicken.
6. Nach kurzer Wartezeit ist die App unter `https://<username>.github.io/<repo-name>/` erreichbar.

> GitHub Pages kann 1–2 Minuten für den ersten Deploy benötigen.

---

## Lokale Vorschau

Da die App `fetch()` für JSON-Dateien nutzt, ist ein lokaler HTTP-Server nötig (Browser blockiert `file://`-Fetch aus Sicherheitsgründen).

**Einfachste Methode (Python):**

```bash
# Python 3
cd docs
python3 -m http.server 8080
# Dann im Browser: http://localhost:8080
```

**Alternative (Node.js):**

```bash
npx serve docs
```

**Alternative (VS Code):**  
Extension „Live Server" installieren, dann `docs/index.html` mit Rechtsklick → „Open with Live Server" öffnen.

---

## Kapitel-Konfiguration

### Datei: `docs/chapters/index.json`

Diese Datei steuert, **welche Kapitel existieren** und **in welcher Reihenfolge** sie in der UI erscheinen. Die Kapitel werden **nicht** alphabetisch sortiert, sondern exakt in der hier definierten Reihenfolge angezeigt.

```json
{
  "chapters": [
    { "key": "EFK01", "label": "EFK01 – Grundlagen der Elektrotechnik" },
    { "key": "EFK02", "label": "EFK02 – Schutzmaßnahmen und Sicherheit" },
    { "key": "EFK03", "label": "EFK03 – Betriebsmittel und Normen" }
  ]
}
```

| Feld    | Typ    | Bedeutung |
|---------|--------|-----------|
| `key`   | String | Eindeutiger Bezeichner – **muss exakt** dem Dateinamen entsprechen (ohne `.json`) |
| `label` | String | Angezeigter Name in der UI (Dropdown, Breadcrumb) |

> **Hinweis:** Die Reihenfolge in dieser Datei bestimmt die UI-Reihenfolge. Einträge die hier fehlen, werden **nicht** geladen, auch wenn die JSON-Dateien existieren.

---

## Neues Kapitel hinzufügen

Schritt für Schritt:

1. **Deutsche Fragedatei erstellen:**  
   `docs/chapters/de/EFK03.json`  
   (mit korrekter JSON-Struktur, siehe unten)

2. **Englische Fragedatei erstellen:**  
   `docs/chapters/en/EFK03.json`  
   (gleiche Anzahl Fragen, gleiche `id`-Werte)

3. **`chapters/index.json` ergänzen:**
   ```json
   { "key": "EFK03", "label": "EFK03 – Betriebsmittel und Normen" }
   ```
   an gewünschter Position im `"chapters"`-Array einfügen.

4. **Committen & Pushen:**
   ```bash
   git add docs/chapters/
   git commit -m "Add chapter EFK03"
   git push
   ```

5. **GitHub Pages** veröffentlicht automatisch innerhalb von ~1 Minute.

---

## JSON-Format & Pflichtfelder

### Schema

```json
{
  "questions": [
    {
      "id": 1,
      "type": "wissen",
      "difficulty": "leicht",
      "category": "Optionales Feld",
      "question": "Fragetext",
      "answers": {
        "A": "Antwort A",
        "B": "Antwort B",
        "C": "Antwort C",
        "D": "Antwort D",
        "E": "Antwort E"
      },
      "correct_answer": "B",
      "explanation": "Begründung warum B korrekt ist."
    }
  ]
}
```

### Pflichtfelder pro Frage

| Feld             | Typ    | Erlaubte Werte              | Beschreibung |
|------------------|--------|-----------------------------|--------------|
| `id`             | Zahl   | Beliebige Zahl              | Eindeutig **innerhalb** einer Datei; kann zwischen Kapiteln kollidieren – die App verwendet intern `KAPITEL::ID` |
| `type`           | String | `"wissen"` oder `"rechnung"` | Fragetyp |
| `difficulty`     | String | `"leicht"`, `"mittel"`, `"schwer"` | Schwierigkeitsgrad |
| `question`       | String | –                           | Fragetext |
| `answers`        | Objekt | Mind. 2 Einträge (A–E empfohlen) | Antwortoptionen |
| `correct_answer` | String | Muss Key in `answers` sein  | Korrekte Antwort |
| `explanation`    | String | –                           | Erklärung der richtigen Antwort |

### Optionale Felder

| Feld       | Typ    | Beschreibung |
|------------|--------|--------------|
| `category` | String | Thematische Kategorie – wird aktuell nicht in der UI genutzt, kann für eigene Auswertungen nützlich sein |

### Validierungsregeln (automatisch geprüft)

Die App prüft beim Laden jeder Datei:

- Alle Pflichtfelder vorhanden
- `type` ist `wissen` oder `rechnung`
- `difficulty` ist `leicht`, `mittel` oder `schwer`
- `correct_answer` existiert als Key in `answers`
- Mindestens 2 Antwortoptionen vorhanden
- Gültige JSON-Struktur

Fehler werden dem Nutzer direkt in der UI angezeigt.

---

## DE/EN-Dateipaar-Anforderungen

Jedes Kapitel **muss** in beiden Sprachen vorliegen:

```
docs/chapters/de/EFK01.json   ← Deutsch
docs/chapters/en/EFK01.json   ← Englisch
```

**Zwingend einzuhalten:**

| Anforderung | Detail |
|-------------|--------|
| Gleiche Anzahl Fragen | DE und EN müssen identisch viele Fragen enthalten |
| Gleiche `id`-Werte | Frage 1 in DE hat dieselbe `id` wie Frage 1 in EN |
| Gleiche Antwort-Keys | Wenn DE `"A"`–`"E"` hat, muss EN ebenfalls `"A"`–`"E"` haben |
| Gleicher `correct_answer` | Die korrekte Antwort ist identisch (`"B"` in DE = `"B"` in EN) |
| Gleicher `type` | `wissen`/`rechnung` ist identisch – dieser Begriff bleibt intern immer auf Deutsch |
| Gleiche `difficulty` | `leicht`/`mittel`/`schwer` – intern immer auf Deutsch |

> **Tipp:** `type` und `difficulty` sind interne Schlüssel und werden immer auf Deutsch gespeichert, auch in der englischen Datei (`"type": "wissen"`, `"difficulty": "leicht"`). Nur `question`, `answers` und `explanation` werden übersetzt.

---

## Namenskonventionen

| Was | Convention | Beispiel |
|-----|------------|---------|
| Kapitel-Schlüssel | Großbuchstaben + Ziffern, kein Leerzeichen | `EFK01`, `NORM05`, `SCHUTZ02` |
| JSON-Dateinamen | Exakt wie der `key` in `index.json`, mit `.json` | `EFK01.json` |
| `id` innerhalb einer Datei | Ganzzahlen, ab 1, aufsteigend | `1, 2, 3, …` |
| Sprach-Verzeichnis | Kleinbuchstaben, ISO 639-1 | `de/`, `en/` |

---

## Farbwelt & Design

Die App orientiert sich am IHK-Corporate-Design:

| Variable              | Hex-Wert  | Verwendung |
|-----------------------|-----------|------------|
| `--color-primary`     | `#003A70` | IHK-Blau, nah an Pantone 294 C (Web: #003171). Leicht aufgehellt für bessere Lesbarkeit auf Monitoren. |
| `--color-primary-dark`| `#002554` | Hover-Zustände, dunkle Akzente |
| `--color-accent`      | `#E87722` | IHK-Orange, für CTAs und Prüfungs-Elemente |
| `--color-bg`          | `#F5F6F8` | Seitenhintergrund (helles Grau) |
| `--color-surface`     | `#FFFFFF` | Karten-Oberfläche |

> **Farbbegründung:** Pantone 294 C entspricht ungefähr `#003F87` in sRGB. Der gewählte Wert `#003A70` liegt etwas dunkler und hat ein besseres Kontrastverhältnis zu weißem Text (WCAG AA: ≥ 4,5:1 – erreicht bei dieser Kombination). Das IHK-Orange `#E87722` wird sparsam als Akzent eingesetzt.

Alle Farben, Abstände und Radii sind als CSS Custom Properties in `assets/styles.css` unter Abschnitt 1 (Design Tokens) definiert und können dort einfach angepasst werden.

---

## localStorage & Datenspeicherung

Die App speichert drei Werte im Browser-localStorage:

| Key              | Inhalt | Beschreibung |
|------------------|--------|--------------|
| `efk_lang`       | `"de"` oder `"en"` | Gewählte Sprache, wird beim Start wiederhergestellt |
| `efk_exam_state` | JSON-Objekt | Laufende Prüfung (Fragen, Antworten, Timer, Position). Wird beim Abschluss oder beim Start einer neuen Prüfung gelöscht. |
| `efk_history`    | JSON-Array | Bis zu 20 abgeschlossene Prüfungen |

> **Hinweis:** localStorage ist **pro Browser und Gerät** lokal gespeichert. Daten werden **nicht** zwischen Geräten synchronisiert. Beim Löschen des Browser-Verlaufs können diese Daten verloren gehen.

### Wiederherstellung laufender Prüfungen

Wenn die Seite während einer Prüfung neu geladen oder der Tab geschlossen wird, erkennt die App beim nächsten Aufruf die unterbrochene Prüfung und bietet an, diese fortzusetzen. Timer werden dabei korrekt wiederhergestellt (Gesamtzeit und Einzelzeiten pro Frage).

---

## Prüfungslogik

Die Prüfung besteht **immer** aus genau 20 Fragen mit fester Verteilung:

| Typ | Schwierigkeit | Anzahl |
|-----|--------------|--------|
| Wissen | Leicht | 5 |
| Wissen | Mittel | 5 |
| Wissen | Schwer | 5 |
| Rechnung | Leicht | 2 |
| Rechnung | Mittel | 2 |
| Rechnung | Schwer | 1 |
| **Gesamt** | | **20** |

- Bestehensgrenze: **50 %** (10 von 20 Fragen korrekt)
- Zeitlimit: **60 Minuten**
- Unbeantwortete Fragen zählen als **falsch**
- Bei „Alle Kapitel" werden Fragen gleichmäßig über Kapitel verteilt (Round-Robin)
- Fehlen in einem Kapitel nicht genug Fragen für die Verteilung, wird die Prüfung **blockiert** mit verständlicher Fehlermeldung

---

## Technische Annahmen

1. **Kein Build-Prozess:** Die App läuft mit purem HTML, CSS und JavaScript (ES2020+). Alle modernen Browser werden unterstützt (Chrome/Edge/Firefox/Safari der letzten 2 Jahre).

2. **Fetch-API:** Lädt JSON-Dateien per `fetch()`. Funktioniert nur unter HTTP(S), nicht unter `file://`.

3. **Google Fonts:** Inter wird von `fonts.googleapis.com` geladen. Bei fehlendem Internetzugang greift der System-Font-Stack als Fallback.

4. **Keine externe Abhängigkeit:** Kein npm, kein Webpack, kein Framework. Eine einzige `.js`-Datei + eine `.css`-Datei.

5. **Intern:** `type` und `difficulty` sind immer deutsche Schlüssel (`wissen`, `rechnung`, `leicht`, `mittel`, `schwer`), auch in englischen JSON-Dateien. Nur angezeigter Text wird übersetzt.

6. **Interne Fragen-ID:** Da `id`-Werte zwischen Kapiteln kollidieren können, verwendet die App intern `KAPITELKEY::ID` (z. B. `EFK01::5`) als eindeutigen Schlüssel.

---

## Kurzanleitung: Neues Kapitel ergänzen

```
1. docs/chapters/de/MEIN_KAPITEL.json  → erstellen
2. docs/chapters/en/MEIN_KAPITEL.json  → erstellen
3. docs/chapters/index.json            → Eintrag hinzufügen
4. git add docs/chapters/
5. git commit -m "Add chapter MEIN_KAPITEL"
6. git push
→ GitHub Pages veröffentlicht automatisch
```

---

*EFK Learning Tool – Für die IHK Elektrofachkraft für Industrie. Keine Gewähr für Vollständigkeit oder Prüfungsrelevanz der enthaltenen Fragen.*
