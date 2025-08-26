import { Handler } from '@netlify/functions';

interface WhatsAppMessage {
  messaging_product: string;
  to: string;
  type: string;
  text: { body: string };
}

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
    
    // Send WhatsApp message
    const result = await sendWhatsAppMessage(adminPhoneNumber, message);

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

Para aprovar/rejeitar, acesse o painel admin.`;
}

async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<any> {
  const whatsappToken = process.env.WHATSAPP_TOKEN;
  const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!whatsappToken || !whatsappPhoneNumberId) {
    throw new Error('WhatsApp configuration missing. Please set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables.');
  }

  // Clean phone number (remove +, spaces, etc.)
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Ensure it starts with country code (Brazil: 55)
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  const whatsappMessage: WhatsAppMessage = {
    messaging_product: 'whatsapp',
    to: formattedPhone,
    type: 'text',
    text: { body: message }
  };

  const response = await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${whatsappToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(whatsappMessage),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp API error: ${response.status} ${errorText}`);
  }

  return await response.json();
}
