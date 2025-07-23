import { ExternalApiService } from '../services/externalApiService';

async function testExternalApi() {
  console.log('🧪 Testing External API Service...');

  const testBarracaId = 'test-barraca-456';
  const apiKey = process.env.VITE_EXTERNAL_API_KEY || 'default-key';

  try {
    // Test 1: Update barraca status
    console.log('\n1. Testing barraca status update...');
    const updateResult = await ExternalApiService.updateBarracaStatus({
      barracaId: testBarracaId,
      isOpen: true,
      manualStatus: 'open',
      apiKey
    });
    console.log('✅ Update result:', updateResult);

    // Test 2: Get barraca status
    console.log('\n2. Testing get barraca status...');
    const getResult = await ExternalApiService.getBarracaStatus(testBarracaId, apiKey);
    console.log('✅ Get result:', getResult);

    // Test 3: Test with invalid API key
    console.log('\n3. Testing with invalid API key...');
    const invalidResult = await ExternalApiService.updateBarracaStatus({
      barracaId: testBarracaId,
      isOpen: false,
      apiKey: 'invalid-key'
    });
    console.log('✅ Invalid key result:', invalidResult);

    // Test 4: Test special admin override
    console.log('\n4. Testing special admin override...');
    const overrideResult = await ExternalApiService.updateBarracaStatus({
      barracaId: testBarracaId,
      specialAdminOverride: true,
      specialAdminOverrideExpires: new Date(Date.now() + 3600000), // 1 hour from now
      apiKey
    });
    console.log('✅ Override result:', overrideResult);

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testExternalApi();
}

export { testExternalApi }; 