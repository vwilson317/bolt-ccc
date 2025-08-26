# WhatsApp Notification Setup Guide

This guide provides **3 different options** to implement WhatsApp notifications for barraca registrations, ranked by ease of setup.

## 🚀 Quick Start Options

### Option 1: Twilio WhatsApp API (Recommended - 15 minutes)
**No business account required, easiest setup**

1. **Sign up for Twilio** (free trial available)
   - Go to [twilio.com](https://twilio.com)
   - Create account and get your credentials

2. **Enable WhatsApp Sandbox**
   - In Twilio Console → Messaging → Try it out → Send a WhatsApp message
   - Follow instructions to join your sandbox

3. **Get your credentials**
   ```bash
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_WHATSAPP_FROM=+14155238886  # Your Twilio WhatsApp number
   ```

4. **Add to your .env file**
   ```env
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_WHATSAPP_FROM=your-twilio-whatsapp-number
   ADMIN_PHONE_NUMBER=+5511999999999
   ```

5. **Test the notification**
   ```bash
   curl -X POST https://your-site.netlify.app/.netlify/functions/twilio-whatsapp-notification \
     -H "Content-Type: application/json" \
     -d '{"registration":{"name":"Test Barraca","ownerName":"Test Owner","location":"Copacabana","contact":{"phone":"11999999999","email":"test@example.com"},"typicalHours":"10:00-22:00","description":"Test description","nearestPosto":"Posto 6"},"adminPhoneNumber":"+5511999999999"}'
   ```

### Option 2: Email-to-WhatsApp via Zapier (Simplest - 10 minutes)
**No coding required, visual setup**

1. **Create Zapier account** (free tier available)
   - Go to [zapier.com](https://zapier.com)

2. **Create a new Zap**
   - Trigger: **Webhooks by Zapier** → **Catch Hook**
   - Action: **WhatsApp** → **Send Message**

3. **Set up the webhook**
   - Copy the webhook URL from Zapier
   - Add to your .env file:
   ```env
   EMAIL_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-webhook-url
   ADMIN_EMAIL=admin@yourdomain.com
   ```

4. **Configure WhatsApp action**
   - Connect your WhatsApp account
   - Set message template using Zapier variables
   - Test the connection

5. **Deploy and test**
   - The email notification function will send data to Zapier
   - Zapier will forward it to WhatsApp

### Option 3: WhatsApp Business API (Professional - 30 minutes)
**Requires business account, most features**

1. **Set up WhatsApp Business API**
   - Go to [developers.facebook.com](https://developers.facebook.com)
   - Create app → Add WhatsApp product
   - Follow verification process

2. **Get your credentials**
   ```bash
   WHATSAPP_TOKEN=your-whatsapp-business-api-token
   WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
   ```

3. **Add to your .env file**
   ```env
   WHATSAPP_TOKEN=your-token
   WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
   ADMIN_PHONE_NUMBER=+5511999999999
   ```

## 🔧 Integration with Registration System

### Update the registration service to send notifications:

```typescript
// In src/services/barracaRegistrationService.ts
static async submit(registration: Omit<BarracaRegistration, 'id' | 'submittedAt' | 'status'>): Promise<BarracaRegistration> {
  try {
    const registrationData = transformRegistrationToDB(registration);

    const { data, error } = await supabase
      .from('barraca_registrations')
      .insert(registrationData)
      .select()
      .single();

    if (error) {
      console.error('Error submitting registration:', error);
      throw new Error(`Failed to submit registration: ${error.message}`);
    }

    const result = transformRegistrationFromDB(data);

    // Send WhatsApp notification (choose one method)
    try {
      // Option 1: Twilio
      await fetch('/.netlify/functions/twilio-whatsapp-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration: result,
          adminPhoneNumber: process.env.ADMIN_PHONE_NUMBER
        })
      });

      // Option 2: Email (for Zapier)
      // await fetch('/.netlify/functions/email-whatsapp-notification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     registration: result,
      //     adminEmail: process.env.ADMIN_EMAIL
      //   })
      // });

      // Option 3: WhatsApp Business API
      // await fetch('/.netlify/functions/whatsapp-notification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     registration: result,
      //     adminPhoneNumber: process.env.ADMIN_PHONE_NUMBER
      //   })
      // });

    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't fail the registration if notification fails
    }

    return result;
  } catch (error) {
    console.error('Error in submit registration:', error);
    throw error;
  }
}
```

## 📱 Message Format

All options will send a formatted message like this:

```
🏖️ Nova Registração de Barraca

📋 Detalhes:
• Nome: Barraca do João
• Proprietário: João Silva
• Localização: Copacabana
• Telefone: (21) 99999-9999
• Email: joao@example.com

⏰ Horário: 10:00-22:00
📍 Posto mais próximo: Posto 6

📝 Descrição: Barraca tradicional com os melhores petiscos da praia

🕒 Registrado em: 15/01/2025 14:30

Para aprovar/rejeitar, acesse o painel admin.
```

## 🧪 Testing

### Test with curl:
```bash
# Test Twilio
curl -X POST https://your-site.netlify.app/.netlify/functions/twilio-whatsapp-notification \
  -H "Content-Type: application/json" \
  -d '{"registration":{"name":"Test Barraca","ownerName":"Test Owner","location":"Copacabana","contact":{"phone":"11999999999","email":"test@example.com"},"typicalHours":"10:00-22:00","description":"Test description","nearestPosto":"Posto 6"},"adminPhoneNumber":"+5511999999999"}'

# Test Email (for Zapier)
curl -X POST https://your-site.netlify.app/.netlify/functions/email-whatsapp-notification \
  -H "Content-Type: application/json" \
  -d '{"registration":{"name":"Test Barraca","ownerName":"Test Owner","location":"Copacabana","contact":{"phone":"11999999999","email":"test@example.com"},"typicalHours":"10:00-22:00","description":"Test description","nearestPosto":"Posto 6"},"adminEmail":"admin@yourdomain.com"}'
```

## 💰 Costs

- **Twilio**: ~$0.0075 per message (first 1000 free)
- **Zapier**: Free tier includes 100 tasks/month
- **WhatsApp Business API**: Free for first 1000 messages/month

## 🎯 Recommendation

**Start with Option 1 (Twilio)** - it's the fastest to set up, doesn't require a business account, and works immediately. You can always upgrade to the Business API later if you need more features.
