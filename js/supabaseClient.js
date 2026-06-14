const SUPABASE_URL = "https://ganeyvtjqzdptydltrbs.supabase.co";
const SUPABASE_KEY = "sb_publishable_...";

window.supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);