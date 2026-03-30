import { createClient } from '@supabase/supabase-js'

// Vite usa 'import.meta.env' para leer el archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validamos que existan las variables para evitar errores raros
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Supabase credentials are missing in .env file!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)