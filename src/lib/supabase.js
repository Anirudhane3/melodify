import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Gracefully handle missing env vars (uses demo data as fallback)
let supabase = null;

if (supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co') {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
export const isSupabaseConfigured = !!supabase;
