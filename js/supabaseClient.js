const SUPABASE_URL = "https://ganeyvtjqzdptydltrbs.supabase.co";

const SUPABASE_KEY = "sb_publishable_-xzhTlz6UWYMpsCNtaXe_w_372b5Ai0";

window.supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);