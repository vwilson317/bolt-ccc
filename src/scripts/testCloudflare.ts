#!/usr/bin/env tsx

/**
 * Test script for Cloudflare R2 photo gallery functionality
 */

console.log('🧪 Testing Cloudflare R2 Photo Gallery...');

// Test environment variables
console.log('\n📋 Environment Variables Check:');
console.log('VITE_CLOUDFLARE_ACCOUNT_ID:', process.env.VITE_CLOUDFLARE_ACCOUNT_ID ? '✅ Set' : '❌ Not set');
console.log('VITE_CLOUDFLARE_ACCESS_KEY_ID:', process.env.VITE_CLOUDFLARE_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set');
console.log('VITE_CLOUDFLARE_SECRET_ACCESS_KEY:', process.env.VITE_CLOUDFLARE_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set');
console.log('VITE_CLOUDFLARE_R2_BUCKET_NAME:', process.env.VITE_CLOUDFLARE_R2_BUCKET_NAME ? '✅ Set' : '❌ Not set');
console.log('VITE_CLOUDFLARE_R2_ENDPOINT:', process.env.VITE_CLOUDFLARE_R2_ENDPOINT ? '✅ Set' : '❌ Not set');
console.log('VITE_CLOUDFLARE_DOMAIN:', process.env.VITE_CLOUDFLARE_DOMAIN ? '✅ Set' : '❌ Not set');

// Test function endpoint
async function testNetlifyFunction() {
  console.log('\n🔗 Testing Netlify Function...');
  
  const baseUrl = 'http://localhost:8888';
  const endpoint = `${baseUrl}/.netlify/functions/cloudflare-images`;
  
  try {
    console.log('📡 Making request to:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'listFolders',
        folderPath: '',
      }),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Success! Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Run the tests
async function runTests() {
  await testNetlifyFunction();
}

runTests().catch(console.error);