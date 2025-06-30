import { createClient } from '@supabase/supabase-js';

const query = process.argv[2] || 'barracas';

async function quickQuery() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  switch (query) {
    case 'barracas': {
      const { data } = await supabase.from('barracas').select('*').order('name');
      console.log('Barracas:', data?.length || 0);
      if (data) console.table(data.slice(0, 5));
      break;
    }
    case 'emails': {
      const { data } = await supabase.from('email_subscriptions').select('*').eq('is_active', true);
      console.log('Active emails:', data?.length || 0);
      if (data) console.table(data.slice(0, 5));
      break;
    }
    case 'weather': {
      const { data } = await supabase.from('weather_cache').select('*').order('cached_at', { ascending: false }).limit(5);
      console.log('Weather cache:', data?.length || 0);
      if (data) console.table(data);
      break;
    }
    default:
      console.log('Usage: npx tsx src/scripts/quickQuery.ts [barracas|emails|weather]');
  }
}
quickQuery(); 