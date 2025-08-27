import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { registration, adminPhoneNumber } = body;

    if (!registration || !adminPhoneNumber) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing registration data or admin phone number' }),
      };
    }

    // Format the WhatsApp message
    const message = formatRegistrationMessage(registration);
    
    // Send WhatsApp message via Twilio
    const result = await sendTwilioWhatsAppMessage(adminPhoneNumber, message);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'WhatsApp notification sent successfully',
        result
      }),
    };

  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send WhatsApp notification',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

function formatRegistrationMessage(registration: any): string {
  const timestamp = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Get the site URL from environment or use a default
  const siteUrl = process.env.URL || process.env.DEPLOY_URL || 'https://your-site.netlify.app';
  const registrationUrl = `${siteUrl}/registration/${registration.id}`;

  return `🏖️ *Nova Registração de Barraca*

📋 *Detalhes:*
• Nome: ${registration.name}
• Proprietário: ${registration.ownerName}
• Localização: ${registration.location}
• Telefone: ${registration.contact?.phone || 'Não informado'}
• Email: ${registration.contact?.email || 'Não informado'}

⏰ Horário: ${registration.typicalHours}
📍 Posto mais próximo: ${registration.nearestPosto || 'Não informado'}

📝 Descrição: ${registration.description}

🕒 Registrado em: ${timestamp}

🔗 *Ver detalhes:* ${registrationUrl}

Para aprovar/rejeitar, clique no link acima ou acesse o painel admin.`;
}

async function sendTwilioWhatsAppMessage(phoneNumber: string, message: string): Promise<any> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio configuration missing. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM environment variables.');
  }

  // Clean phone number (remove +, spaces, etc.)
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Ensure it starts with country code (Brazil: 55)
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  // Twilio WhatsApp API endpoint
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append('From', `whatsapp:${fromNumber}`);
  formData.append('To', `whatsapp:+${formattedPhone}`);
  formData.append('Body', message);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twilio API error: ${response.status} ${errorText}`);
  }

  return await response.json();
}
