# Pain Tracker — Aktueller Stand

Zuletzt aktualisiert: 2026-04-06

---

## Erledigte Schritte

### Schritt 1 — Supabase
- Projekt angelegt: `pain-tracker`
- Region: West EU (Ireland)
- Tabelle `daily_entries` erstellt (SQL aus KONZEPT.md)
- Row Level Security aktiviert, Policy `"own data only"` gesetzt
- Keys in `.env.local` hinterlegt

### Schritt 2 — Projekt-Grundgerüst
- Vite + React 18 aufgesetzt
- Tailwind CSS v4 via `@tailwindcss/vite` konfiguriert
- `vite-plugin-pwa` installiert (mit `--legacy-peer-deps`, da Vite 8 noch nicht offiziell unterstützt)
- Pakete: `react-router-dom`, `@supabase/supabase-js`, `react-hook-form`, `zustand`
- `vite.config.js` konfiguriert (React + Tailwind + PWA-Plugin)
- `index.html` mit iOS-Meta-Tags und Titel "Pain Tracker"
- `src/index.css` auf Tailwind-Basis gesetzt
- Ordnerstruktur angelegt: `src/lib/`, `src/pages/`
- `src/lib/supabase.js` — Supabase-Client

### Schritt 3 — Auth
- `src/hooks/useAuth.js` — Session-Persistenz via Supabase localStorage, `login()` / `logout()`
- `src/pages/LoginPage.jsx` — E-Mail + Passwort Formular mit Fehleranzeige
- `src/App.jsx` — `RequireAuth`-Guard, Weiterleitung auf `/login` wenn nicht eingeloggt
- Kein Registrierungsformular — Account wird einmalig in Supabase Dashboard angelegt

### Schritt 4 — Tagesverlauf (Canvas)
- `src/components/PainCanvas.jsx` — HiDPI-Canvas (devicePixelRatio), 24 diskrete Stunden-Spalten (X), Integer-Snapping Y (0–10), ein Swipe setzt alle durchfahrenen Stunden
- `src/hooks/useEntries.js` — `loadEntry` / `saveEntry` / `loadAllEntries` / `loadEntriesInRange` via Supabase
- `src/pages/TrackingPage.jsx` — Tabs Kopf/Unterbauch, Kurve laden/speichern
- Route `/tracking` in App.jsx

### Schritt 5 — End-of-Day Formular
- `src/components/MultipleChoice.jsx` — Mehrfach- und Einfachauswahl, `color`-Prop
- `src/pages/EODFormPage.jsx` — 4-Schritt-Wizard (Gesamtschmerz, Ort, Charakter, Begleitsymptome), Tabs Kopf/Unterbauch
- Begleitsymptome-Optionen noch nicht definiert (→ Schritt 12)
- Route `/eod` in App.jsx

### Schritt 6 — Dashboard & UX
- `src/pages/DashboardPage.jsx` — Tagesansicht, datums-flexibel
  - Heute: Canvas editierbar, kein EOD-Inline
  - Vergangene Tage: Canvas editierbar + EOD inline (Gesamtschmerz, Ort, Charakter, Begleitsymptome direkt anklickbar)
  - Vor/Zurück-Navigation zwischen Tagen
- `src/components/NavBar.jsx` — Bottom Navigation (Verlauf / Heute / Abend)
- Routing: `/today`, `/day/:date`, `/day/:date/:category`

### Schritt 7 — PWA & Deployment
- Icons erstellt: `public/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`
- `.npmrc` mit `legacy-peer-deps=true` für Vercel-Kompatibilität
- GitHub-Repository: https://github.com/EmilGriezmann/pain-tracker
- Vercel-Deployment aktiv (automatische Deploys bei Push auf `main`)

### Schritt 8 — Verlaufs-Homepage (Schmerzkalender)
- `src/pages/HistoryPage.jsx` — neue Homepage (`/`)
- Zwei Heatmap-Blöcke: Kopfschmerzen (Rotskala) + Unterleibsschmerzen (Violettskala)
- Kompaktansicht: letzte 30 Tage als 10×3-Grid
- Erweiterte Ansicht: monatlicher Kalender (Mo–So) mit Monats-/Jahresüberschriften, per Kategorie ausklappbar
- Tap auf Kästchen → öffnet kategoriespezifische Tagesansicht (`/day/:date/:category`)

### Schritt 9 — Statistik-Seiten
- `src/pages/StatsPage.jsx` — Route `/stats/:category`
- Zeitraum-Selector: 7 / 30 / 90 Tage
- Häufigkeitslisten für Ort, Charakter, Begleitsymptome (Balken relativ zum Zeitraum)
- Einstiegskarten auf HistoryPage

### Schritt 10 — Farbthemen
- `src/lib/colors.js` — zentrale Farbkonfiguration (Kopf = rot, Unterbauch = violett)
- Farben in PainCanvas, TrackingPage, DashboardPage, StatsPage, EODFormPage, MultipleChoice übernommen

---

## Offene Schritte

### Schritt 12 — Begleitsymptome (nächste Session)

**12a — Standard-Optionen definieren**
- Symptom-Optionen für Kopf und Unterbauch vom Nutzer durchgeben lassen
- In drei Dateien eintragen: `EODFormPage.jsx`, `DashboardPage.jsx`, `StatsPage.jsx`

**12b — Eigene Symptome anlegen**
- Nutzer kann eigene Begleitsymptome erstellen
- Erscheinen in EOD-Eingabe und Statistiken
- Gespeichert in neuer Supabase-Tabelle `user_symptoms` (user_id, category, value, label)

### Weitere offene Punkte
- [ ] Design-Schritt (App-Name, Schrift, Feintuning)

---

## Projektstruktur (aktuell)

```
sarah_app/
├── public/
│   ├── favicon.svg
│   ├── icon-512.jpg
│   └── icons/
│       ├── apple-touch-icon.png  (180×180)
│       ├── icon-192.png          (192×192)
│       └── icon-512.png          (512×512)
├── scripts/
│   └── seed-test-user.js         # Testdaten-Generator (lokal, nicht im Repo)
├── src/
│   ├── main.jsx
│   ├── App.jsx                   # Router + Auth-Guard
│   ├── index.css
│   ├── lib/
│   │   ├── supabase.js
│   │   └── colors.js             # Kategorie-Farbkonfiguration
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useEntries.js
│   ├── components/
│   │   ├── PainCanvas.jsx        # color-Prop
│   │   ├── MultipleChoice.jsx    # color-Prop
│   │   └── NavBar.jsx
│   └── pages/
│       ├── LoginPage.jsx
│       ├── HistoryPage.jsx       # Homepage — Schmerzkalender + Statistik-Einstieg
│       ├── DashboardPage.jsx     # Tagesansicht (inline editierbar)
│       ├── TrackingPage.jsx
│       ├── EODFormPage.jsx
│       └── StatsPage.jsx         # Häufigkeitsstatistiken pro Kategorie
├── KONZEPT.md
├── STATUS.md
├── CLAUDE.md
├── .env.local
├── .npmrc
├── vite.config.js
├── index.html
└── package.json
```

---

## Bekannte Besonderheiten

- `vite-plugin-pwa` mit `--legacy-peer-deps` / `.npmrc` (Vite 8 Kompatibilitätsproblem)
- Null-Slots (nicht gezeichnete Stunden) werden nicht gespeichert; Wert 0 wird gespeichert — korrekt unterschieden
- Grau in den Heatmaps = kein Eintrag; leichtestes Rot/Violett = Schmerz 1
- Account-Erstellung nur über Supabase Dashboard
- Testaccount: testpatient@example.com / Test1234!
