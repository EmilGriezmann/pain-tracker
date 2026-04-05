# Pain Tracker — Aktueller Stand

Zuletzt aktualisiert: 2026-04-05

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
- Dev-Server läuft auf `http://localhost:5173`

### Schritt 3 — Auth
- `src/hooks/useAuth.js` — Session-Persistenz via Supabase localStorage, `login()` / `logout()`
- `src/pages/LoginPage.jsx` — E-Mail + Passwort Formular mit Fehleranzeige
- `src/App.jsx` — `RequireAuth`-Guard, Weiterleitung auf `/login` wenn nicht eingeloggt
- Kein Registrierungsformular — Account wird einmalig in Supabase Dashboard angelegt

### Schritt 4 — Tagesverlauf (Canvas)
- `src/components/PainCanvas.jsx` — HiDPI-Canvas (devicePixelRatio), 24 diskrete Stunden-Spalten (X), Integer-Snapping Y (0–10), ein Swipe setzt alle durchfahrenen Stunden
- `src/hooks/useEntries.js` — `loadEntry` / `saveEntry` / `loadAllEntries` via Supabase
- `src/pages/TrackingPage.jsx` — Tabs Kopf/Unterbauch, Kurve laden/speichern
- Route `/tracking` in App.jsx

### Schritt 5 — End-of-Day Formular
- `src/components/MultipleChoice.jsx` — Mehrfach- und Einfachauswahl
- `src/pages/EODFormPage.jsx` — 4-Schritt-Wizard (Gesamtschmerz, Ort, Charakter, Begleitsymptome), Tabs Kopf/Unterbauch, Speichern via Supabase
- Begleitsymptome-Optionen noch nicht definiert (Platzhalter-Text in Schritt 4)
- Route `/eod` in App.jsx

### Schritt 6 — Dashboard & UX
- `src/pages/DashboardPage.jsx` — Tagesansicht, datums-flexibel via `/day/:date`, heute via `/today`
- `src/components/NavBar.jsx` — Bottom Navigation (Verlauf / Heute / Abend)
- NavBar in alle Seiten eingebunden

### Schritt 7 — PWA & Deployment
- Icons erstellt: `public/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`
- `.npmrc` mit `legacy-peer-deps=true` für Vercel-Kompatibilität
- GitHub-Repository: https://github.com/EmilGriezmann/pain-tracker
- Vercel-Deployment aktiv (automatische Deploys bei Push auf `main`)
- Canvas: kein Rahmen, volle Breite, Aspect Ratio 1:1

### Schritt 8 — Verlaufs-Homepage (Schmerzkalender)
- `src/pages/HistoryPage.jsx` — neue Homepage (`/`)
- Zwei Heatmap-Blöcke: Kopfschmerzen (Rotskala) + Unterleibsschmerzen (Violettskala)
- Kompaktansicht: letzte 30 Tage als 10×3-Grid, füllt Kartenbreite
- Erweiterte Ansicht: monatlicher Kalender (Mo–So), Monats-/Jahresüberschriften, per Kategorie unabhängig ausklappbar
- Tap auf Kästchen → öffnet Tagesansicht (`/day/:date`)
- Routing: `/` → HistoryPage, `/today` → DashboardPage, `/day/:date` → DashboardPage
- Test-Seed-Script: `scripts/seed-test-user.js` (testpatient@example.com)

---

## Offene Schritte

### Schritt 9 — Statistik-Karten auf der Verlaufs-Homepage
Unter den zwei Heatmap-Blöcken: 4 kleinere Karten (je halbe Breite, 2×2), jede mit Kopf/Unterbauch-Tab:
- **Gesamtschmerz** — Grafik-Typ noch offen (kommt vom Nutzer)
- **Ort** — Grafik-Typ noch offen
- **Charakter** — Grafik-Typ noch offen
- **Begleitsymptome** — Grafik-Typ noch offen

### Weitere offene Punkte
- [ ] Begleitsymptome-Optionen definieren (Kopf + Unterbauch) — aktuell Platzhalter im EOD-Formular
- [ ] Design-Schritt (Farben, Schrift, App-Name)

---

## Projektstruktur (aktuell)

```
sarah_app/
├── public/
│   ├── favicon.svg
│   ├── icon-512.jpg
│   ├── icons.svg
│   └── icons/
│       ├── apple-touch-icon.png  (180×180)
│       ├── icon-192.png          (192×192)
│       └── icon-512.png          (512×512)
├── scripts/
│   └── seed-test-user.js         # Testdaten-Generator
├── src/
│   ├── main.jsx
│   ├── App.jsx                   # Router + Auth-Guard
│   ├── index.css
│   ├── lib/
│   │   └── supabase.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useEntries.js
│   ├── components/
│   │   ├── PainCanvas.jsx
│   │   ├── MultipleChoice.jsx
│   │   └── NavBar.jsx
│   └── pages/
│       ├── LoginPage.jsx
│       ├── HistoryPage.jsx       # Homepage — Schmerzkalender
│       ├── DashboardPage.jsx     # Tagesansicht (heute oder Datum)
│       ├── TrackingPage.jsx
│       └── EODFormPage.jsx
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
- Grau in den Heatmaps = kein Eintrag (nicht vergessen vs. 0 ist unterscheidbar durch Farbe)
- Account-Erstellung nur über Supabase Dashboard
- Testaccount: testpatient@example.com / Test1234!
