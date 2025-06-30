import { hybridTranslationService } from '../services/hybridTranslationService';

async function testTranslations() {
  console.log('🧪 Testing Hybrid Translation System...\n');

  try {
    // Test 1: Add some sample translations
    console.log('📝 Adding sample translations...');
    
    await hybridTranslationService.setDatabaseTranslation(
      'demo_welcome_message',
      'es',
      '¡Bienvenido al Club Costero Carioca!',
      'demo',
      'welcome'
    );

    await hybridTranslationService.setDatabaseTranslation(
      'demo_welcome_message',
      'pt',
      'Bem-vindo ao Clube Costeiro Carioca!',
      'demo',
      'welcome'
    );

    await hybridTranslationService.setDatabaseTranslation(
      'custom_beach_message',
      'es',
      '¡Disfruta de las hermosas playas de Río!',
      'demo',
      'beach'
    );

    await hybridTranslationService.setDatabaseTranslation(
      'custom_beach_message',
      'pt',
      'Aproveite as belas praias do Rio!',
      'demo',
      'beach'
    );

    // Test 2: Add barraca translations
    console.log('🏖️ Adding barraca translations...');
    
    await hybridTranslationService.setDatabaseTranslation(
      'barraca_barraca-uruguay_name',
      'es',
      'Barraca Uruguay',
      'barraca',
      'barraca-uruguay'
    );

    await hybridTranslationService.setDatabaseTranslation(
      'barraca_barraca-uruguay_name',
      'pt',
      'Barraca Uruguai',
      'barraca',
      'barraca-uruguay'
    );

    // Test 3: Test translation retrieval
    console.log('🔍 Testing translation retrieval...');
    
    const welcomeEn = await hybridTranslationService.translate('demo_welcome_message', 'en', 'Welcome to Carioca Coastal Club!');
    const welcomeEs = await hybridTranslationService.translate('demo_welcome_message', 'es', 'Welcome to Carioca Coastal Club!');
    const welcomePt = await hybridTranslationService.translate('demo_welcome_message', 'pt', 'Welcome to Carioca Coastal Club!');

    console.log('✅ Translation Results:');
    console.log(`  EN: ${welcomeEn.value} (source: ${welcomeEn.source})`);
    console.log(`  ES: ${welcomeEs.value} (source: ${welcomeEs.source})`);
    console.log(`  PT: ${welcomePt.value} (source: ${welcomePt.source})`);

    // Test 4: Get translation statistics
    console.log('\n📊 Getting translation statistics...');
    const stats = await hybridTranslationService.getTranslationStats();
    console.log('✅ Translation Stats:', stats);

    // Test 5: Test content translations
    console.log('\n🏖️ Testing content translations...');
    const barracaTranslations = await hybridTranslationService.getContentTranslations('barraca', 'barraca-uruguay', 'es');
    console.log('✅ Barraca translations (ES):', barracaTranslations);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n💡 You can now test the translation system by:');
    console.log('   1. Visiting http://localhost:5173/translation-demo');
    console.log('   2. Switching languages to see translations');
    console.log('   3. Adding more translations via the demo interface');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  testTranslations();
}

export { testTranslations }; 