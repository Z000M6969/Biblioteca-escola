import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://uhohygfsqwpmymjhzirs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVob2h5Z2ZzcXdwbXltamh6aXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDQxMDcsImV4cCI6MjA3NDkyMDEwN30.INAsqm24p5IviQzkm9ymyh1Arn0H0TPsBEowVWkJmG4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,       // ✅ guarda login no localStorage
    autoRefreshToken: true,     // ✅ renova automaticamente
    detectSessionInUrl: true,   // ✅ essencial pra GitHub Pages
  },
});
