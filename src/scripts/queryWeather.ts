import { createClient } from '@supabase/supabase-js';

async function queryWeather() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('weather_cache')
    .select('*')
    .order('cached_at', { ascending: false })
    .limit(5);
  if (error) {
    console.error('❌ Query error:', error);
    process.exit(1);
  }
  console.log(`✅ Found ${data?.length || 0} weather cache entries`);
  if (data) console.table(data.map(w => ({ location: w.location, temperature: w.temperature, cached_at: w.cached_at })));
}
queryWeather(); 