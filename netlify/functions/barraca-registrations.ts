import { Handler } from '@netlify/functions';
import { BarracaRegistrationService } from './barracaRegistrationService';

export const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Handle GET requests for fetching approved registrations
  if (event.httpMethod === 'GET') {
    try {
      const urlParams = new URLSearchParams(event.queryStringParameters || {});
      const status = urlParams.get('status');
      const limit = parseInt(urlParams.get('limit') || '50');

      if (status === 'approved') {
        const { registrations } = await BarracaRegistrationService.getAll(1, limit, 'approved');
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            registrations: registrations.map(reg => ({
              id: reg.id,
              name: reg.name,
              location: reg.location,
              submittedAt: reg.submittedAt
            }))
          }),
        };
      }

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid status parameter' }),
      };
    } catch (error) {
      console.error('Error fetching approved registrations:', error);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Internal server error',
          message: 'Failed to fetch registrations',
        }),
      };
    }
  }

  // Only allow POST requests for submissions
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    // Validate required fields
    const requiredFields = ['name', 'ownerName', 'location', 'typicalHours', 'description', 'contact', 'nearestPosto'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Missing required field: ${field}` }),
        };
      }
    }

    // Validate contact object
    if (!body.contact.phone) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Phone is required in contact information' }),
      };
    }

    // Clean and prepare the data
    const registrationData = {
      name: body.name.trim(),
      ownerName: body.ownerName.trim(),
      barracaNumber: body.barracaNumber?.trim() || undefined,
      location: body.location.trim(),
      coordinates: body.coordinates || { lat: -22.9711, lng: -43.1822 },
      typicalHours: body.typicalHours.trim(),
      description: body.description.trim(),
      nearestPosto: body.nearestPosto.trim(),
      contact: {
        phone: body.contact.phone.trim(),
        email: body.contact.email?.trim() || undefined,
        instagram: body.contact.instagram?.trim() || undefined,
        website: body.contact.website?.trim() || undefined,
      },
      amenities: Array.isArray(body.amenities) ? body.amenities.filter((item: string) => item.trim()) : [],
      environment: Array.isArray(body.environment) ? body.environment.filter((item: string) => item.trim()) : [],
      defaultPhoto: body.defaultPhoto || undefined,
      weekendHoursEnabled: Boolean(body.weekendHoursEnabled),
      weekendHours: body.weekendHoursEnabled ? body.weekendHours : undefined,
      additionalInfo: body.additionalInfo?.trim() || undefined,
      // Partnership opportunities
      qrCodes: Boolean(body.qrCodes),
      repeatDiscounts: Boolean(body.repeatDiscounts),
      hotelPartnerships: Boolean(body.hotelPartnerships),
      contentCreation: Boolean(body.contentCreation),
      onlineOrders: Boolean(body.onlineOrders),
      // Contact preferences for photos and status updates
      contactForPhotos: Boolean(body.contactForPhotos),
      contactForStatus: Boolean(body.contactForStatus),
      preferredContactMethod: body.preferredContactMethod || undefined,
    };

    // Submit the registration
    const registration = await BarracaRegistrationService.submit(registrationData);

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
        },
      }),
    };
  } catch (error) {
    console.error('Error processing registration:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to submit registration',
      }),
    };
  }
};
