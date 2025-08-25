import { BarracaRegistrationService } from '../services/barracaRegistrationService';
import { supabase } from '../lib/supabase';

async function testRegistrationApproval() {
  console.log('🧪 Testing Registration Approval Process...\n');

  try {
    // Test 1: Check database connection
    console.log('1. Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('barraca_registrations')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }
    console.log('✅ Database connection successful\n');

    // Test 2: Get all registrations
    console.log('2. Fetching all registrations...');
    const { registrations, total } = await BarracaRegistrationService.getAll(1, 10);
    console.log(`✅ Found ${total} registrations`);
    console.log('Registrations:', registrations.map(r => ({ id: r.id, name: r.name, status: r.status })));
    console.log('');

    // Test 3: Get registration stats
    console.log('3. Fetching registration stats...');
    const stats = await BarracaRegistrationService.getStats();
    console.log('✅ Stats:', stats);
    console.log('');

    // Test 4: Try to find a pending registration
    console.log('4. Looking for pending registrations...');
    const { registrations: pendingRegistrations } = await BarracaRegistrationService.getAll(1, 10, 'pending');
    
    if (pendingRegistrations.length === 0) {
      console.log('⚠️ No pending registrations found. Creating a test registration...');
      
      // Create a test registration
      const testRegistration = {
        name: 'Test Barraca',
        ownerName: 'Test Owner',
        barracaNumber: '999',
        location: 'Test Beach',
        coordinates: { lat: -22.9711, lng: -43.1822 },
        typicalHours: '09:00 - 18:00',
        description: 'Test barraca for approval testing',
        nearestPosto: 'Posto 1',
        contact: {
          phone: '+55 21 99999-9999',
          email: 'test@example.com'
        },
        amenities: ['Test Amenity'],
        environment: ['Family Friendly'],
        weekendHoursEnabled: false,
        additionalInfo: 'Test registration for approval testing'
      };

      const createdRegistration = await BarracaRegistrationService.submit(testRegistration);
      console.log('✅ Test registration created:', createdRegistration.id);
      
      // Now try to approve it
      console.log('5. Testing approval process...');
      await BarracaRegistrationService.updateStatus(
        createdRegistration.id!,
        'approved',
        'Test approval',
        'test-admin'
      );
      console.log('✅ Registration status updated to approved');

      // Try to convert to barraca
      console.log('6. Testing conversion to barraca...');
      const barraca = await BarracaRegistrationService.convertToBarraca(createdRegistration.id!);
      console.log('✅ Registration converted to barraca:', barraca.id);

      // Clean up - delete the test registration
      console.log('7. Cleaning up test data...');
      await BarracaRegistrationService.delete(createdRegistration.id!);
      console.log('✅ Test registration deleted');

    } else {
      console.log(`✅ Found ${pendingRegistrations.length} pending registrations`);
      
      // Test with the first pending registration
      const testRegistration = pendingRegistrations[0];
      console.log('Testing with registration:', testRegistration.name);
      
      // Try to approve it
      console.log('5. Testing approval process...');
      await BarracaRegistrationService.updateStatus(
        testRegistration.id!,
        'approved',
        'Test approval',
        'test-admin'
      );
      console.log('✅ Registration status updated to approved');

      // Try to convert to barraca
      console.log('6. Testing conversion to barraca...');
      const barraca = await BarracaRegistrationService.convertToBarraca(testRegistration.id!);
      console.log('✅ Registration converted to barraca:', barraca.id);
    }

    console.log('\n🎉 All tests passed! Registration approval process is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
  }
}

// Run the test
testRegistrationApproval();
