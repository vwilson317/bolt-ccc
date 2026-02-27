import { Handler } from '@netlify/functions';

type SupportedLocale = 'pt' | 'en' | 'fr' | 'es';

const LOCALE_MAP: Record<SupportedLocale, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  fr: 'fr-FR',
  es: 'es-ES',
};

const COPY: Record<SupportedLocale, Record<string, string>> = {
  pt: {
    title: 'Nova Registração de Barraca',
    details: 'Detalhes',
    name: 'Nome',
    owner: 'Proprietário',
    location: 'Localização',
    phone: 'Telefone',
    email: 'Email',
    hours: 'Horário',
    nearestPost: 'Posto mais próximo',
    description: 'Descrição',
    registeredAt: 'Registrado em',
    detailsLabel: 'Ver detalhes',
    missing: 'Não informado',
    review: 'Para aprovar/rejeitar, clique no link acima ou acesse o painel admin.',
  },
  en: {
    title: 'New Barraca Registration',
    details: 'Details',
    name: 'Name',
    owner: 'Owner',
    location: 'Location',
    phone: 'Phone',
    email: 'Email',
    hours: 'Hours',
    nearestPost: 'Nearest Posto',
    description: 'Description',
    registeredAt: 'Registered at',
    detailsLabel: 'View details',
    missing: 'Not provided',
    review: 'To approve/reject, click the link above or open the admin panel.',
  },
  fr: {
    title: 'Nouvelle inscription de barraca',
    details: 'Détails',
    name: 'Nom',
    owner: 'Propriétaire',
    location: 'Emplacement',
    phone: 'Téléphone',
    email: 'Email',
    hours: 'Horaires',
    nearestPost: 'Poste le plus proche',
    description: 'Description',
    registeredAt: 'Enregistré le',
    detailsLabel: 'Voir les détails',
    missing: 'Non informé',
    review: 'Pour approuver/rejeter, cliquez sur le lien ci-dessus ou ouvrez le panneau admin.',
  },
  es: {
    title: 'Nuevo registro de barraca',
    details: 'Detalles',
    name: 'Nombre',
    owner: 'Propietario',
    location: 'Ubicación',
    phone: 'Teléfono',
    email: 'Email',
    hours: 'Horario',
    nearestPost: 'Posto más cercano',
    description: 'Descripción',
    registeredAt: 'Registrado el',
    detailsLabel: 'Ver detalles',
    missing: 'No informado',
    review: 'Para aprobar/rechazar, haz clic en el enlace de arriba o abre el panel admin.',
  },
};

const normalizeLocale = (value?: string): SupportedLocale => {
  const raw = String(value || '').toLowerCase();
  if (raw.startsWith('pt')) return 'pt';
  if (raw.startsWith('fr')) return 'fr';
  if (raw.startsWith('es')) return 'es';
  return 'en';
};

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
    const { registration, adminPhoneNumber, customMessage, language } = body;

    if (!registration || !adminPhoneNumber) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing registration data or admin phone number' }),
      };
    }

    const locale = normalizeLocale(language);
    const useTemplate = process.env.TWILIO_USE_TEMPLATE === 'true' && !customMessage;

    let result;
    if (useTemplate) {
      const templateData = formatRegistrationTemplateData(registration);
      result = await sendTwilioWhatsAppMessage(adminPhoneNumber, '', true, templateData);
    } else {
      const message = customMessage
        ? sanitizeBranding(customMessage)
        : formatRegistrationMessage(registration, locale);
      result = await sendTwilioWhatsAppMessage(adminPhoneNumber, message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'WhatsApp notification sent successfully',
        result,
      }),
    };
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send WhatsApp notification',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

function formatRegistrationMessage(registration: any, locale: SupportedLocale): string {
  const timestamp = new Date().toLocaleString(LOCALE_MAP[locale], {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const t = COPY[locale];
  const siteUrl = process.env.URL || process.env.DEPLOY_URL || 'https://your-site.netlify.app';
  const registrationUrl = `${siteUrl}/registration/${registration.id}`;

  return sanitizeBranding(`🏖️ *${t.title}*

📋 *${t.details}:*
• ${t.name}: ${registration.name}
• ${t.owner}: ${registration.ownerName}
• ${t.location}: ${registration.location}
• ${t.phone}: ${registration.contact?.phone || t.missing}
• ${t.email}: ${registration.contact?.email || t.missing}

⏰ ${t.hours}: ${registration.typicalHours}
📍 ${t.nearestPost}: ${registration.nearestPosto || t.missing}

📝 ${t.description}: ${registration.description}

🕒 ${t.registeredAt}: ${timestamp}

🔗 *${t.detailsLabel}:* ${registrationUrl}

${t.review}`);
}

function formatRegistrationTemplateData(registration: any): any {
  const timestamp = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const siteUrl = process.env.URL || process.env.DEPLOY_URL || 'https://your-site.netlify.app';
  const registrationUrl = `${siteUrl}/registration/${registration.id}`;

  return {
    '1': registration.name,
    '2': registration.ownerName,
    '3': registration.location,
    '4': registration.contact?.phone || 'Não informado',
    '5': registration.contact?.email || 'Não informado',
    '6': registration.typicalHours,
    '7': registration.nearestPosto || 'Não informado',
    '8': sanitizeBranding(registration.description),
    '9': timestamp,
    '10': registrationUrl,
  };
}

function sanitizeBranding(message: unknown): string {
  return String(message ?? '').replace(/\bKRL\b/gi, 'CC Club');
}

async function sendTwilioWhatsAppMessage(phoneNumber: string, message: string, useTemplate: boolean = false, templateData?: any): Promise<any> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio configuration missing. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM environment variables.');
  }

  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const formData = new URLSearchParams();
  formData.append('From', `whatsapp:${fromNumber}`);
  formData.append('To', `whatsapp:+${formattedPhone}`);

  if (useTemplate && templateData) {
    formData.append('ContentSid', process.env.TWILIO_CONTENT_TEMPLATE_SID || '');
    formData.append('ContentVariables', JSON.stringify(templateData));
  } else {
    formData.append('Body', message);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
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
