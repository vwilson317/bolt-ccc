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
    const { registration, adminEmail } = body;

    if (!registration || !adminEmail) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing registration data or admin email' }),
      };
    }

    // Send email notification (can be connected to WhatsApp via Zapier/IFTTT)
    const result = await sendEmailNotification(registration, adminEmail);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Email notification sent successfully',
        result
      }),
    };

  } catch (error) {
    console.error('Error sending email notification:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send email notification',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

async function sendEmailNotification(registration: any, adminEmail: string): Promise<any> {
  // You can use any email service here (SendGrid, Mailgun, etc.)
  // For now, we'll use a simple webhook approach that can be connected to Zapier
  
  const emailData = {
    to: adminEmail,
    subject: `🏖️ Nova Registração de Barraca - ${registration.name}`,
    html: formatEmailHTML(registration),
    text: formatEmailText(registration)
  };

  // Option 1: Send via webhook (connect to Zapier/IFTTT)
  const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }

    return await response.json();
  }

  // Option 2: Log the email data (for manual setup)
  console.log('Email notification data:', JSON.stringify(emailData, null, 2));
  
  return {
    message: 'Email data logged. Set up Zapier/IFTTT webhook to send to WhatsApp.',
    emailData
  };
}

function formatEmailHTML(registration: any): string {
  const timestamp = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nova Registração de Barraca</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .details { background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { margin-left: 10px; }
        .timestamp { color: #666; font-size: 0.9em; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏖️ Nova Registração de Barraca</h1>
        </div>
        
        <div class="details">
          <div class="field">
            <span class="label">Nome:</span>
            <span class="value">${registration.name}</span>
          </div>
          
          <div class="field">
            <span class="label">Proprietário:</span>
            <span class="value">${registration.ownerName}</span>
          </div>
          
          <div class="field">
            <span class="label">Localização:</span>
            <span class="value">${registration.location}</span>
          </div>
          
          <div class="field">
            <span class="label">Telefone:</span>
            <span class="value">${registration.contact?.phone || 'Não informado'}</span>
          </div>
          
          <div class="field">
            <span class="label">Email:</span>
            <span class="value">${registration.contact?.email || 'Não informado'}</span>
          </div>
          
          <div class="field">
            <span class="label">Horário:</span>
            <span class="value">${registration.typicalHours}</span>
          </div>
          
          <div class="field">
            <span class="label">Posto mais próximo:</span>
            <span class="value">${registration.nearestPosto || 'Não informado'}</span>
          </div>
          
          <div class="field">
            <span class="label">Descrição:</span>
            <span class="value">${registration.description}</span>
          </div>
        </div>
        
        <div class="timestamp">
          Registrado em: ${timestamp}
        </div>
        
        <p><strong>Para aprovar/rejeitar, acesse o painel admin.</strong></p>
      </div>
    </body>
    </html>
  `;
}

function formatEmailText(registration: any): string {
  const timestamp = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `🏖️ Nova Registração de Barraca

📋 Detalhes:
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
