import { BarracaRegistration } from '../types';

const getCurrentLanguage = (): string => {
  if (typeof navigator === 'undefined') return 'en';
  return navigator.language || 'en';
};

export class WhatsAppNotificationService {
  /**
   * Send WhatsApp notification for new barraca registration
   */
  static async sendRegistrationNotification(
    registration: BarracaRegistration,
    adminPhoneNumber: string
  ): Promise<boolean> {
    try {
      console.log('Sending WhatsApp notification for registration:', registration.id);
      
      const response = await fetch('/.netlify/functions/whatsapp-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registration,
          adminPhoneNumber,
          language: getCurrentLanguage()
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('WhatsApp notification failed:', errorText);
        return false;
      }

      const result = await response.json();
      console.log('WhatsApp notification sent successfully:', result);
      return true;

    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      return false;
    }
  }

  /**
   * Send WhatsApp notification for registration status change
   */
  static async sendStatusChangeNotification(
    registration: BarracaRegistration,
    adminPhoneNumber: string,
    newStatus: 'approved' | 'rejected',
    adminNotes?: string
  ): Promise<boolean> {
    try {
      console.log('Sending WhatsApp status change notification for registration:', registration.id);
      
      const statusMessage = formatStatusChangeMessage(registration, newStatus, adminNotes);
      
      const response = await fetch('/.netlify/functions/whatsapp-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registration,
          adminPhoneNumber,
          customMessage: statusMessage,
          language: getCurrentLanguage()
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('WhatsApp status notification failed:', errorText);
        return false;
      }

      const result = await response.json();
      console.log('WhatsApp status notification sent successfully:', result);
      return true;

    } catch (error) {
      console.error('Error sending WhatsApp status notification:', error);
      return false;
    }
  }

  /**
   * Validate phone number format for WhatsApp
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digits
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Brazilian phone numbers should be 10-11 digits (with or without country code)
    return cleanPhone.length >= 10 && cleanPhone.length <= 13;
  }

  /**
   * Format phone number for WhatsApp API
   */
  static formatPhoneForWhatsApp(phoneNumber: string): string {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // If it doesn't start with 55 (Brazil), add it
    if (!cleanPhone.startsWith('55')) {
      return `55${cleanPhone}`;
    }
    
    return cleanPhone;
  }
}

function formatStatusChangeMessage(
  registration: BarracaRegistration,
  newStatus: 'approved' | 'rejected',
  adminNotes?: string
): string {
  const statusEmoji = newStatus === 'approved' ? '✅' : '❌';
  const statusText = newStatus === 'approved' ? 'Aprovada' : 'Rejeitada';
  
  const timestamp = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let message = `${statusEmoji} *Registração ${statusText}*

📋 *Barraca:* ${registration.name}
👤 *Proprietário:* ${registration.ownerName}
📍 *Localização:* ${registration.location}

🕒 Status alterado em: ${timestamp}`;

  if (adminNotes) {
    message += `\n\n📝 *Observações:* ${adminNotes}`;
  }

  if (newStatus === 'approved') {
    message += `\n\n🎉 A barraca foi aprovada e está agora visível no site!`;
  } else {
    message += `\n\nℹ️ A barraca foi rejeitada. Entre em contato para mais informações.`;
  }

  return message;
}
