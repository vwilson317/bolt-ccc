import { Handler } from '@netlify/functions';

interface GA4Request {
  dateRanges: Array<{ startDate: string; endDate: string }>;
  metrics: Array<{ name: string }>;
  dimensions?: Array<{ name: string }>;
}

const handler: Handler = async (event) => {
  // Handle CORS
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

  try {
    // Get environment variables
    const accessToken = process.env.VITE_GA_ACCESS_TOKEN;
    const propertyId = process.env.VITE_GA_PROPERTY_ID;

    if (!accessToken || !propertyId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required environment variables: VITE_GA_ACCESS_TOKEN or VITE_GA_PROPERTY_ID',
        }),
      };
    }

    // Parse the request body
    const requestBody: GA4Request = JSON.parse(event.body || '{}');

    // Validate request
    if (!requestBody.dateRanges || !requestBody.metrics) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields: dateRanges and metrics',
        }),
      };
    }

    // Make the GA4 Data API call
    const apiUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
    
    console.log('🔗 Calling GA4 Data API:', apiUrl);
    console.log('📋 Request payload:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 HTTP Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GA4 API error response:', response.status, errorText);
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: `GA4 API error: ${response.status}`,
          details: errorText,
        }),
      };
    }

    const data = await response.json();
    console.log('✅ GA4 API response received successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('❌ GA4 API function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};

export { handler };
