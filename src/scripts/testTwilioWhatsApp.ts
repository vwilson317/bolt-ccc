import { BarracaRegistration } from '../types';

// Test data for WhatsApp notification
const testRegistration: BarracaRegistration = {
  id: 'test-123',
  name: 'Barraca do João',
  ownerName: 'João Silva',
  barracaNumber: '001',
  location: 'Copacabana',
  coordinates: { lat: -22.9711, lng: -43.1822 },
  typicalHours: '10:00-22:00',
  description: 'Barraca tradicional com os melhores petiscos da praia',
  nearestPosto: 'Posto 6',
  contact: {
    phone: '(21) 99999-9999',
    email: 'joao@example.com',
    instagram: '@barracadojoao'
  },
  amenities: ['Wi-Fi', 'Estacionamento'],
  environment: ['Familiar'],
  weekendHoursEnabled: true,
  weekendHours: {
    friday: { open: '10:00', close: '22:00' },
    saturday: { open: '10:00', close: '22:00' },
    sunday: { open: '10:00', close: '20:00' }
  },
  status: 'pending',
  submittedAt: new Date(),
  qrCodes: true,
  repeatDiscounts: false,
  hotelPartnerships: true,
  contentCreation: false,
  onlineOrders: true,
  contactForPhotos: true,
  contactForStatus: true,
  preferredContactMethod: 'whatsapp'
};

async function testTwilioWhatsApp() {
  console.log('🧪 Testing Twilio WhatsApp notification...');
  
  try {
    const response = await fetch('/.netlify/functions/twilio-whatsapp-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registration: testRegistration,
        adminPhoneNumber: process.env.VITE_ADMIN_PHONE_NUMBER || '+5511999999999'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Test failed:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Test successful!');
    console.log('Response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testTwilioWhatsApp();
