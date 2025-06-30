import { createClient } from '@supabase/supabase-js';

// Simple database test that doesn't rely on Vite's import.meta.env
async function testDatabaseConnection() {
  console.log('🧪 Testing database connection...');
  
  // Get environment variables directly
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
  }
  
  try {
    // Create a simple Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test fetching all barracas
    console.log('📋 Fetching all barracas...');
    const { data: barracas, error } = await supabase
      .from('barracas')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('❌ Database error:', error);
      process.exit(1);
    }
    
    console.log(`✅ Successfully fetched ${barracas?.length || 0} barracas from database`);
    
    if (barracas && barracas.length > 0) {
      console.log('\n📊 Sample barraca data:');
      const sampleBarraca = barracas[0];
      console.log(`- Name: ${sampleBarraca.name}`);
      console.log(`- Location: ${sampleBarraca.location}`);
      console.log(`- Is Open: ${sampleBarraca.is_open}`);
      console.log(`- Weather Dependent: ${sampleBarraca.weather_dependent}`);
      console.log(`- Amenities: ${sampleBarraca.amenities?.join(', ') || 'None'}`);
      
      // Test fetching a specific barraca
      console.log('\n🔍 Testing getById...');
      const { data: fetchedBarraca, error: fetchError } = await supabase
        .from('barracas')
        .select('*')
        .eq('id', sampleBarraca.id)
        .single();
      
      if (fetchError) {
        console.log('❌ Failed to fetch barraca by ID:', fetchError.message);
      } else {
        console.log(`✅ Successfully fetched barraca by ID: ${fetchedBarraca.name}`);
      }
      
      // Test search functionality
      console.log('\n🔎 Testing search functionality...');
      const { data: searchResults, error: searchError } = await supabase
        .from('barracas')
        .select('*')
        .ilike('location', '%Ipanema%')
        .eq('is_open', true)
        .limit(5);
      
      if (searchError) {
        console.log('❌ Search failed:', searchError.message);
      } else {
        console.log(`✅ Search found ${searchResults?.length || 0} barracas in Ipanema that are open`);
      }
    }
    
    console.log('\n🎉 Database integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection(); 