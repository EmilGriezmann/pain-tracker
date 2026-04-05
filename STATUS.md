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
- `src/hooks/useEntries.js` — `loadEntry` / `saveEntry` via Supabase upsert
- `src/pages/TrackingPage.jsx` — Tabs Kopf/Unterbauch, Kurve laden/speichern
- Route `/tracking` in App.jsx

### Schritt 5 — End-of-Day Formular
- `src/components/MultipleChoice.jsx` — Mehrfach- und Einfachauswahl
- `src/pages/EODFormPage.jsx` — 4-Schritt-Wizard (Gesamtschmerz, Ort, Charakter, Begleitsymptome), Tabs Kopf/Unterbauch, Speichern via Supabase
- Begleitsymptome-Optionen noch nicht definiert (Platzhalter-Text in Schritt 4)
- Route `/eod` in App.jsx

### Schritt 6 — Dashboard & UX
- `src/pages/DashboardPage.jsx` — Datum, Status-Badges (Kurve / EOD), Kurven-Vorschau readonly, Quick-Action-Buttons, In-App-Erinnerung nach 18:00 Uhr
- `src/components/NavBar.jsx` — Bottom Navigation (Heute / Verlauf / Abend)
- NavBar in alle drei Seiten eingebunden

---

## Offene Schritte

- [ ] Schritt 7 — PWA & Deployment (Icons, Vercel)
- [ ] Schritt 8 — Design (Farben, Icons, Schrift)
- [ ] Begleitsymptome-Optionen definieren

---

## Projektstruktur (aktuell)

```
sarah_app/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx               # Router + Auth-Guard
│   ├── index.css             # Tailwind
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
│       ├── DashboardPage.jsx
│       ├── TrackingPage.jsx
│       └── EODFormPage.jsx
├── KONZEPT.md
├── STATUS.md
├── CLAUDE.md
├── .env.local
├── vite.config.js
├── index.html
└── package.json
```

---

## Bekannte Besonderheiten

- `vite-plugin-pwa` mit `--legacy-peer-deps` installiert (Vite 8 Kompatibilitätsproblem)
- Keine Icons unter `public/icons/` — werden in Schritt 7/8 ergänzt
- Begleitsymptome-Optionen noch nicht definiert
- Account-Erstellung nur über Supabase Dashboard (kein öffentliches Registrierungsformular)
