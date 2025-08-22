import { createClient } from '@supabase/supabase-js';

async function queryAll() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  const tables = ['barracas', 'email_subscriptions', 'weather_cache', 'visitor_analytics', 'stories', 'barraca_registrations'];
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`❌ Query error for ${table}:`, error);
    } else {
      console.log(`${table}: ${count || 0} records`);
    }
  }
}
queryAll(); 