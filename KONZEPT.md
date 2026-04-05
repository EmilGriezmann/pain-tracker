# Pain Tracker · Konzept & Implementierungsplan

## Projektidee

Eine persönliche Progressive Web App (PWA) zum Tracking von Kopf- und Unterleibsschmerzen. Die App läuft im iPhone-Browser und kann auf dem Homescreen installiert werden (wie eine native App, ohne App Store). Einträge werden in der Cloud gespeichert und sind geräteübergreifend verfügbar.

---

## Schmerzkategorien

Die App unterscheidet zwei unabhängige Kategorien:

| Kategorie | Interner Key |
|---|---|
| Kopfschmerzen | `head` |
| Unterleibsschmerzen | `abdomen` |

Jede Kategorie hat dieselbe Struktur: Tagesverlauf + End-of-Day-Formular.

---

## Dateneingabe — Zwei Modi

### Modus 1: Tagesverlauf (jederzeit tagsüber)

Nutzer zeichnet mit Finger oder Apple Pencil eine **Freihand-Kurve** auf einem Koordinatensystem:

- **X-Achse:** Uhrzeit (00:00 – 24:00)
- **Y-Achse:** Schmerzintensität (0 = kein Schmerz, 10 = maximaler Schmerz)
- **Eingabe:** Touch / Pointer Events (Finger + Apple Pencil)
- **Verhalten:** Kurve kann jederzeit gelöscht und neu gezeichnet werden
- **Speicherung:** Array von Punkten `{ time: 0–24, intensity: 0–10 }` als JSON in der Datenbank

### Modus 2: End-of-Day-Formular (abends, einmal täglich)

Geführter Wizard mit 4 Schritten, separat für jede Kategorie:

#### Schritt 1 — Gesamtschmerz (Pflichtfeld)
- Gesamteinschätzung des Schmerztages: Skala 0–10
- Antwortformat: visuelle Auswahl (Zahlen oder Farbverlauf, noch zu entscheiden)

#### Schritt 2 — Ort des Schmerzes

**Kopfschmerzen** (Mehrfachauswahl möglich):
| Kürzel | Beschreibung |
|--------|--------------|
| A | Stirn |
| B | Hinterkopf |
| C | Schläfen |
| D | Ganzer Kopf |

**Unterleibsschmerzen** (Einfachauswahl):
| Kürzel | Beschreibung |
|--------|--------------|
| A | Einseitig |
| B | Beidseitig |

#### Schritt 3 — Charakter des Schmerzes

**Kopfschmerzen** (Mehrfachauswahl möglich):
| Kürzel | Beschreibung |
|--------|--------------|
| A | Dumpf / drückend |
| B | Pulsierend / stechend |

**Unterleibsschmerzen** (Mehrfachauswahl möglich):
| Kürzel | Beschreibung |
|--------|--------------|
| A | Dumpf / drückend |
| B | Pulsierend / stechend |
| C | Krampfartig |

#### Schritt 4 — Begleitsymptome
- Mehrfachauswahl, konkrete Optionen noch zu spezifizieren
- Getrennte Listen für Kopf und Unterbauch
- Optionen sollen später ohne Code-Änderung erweiterbar sein

---

## Authentifizierung & Accounts

- **Registrierung/Login:** E-Mail + Passwort
- **Session:** Dauerhaft (man bleibt eingeloggt, bis man sich aktiv ausloggt)
- **Multi-Device:** Daten sind über alle Geräte zugänglich (Cloud-Sync)
- **Datenschutz:** Jeder Nutzer sieht nur seine eigenen Daten (Row Level Security)

---

## In-App-Erinnerung

- Kein Push-Notification (technisch zu unzuverlässig auf iOS-PWA)
- Stattdessen: **Banner auf dem Dashboard**, wenn:
  - Es nach 18:00 Uhr ist UND
  - Noch kein EOD-Eintrag für heute existiert
- Banner führt direkt zum End-of-Day-Formular
- Kann weggeklickt werden

---

## Geplante zukünftige Features (nicht im MVP)

Diese Features sind konzeptionell geplant. Das Datenmodell ist so ausgelegt, dass sie leicht nachrüstbar sind:

1. **Monatsansicht:** Kalender-Heatmap mit Schmerzintensität pro Tag
2. **Durchschnittlicher Tagesverlauf:** Aggregierte Kurve über viele Tage
3. **Korrelationsanalyse:** Zusammenhang zwischen Kopf- und Unterleibsschmerzen
4. **Offline-Modus:** Einträge lokal puffern, sync bei nächster Internetverbindung
5. **Push-Notifications:** Abend-Erinnerung (erst ab iOS 16.4+ möglich)
6. **Begleitsymptome:** Optionen werden später noch definiert

---

## Tech Stack

| Schicht | Technologie | Begründung |
|---|---|---|
| Frontend | React 18 + Vite | PWA-fähig, schnell, weit verbreitet |
| PWA | vite-plugin-pwa + Workbox | Service Worker, Manifest, Homescreen-Install |
| Styling | Tailwind CSS | Mobile-first, utility-based, schnell |
| Routing | React Router v6 | Standard SPA-Routing |
| Zeichnen | HTML5 Canvas + Pointer Events API | Freihand-Kurven, funktioniert mit Finger + Apple Pencil |
| Backend + DB | Supabase | PostgreSQL, Auth, REST API, kostenlos für persönliche Nutzung |
| Hosting | Vercel | Automatische Deployments, HTTPS, kostenlos |
| State | Zustand | Globaler Auth-State, leichtgewichtig |
| Formulare | React Hook Form | Wizard-Validierung |

---

## Datenmodell

### Tabelle: `daily_entries`

```sql
CREATE TABLE daily_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('head', 'abdomen')),

  -- Tagesverlauf
  curve_data    JSONB,  -- [{ time: 7.5, intensity: 3 }, ...]

  -- End-of-Day Formular
  overall_pain  INT CHECK (overall_pain BETWEEN 0 AND 10),
  location      TEXT[],    -- z.B. ['A', 'C'] = Stirn + Schläfen
  character     TEXT[],    -- z.B. ['B'] = pulsierend
  symptoms      TEXT[],    -- Begleitsymptome (TBD)

  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, date, category)
);

-- Datenschutz: Nutzer sieht nur eigene Daten
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own data only" ON daily_entries
  FOR ALL USING (auth.uid() = user_id);
```

---

## Projektstruktur

```
sarah_app/
├── public/
│   ├── manifest.json          # PWA: Name, Icons, Display-Modus
│   └── icons/                 # App-Icons (192x192, 512x512)
├── src/
│   ├── main.jsx
│   ├── App.jsx                # Router + Auth-Guard
│   ├── lib/
│   │   └── supabase.js        # Supabase Client
│   ├── hooks/
│   │   ├── useAuth.js         # Login, Logout, Session
│   │   └── useEntries.js      # CRUD Tageseinträge
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── TrackingPage.jsx   # Freihand-Kurve zeichnen
│   │   └── EODFormPage.jsx    # End-of-Day Formular (4 Schritte)
│   └── components/
│       ├── PainCanvas.jsx     # Canvas-Zeichenfläche
│       ├── MultipleChoice.jsx # Wiederverwendbare MC-Auswahl
│       ├── CategoryTab.jsx    # Kopf / Unterbauch Tabs
│       ├── NavBar.jsx         # Bottom Navigation
│       └── InAppReminder.jsx  # Abend-Erinnerungs-Banner
├── .env.local                 # Supabase Keys (nicht in Git!)
├── vite.config.js
└── package.json
```

---

## Implementierungsphasen

### Phase 1 — Setup
- Vite React Projekt erstellen
- Tailwind CSS konfigurieren
- vite-plugin-pwa konfigurieren
- React Router einrichten
- Supabase-Projekt anlegen, `.env.local` erstellen
- Vercel verknüpfen

### Phase 2 — Auth
- Datenbank-Schema in Supabase anlegen
- Supabase Client (`src/lib/supabase.js`)
- Login-Seite (E-Mail + Passwort)
- Auth-Guard (uneingeloggte Nutzer → `/login`)
- Persistente Session

### Phase 3 — Tagesverlauf
- `PainCanvas.jsx`: Canvas + Touch/Pointer Events
- Koordinaten → Zeit/Intensität umrechnen
- Kurve speichern und laden
- `TrackingPage.jsx` mit Kategorie-Tabs

### Phase 4 — End-of-Day Formular
- `MultipleChoice.jsx` Basiskomponente
- 4-Schritt-Wizard
- Alle Optionen einpflegen
- Speichern + Laden

### Phase 5 — Dashboard & UX
- Dashboard mit Tagesübersicht
- In-App-Erinnerung (nach 18 Uhr, kein EOD-Eintrag)
- Bottom Navigation
- PWA Manifest + iOS Meta-Tags

### Phase 6 — Deployment & Test
- Test auf echtem iPhone (Safari → Homescreen)
- Apple Pencil + Finger Eingabe testen
- Session-Persistenz prüfen
- Vercel Deployment finalisieren

---

## Entschiedene Punkte

- [x] **App-Name:** Pain Tracker
- [x] **Intensitätsskala:** Numerisch, 0–10
- [x] **App-Icons & Farbschema:** Wird erst nach vollständiger Funktions-Implementierung festgelegt
- [ ] **Begleitsymptome:** Optionen für Kopf und Unterbauch noch offen — werden in einer späteren Session definiert. Platzhalter im Code vorsehen.
