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

export const TABLES = {
  PROFILE_ID: 1,
  SETTINGS_ID: 1,
  PLAN_ID: 1,
};
