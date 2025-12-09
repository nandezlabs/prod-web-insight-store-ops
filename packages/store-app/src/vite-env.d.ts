/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DB_STORES: string;
  readonly VITE_DB_FORM_DEFINITIONS: string;
  readonly VITE_DB_CHECKLISTS: string;
  readonly VITE_DB_ANALYTICS_LOGS: string;
  readonly VITE_GEOFENCE_RADIUS_METERS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
