import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';

// Initialize Firebase Admin using .env values
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.VITE_FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function sendPushNotification(title: string, body: string) {
  // Fetch all FCM tokens
  const { data, error } = await supabase
    .from('notification_tokens')
    .select('fcm_token');
  if (error) {
    console.error('Error fetching tokens:', error);
    return;
  }
  const tokens = data?.map((row: any) => row.fcm_token).filter(Boolean);
  if (!tokens || tokens.length === 0) {
    console.log('No FCM tokens found.');
    return;
  }
  // Send notification to all tokens
  const message = {
    notification: { title, body },
    tokens,
  };
  const response = await admin.messaging().sendMulticast(message);
  console.log(`Sent to ${tokens.length} tokens. Success: ${response.successCount}, Failure: ${response.failureCount}`);
}

// Example usage: node sendPushNotification.js "Barraca Opened" "A super user has opened a barraca!"
if (require.main === module) {
  const [,, title, body] = process.argv;
  if (!title || !body) {
    console.error('Usage: node sendPushNotification.js "Title" "Body"');
    process.exit(1);
  }
  sendPushNotification(title, body).then(() => process.exit(0));
} 