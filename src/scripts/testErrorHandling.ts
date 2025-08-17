import { BarracaService } from '../services/barracaService';

async function testErrorHandling() {
  console.log('Testing error handling for UUID/text type mismatch...');
  
  try {
    // Test with a valid UUID
    console.log('Testing with valid UUID...');
    const validResult = await BarracaService.getOpenStatus('550e8400-e29b-41d4-a716-446655440000');
    console.log('Valid UUID result:', validResult);
    
    // Test with a non-UUID text ID (like the mock data)
    console.log('Testing with non-UUID text ID...');
    const invalidResult = await BarracaService.getOpenStatus('mock-1');
    console.log('Non-UUID result:', invalidResult);
    
    // Test with another non-UUID text ID
    console.log('Testing with another non-UUID text ID...');
    const anotherInvalidResult = await BarracaService.getOpenStatus('barraca-uruguay');
    console.log('Another non-UUID result:', anotherInvalidResult);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testErrorHandling();
