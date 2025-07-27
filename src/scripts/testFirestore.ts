import { FirestoreService } from '../services/firestoreService';

async function testFirestoreService() {
  console.log('🧪 Testing Firestore Service...');

  try {
    // Test 1: Subscribe to all barraca status
    console.log('\n1. Testing subscription to all barraca status...');
    const unsubscribe = FirestoreService.subscribeToAllBarracaStatus((statuses) => {
      console.log(`✅ Received ${statuses.length} barraca status updates:`, statuses);
    });

    // Test 2: Set manual status for a test barraca
    console.log('\n2. Testing manual status update...');
    const testBarracaId = 'test-barraca-123';
    await FirestoreService.setManualStatus(testBarracaId, 'open', 'test');
    console.log('✅ Manual status set successfully');

    // Test 3: Get current status
    console.log('\n3. Testing get current status...');
    const status = await FirestoreService.getBarracaStatus(testBarracaId);
    console.log('✅ Current status:', status);

    // Test 4: Update status
    console.log('\n4. Testing status update...');
    await FirestoreService.updateBarracaStatus(testBarracaId, {
      isOpen: false,
      manualStatus: 'closed'
    }, 'test');
    console.log('✅ Status updated successfully');

    // Test 5: Set special admin override
    console.log('\n5. Testing special admin override...');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expires in 1 hour
    await FirestoreService.setSpecialAdminOverride(testBarracaId, true, expiresAt, 'test');
    console.log('✅ Special admin override set successfully');

    // Wait a bit for real-time updates
    console.log('\n⏳ Waiting for real-time updates...');
    setTimeout(() => {
      console.log('✅ Test completed successfully!');
      unsubscribe();
      FirestoreService.cleanup();
    }, 3000);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testFirestoreService();
}

export { testFirestoreService }; 