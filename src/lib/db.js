import Dexie from 'dexie';

export const db = new Dexie('fittrack');

db.version(1).stores({
  profile: 'id',
  settings: 'id',
  plan: 'id',
  logs: '++id, date',
  foods: '++id, name',
  recipes: '++id, name',
  meals: '++id, date, section',
  water: 'date',
  devices: 'id',
  deviceData: '++id, provider, type, date',
});

// v2: Basketball-Einzeltraining — eigene Tabelle, komplett unabhängig von den
// generierten Wochenplänen. Regenerieren/Umschalten von Stufe/Tagen löscht hier nie etwas.
db.version(2).stores({
  profile: 'id',
  settings: 'id',
  plan: 'id',
  logs: '++id, date',
  foods: '++id, name',
  recipes: '++id, name',
  meals: '++id, date, section',
  water: 'date',
  devices: 'id',
  deviceData: '++id, provider, type, date',
  bballLogs: '++id, date',
});

// v3: Laufprotokolle, Ziele, Gamification (XP/Level) — additive, keine bestehende Tabelle verändert.
db.version(3).stores({
  profile: 'id',
  settings: 'id',
  plan: 'id',
  logs: '++id, date',
  foods: '++id, name',
  recipes: '++id, name',
  meals: '++id, date, section',
  water: 'date',
  devices: 'id',
  deviceData: '++id, provider, type, date',
  bballLogs: '++id, date',
  runLogs: '++id, date',
  goals: '++id',
  gamification: 'id',
});

export const TABLES = {
  PROFILE_ID: 1,
  SETTINGS_ID: 1,
  PLAN_ID: 1,
  GAMIFICATION_ID: 1,
};
