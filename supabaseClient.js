import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.min.js";

const SUPABASE_URL = "https://uhohygfsqwpmymjhzirs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVob2h5Z2ZzcXdwbXltamh6aXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDQxMDcsImV4cCI6MjA3NDkyMDEwN30.INAsqm24p5IviQzkm9ymyh1Arn0H0TPsBEowVWkJmG4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
