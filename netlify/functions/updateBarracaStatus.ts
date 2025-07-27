import { ExternalApiService } from '../../src/services/externalApiService';

export default async function handler(event: any, context: any) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const { barracaId, isOpen, manualStatus, specialAdminOverride, specialAdminOverrideExpires, apiKey } = body;

      const result = await ExternalApiService.updateBarracaStatus({
        barracaId,
        isOpen,
        manualStatus,
        specialAdminOverride,
        specialAdminOverrideExpires,
        apiKey
      });

      return {
        statusCode: result.success ? 200 : 400,
        headers,
        body: JSON.stringify(result),
      };
    } else if (event.httpMethod === 'GET') {
      const { barracaId, apiKey } = event.queryStringParameters || {};

      const result = await ExternalApiService.getBarracaStatus(barracaId, apiKey);

      return {
        statusCode: result.success ? 200 : 400,
        headers,
        body: JSON.stringify(result),
      };
    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Method not allowed' 
        }),
      };
    }
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'Internal server error' 
      }),
    };
  }
} 