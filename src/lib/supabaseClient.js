import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cliente único exportado y reutilizado en toda la app.
// IMPORTANTE: usar siempre la anon key (pública), nunca la service role key.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
