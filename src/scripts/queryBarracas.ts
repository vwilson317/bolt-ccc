import { createClient } from '@supabase/supabase-js';

async function queryBarracas() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('barracas')
    .select('*')
    .order('name');
  if (error) {
    console.error('❌ Query error:', error);
    process.exit(1);
  }
  console.log(`✅ Found ${data?.length || 0} barracas`);
  if (data) console.table(data.map(b => ({ 
    id: b.id, 
    name: b.name, 
    location: b.location, 
    partnered: b.partnered 
  })));
}
queryBarracas(); 