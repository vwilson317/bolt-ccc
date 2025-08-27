# Registration View Setup

This guide explains how to set up the individual registration view pages that are included in WhatsApp notifications.

## 🎯 What's New

### Registration Detail Page
- **URL**: `/registration/:id` (e.g., `/registration/abc-123-def`)
- **Features**: Complete registration details with approve/reject actions
- **Access**: Direct link from WhatsApp notifications

## 📱 WhatsApp Message Format

Now when you receive a WhatsApp notification, it will include a direct link:

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

🔗 Ver detalhes: https://your-site.netlify.app/registration/abc-123-def

Para aprovar/rejeitar, clique no link acima ou acesse o painel admin.
```

## 🔧 Setup Steps

### 1. Deploy the Changes
```bash
# Build and deploy to Netlify
npm run build
netlify deploy --prod
```

### 2. Update Environment Variables
Make sure your `.env` file includes:
```env
# Twilio WhatsApp API
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_FROM=your-twilio-whatsapp-number

# Admin phone number
ADMIN_PHONE_NUMBER=+5511999999999
VITE_ADMIN_PHONE_NUMBER=+5511999999999

# Site URL (Netlify will set this automatically)
URL=https://your-site.netlify.app
```

### 3. Test the Integration
```bash
# Test the WhatsApp notification with URL
npm run test:twilio
```

## 🎨 Features of the Registration View

### Complete Information Display
- ✅ Basic barraca information
- ✅ Contact details
- ✅ Amenities and environment
- ✅ Weekend hours (if enabled)
- ✅ Partnership opportunities
- ✅ Contact preferences
- ✅ Additional information

### Admin Actions
- ✅ **Approve** - Changes status to approved
- ✅ **Reject** - Changes status to rejected
- ✅ **Convert to Barraca** - Creates barraca from approved registration
- ✅ **Admin Notes** - Add notes about the registration

### Status Management
- 🟡 **Pending** - Shows approve/reject buttons
- 🟢 **Approved** - Shows convert to barraca button
- 🔴 **Rejected** - Shows status only

## 🔗 URL Structure

### Registration Detail URLs
```
https://your-site.netlify.app/registration/{registration-id}
```

### Examples
```
https://your-site.netlify.app/registration/abc-123-def
https://your-site.netlify.app/registration/barraca-joao-001
https://your-site.netlify.app/registration/2025-01-15-joao-silva
```

## 🧪 Testing

### Test with Real Registration
1. Submit a new barraca registration through your form
2. Check your WhatsApp for the notification with the link
3. Click the link to view the registration details
4. Test the approve/reject functionality

### Test with Curl
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/twilio-whatsapp-notification \
  -H "Content-Type: application/json" \
  -d '{
    "registration": {
      "id": "test-123",
      "name": "Test Barraca",
      "ownerName": "Test Owner",
      "location": "Copacabana",
      "contact": {"phone": "11999999999", "email": "test@example.com"},
      "typicalHours": "10:00-22:00",
      "description": "Test description",
      "nearestPosto": "Posto 6"
    },
    "adminPhoneNumber": "+5511999999999"
  }'
```

## 🎯 Benefits

### For Admins
- ✅ **Quick Access** - Direct link from WhatsApp
- ✅ **Complete Information** - All registration details in one view
- ✅ **Easy Actions** - Approve/reject with one click
- ✅ **Mobile Friendly** - Works great on mobile devices

### For Users
- ✅ **Professional Experience** - Clean, detailed view
- ✅ **Transparent Process** - Can see all submitted information
- ✅ **Easy Navigation** - Clear layout and actions

## 🔄 Workflow

1. **User submits registration** → Form saves to database
2. **WhatsApp notification sent** → Includes direct link to registration
3. **Admin clicks link** → Opens registration detail page
4. **Admin reviews details** → All information visible
5. **Admin takes action** → Approve, reject, or convert to barraca
6. **Status updated** → Registration status changes accordingly

## 🚀 Next Steps

1. **Deploy the changes** to your Netlify site
2. **Test the WhatsApp notification** with a real registration
3. **Verify the link works** and opens the registration detail page
4. **Test the approve/reject functionality** from the detail page

The registration view is now fully integrated with your WhatsApp notification system!
