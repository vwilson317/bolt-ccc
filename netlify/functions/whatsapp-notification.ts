import { Handler } from '@netlify/functions';

interface WhatsAppMessage {
  messaging_product: string;
  to: string;
  type: string;
  text: { body: string };
}

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
    missing: 'Não informado',
    review: 'Para aprovar/rejeitar, acesse o painel admin.',
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
    missing: 'Not provided',
    review: 'To approve/reject, open the admin panel.',
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
    missing: 'Non informé',
    review: 'Pour approuver/rejeter, ouvrez le panneau admin.',
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
    missing: 'No informado',
    review: 'Para aprobar/rechazar, abre el panel admin.',
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
    const message = customMessage
      ? sanitizeBranding(customMessage)
      : formatRegistrationMessage(registration, locale);

    const result = await sendWhatsAppMessage(adminPhoneNumber, message);

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
  const t = COPY[locale];
  const timestamp = new Date().toLocaleString(LOCALE_MAP[locale], {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

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

${t.review}`);
}

function sanitizeBranding(message: unknown): string {
  return String(message ?? '').replace(/\bKRL\b/gi, 'CC Club');
}

async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<any> {
  const whatsappToken = process.env.WHATSAPP_TOKEN;
  const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!whatsappToken || !whatsappPhoneNumberId) {
    throw new Error('WhatsApp configuration missing. Please set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables.');
  }

  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  const whatsappMessage: WhatsAppMessage = {
    messaging_product: 'whatsapp',
    to: formattedPhone,
    type: 'text',
    text: { body: message },
  };

  const response = await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${whatsappToken}`,
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
