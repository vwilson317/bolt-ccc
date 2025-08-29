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

    // Check if we should use template or regular message
    const useTemplate = process.env.TWILIO_USE_TEMPLATE === 'true';
    
    let result;
    if (useTemplate) {
      // Use WhatsApp template
      const templateData = formatRegistrationTemplateData(registration);
      result = await sendTwilioWhatsAppMessage(adminPhoneNumber, '', true, templateData);
    } else {
      // Use regular message
      const message = formatRegistrationMessage(registration);
      result = await sendTwilioWhatsAppMessage(adminPhoneNumber, message);
    }

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

function formatRegistrationTemplateData(registration: any): any {
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

  return {
    "1": registration.name,
    "2": registration.ownerName,
    "3": registration.location,
    "4": registration.contact?.phone || 'Não informado',
    "5": registration.contact?.email || 'Não informado',
    "6": registration.typicalHours,
    "7": registration.nearestPosto || 'Não informado',
    "8": registration.description,
    "9": timestamp,
    "10": registrationUrl
  };
}

async function sendTwilioWhatsAppMessage(phoneNumber: string, message: string, useTemplate: boolean = false, templateData?: any): Promise<any> {
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
  
  if (useTemplate && templateData) {
    // Use Twilio Content Template
    formData.append('ContentSid', process.env.TWILIO_CONTENT_TEMPLATE_SID || '');
    formData.append('ContentVariables', JSON.stringify(templateData));
  } else {
    // Use regular message
    formData.append('Body', message);
  }

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
