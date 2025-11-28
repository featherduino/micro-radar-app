/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_N8N_CHAT_WEBHOOK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
