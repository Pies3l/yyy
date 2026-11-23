// Supabase connection for the board and anonymous page-view counts.
// The publishable (anon) key is meant to be public: what it can do is limited by the
// database's row-level security and functions in supabase/schema.sql.
// Leave both empty to run the site without the board and analytics.
export const SUPABASE_URL = 'https://ukkphczkthpiosuezgfj.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_6bI_-WqCLu73dqaIOznDag_FmpTBSij';
