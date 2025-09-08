// FIX: Removed the triple-slash directive for "vite/client" as it was causing a type resolution error.
// This can happen in environments where TypeScript configuration isn't perfectly aligned with Vite.
// Manually defining the types for `import.meta.env` for the used variables is a safe workaround.

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
