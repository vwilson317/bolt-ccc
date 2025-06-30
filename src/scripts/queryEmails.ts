import { createClient } from '@supabase/supabase-js';

async function queryEmails() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('email_subscriptions')
    .select('*')
    .eq('is_active', true)
    .order('subscribed_at', { ascending: false });
  if (error) {
    console.error('❌ Query error:', error);
    process.exit(1);
  }
  console.log(`✅ Found ${data?.length || 0} active email subscriptions`);
  if (data) console.table(data.map(e => ({ email: e.email, subscribed_at: e.subscribed_at })));
}
queryEmails(); 