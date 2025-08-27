import { Handler } from '@netlify/functions';
import { BarracaRegistrationService } from '../src/services/barracaRegistrationService';

export const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    
    // Validate required fields
    const requiredFields = ['name', 'location', 'typicalHours', 'description', 'contact'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Missing required field: ${field}` }),
        };
      }
    }

    // Validate contact information
    if (!body.contact.phone || !body.contact.email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Phone and email are required in contact information' }),
      };
    }

    // Clean and prepare the registration data
    const registrationData = {
      name: body.name.trim(),
      ownerName: body.ownerName?.trim() || '',
      barracaNumber: body.barracaNumber?.trim() || '',
      location: body.location.trim(),
      coordinates: body.coordinates || { lat: -22.9711, lng: -43.1822 },
      typicalHours: body.typicalHours.trim(),
      description: body.description.trim(),
      nearestPosto: body.nearestPosto?.trim() || '',
      contact: {
        phone: body.contact.phone.trim(),
        email: body.contact.email.trim(),
        instagram: body.contact.instagram?.trim() || '',
        website: body.contact.website?.trim() || ''
      },
      amenities: Array.isArray(body.amenities) ? body.amenities.filter((item: string) => item.trim()) : [],
      environment: Array.isArray(body.environment) ? body.environment.filter((item: string) => item.trim()) : [],
      defaultPhoto: body.defaultPhoto || '',
      weekendHoursEnabled: Boolean(body.weekendHoursEnabled),
      weekendHours: body.weekendHours || null,
      additionalInfo: body.additionalInfo?.trim() || '',
      // Partnership opportunities
      qrCodes: Boolean(body.qrCodes),
      repeatDiscounts: Boolean(body.repeatDiscounts),
      hotelPartnerships: Boolean(body.hotelPartnerships),
      contentCreation: Boolean(body.contentCreation),
      onlineOrders: Boolean(body.onlineOrders),
      // Contact preferences for photos and status updates
      contactForPhotos: Boolean(body.contactForPhotos),
      contactForStatus: Boolean(body.contactForStatus),
      preferredContactMethod: body.preferredContactMethod || 'whatsapp',
      // English fluency information
      englishFluency: body.englishFluency || 'no',
      englishSpeakerNames: body.englishSpeakerNames?.trim() || '',
      // Tab system for tracking orders
      tabSystem: body.tabSystem || 'name_only'
    };

    // Submit the registration
    const registration = await BarracaRegistrationService.submit(registrationData);

    // Return success response
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Registration submitted successfully',
        registration: {
          id: registration.id,
          name: registration.name,
          status: registration.status,
          submittedAt: registration.submittedAt
        }
      }),
    };

  } catch (error) {
    console.error('Error processing barraca registration:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
    };
  }
};
