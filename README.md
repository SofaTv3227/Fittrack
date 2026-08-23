# FitTrack

Persönliches Fitness-Dashboard – läuft komplett offline im Browser, alle Daten werden lokal in IndexedDB gespeichert (kein Login, keine Server).

## Start

```bash
npm install
npm run dev
```

Öffnet unter `http://localhost:5173`.

## Build

```bash
npm run build
```

## Struktur

- `src/lib` – Berechnungen (BMI/Kalorien/Makros), Trainingsprogramme, Lebensmittel-Datenbank, Tracker-Adapter, PDF-Export, Motivationssprüche
- `src/store/AppContext.jsx` – zentraler State, persistiert in IndexedDB (Dexie)
- `src/pages` – Dashboard, Profil, Trainingsplan, Logbuch, Ernährung, Geräte
- `src/components` – wiederverwendbare UI-Bausteine (Ring-Chart, Makro-Balken, Autocomplete, Layout/Navigation)

## Geräte-Anbindung

Alle Tracker-Adapter (Garmin, Apple Health, Fitbit, Polar, Samsung/Health Connect, Strava, manueller Datei-Import) normalisieren Daten in ein gemeinsames Format (`src/lib/trackerAdapters.js`). Ohne hinterlegte API-Keys laufen sie im Demo-Modus mit generierten Daten; die OAuth 2.0 / PKCE-Struktur (Auth-URL-Aufbau) ist bereits vorbereitet, um echte Anbindungen zu ergänzen.
