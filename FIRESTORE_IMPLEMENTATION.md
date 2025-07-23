# Firestore Real-Time Barraca Status Implementation

## Overview

This implementation provides real-time barraca status monitoring using Firebase Firestore, allowing external apps to update barraca status and the website/PWA to receive instant updates.

## Architecture

### 1. **Firestore Service** (`src/services/firestoreService.ts`)
- **Real-time subscriptions** to barraca status changes
- **Status management** for manual status, special admin overrides
- **Data synchronization** between Supabase and Firestore
- **Connection management** with automatic cleanup

### 2. **External API Service** (`src/services/externalApiService.ts`)
- **API key authentication** for external app access
- **Status update endpoints** for external apps
- **Validation and error handling**

### 3. **AppContext Integration** (`src/contexts/AppContext.tsx`)
- **Real-time status subscriptions** on app startup
- **Automatic data synchronization** between Supabase and Firestore
- **Enhanced barraca fetching** with real-time status overlay
- **Connection status monitoring**

### 4. **API Endpoints**
- **Netlify Function** (`netlify/functions/updateBarracaStatus.ts`)
- **RESTful API** for external app integration
- **CORS support** for cross-origin requests

## Key Features

### Real-Time Updates
- ✅ **Instant status changes** across all connected clients
- ✅ **Automatic reconnection** on network issues
- ✅ **Efficient subscription management** with cleanup

### External App Integration
- ✅ **Secure API key authentication**
- ✅ **RESTful endpoints** for status updates
- ✅ **Comprehensive error handling**
- ✅ **CORS support** for cross-origin requests

### Status Management
- ✅ **Manual status** for non-partnered barracas
- ✅ **Special admin overrides** with expiration
- ✅ **Weather-dependent status** integration
- ✅ **Status history tracking**

### PWA Support
- ✅ **Offline handling** with cached status
- ✅ **Background sync** when connection restored
- ✅ **Push notifications** for status changes

## Usage

### For External Apps

#### Update Barraca Status
```javascript
const response = await fetch('/.netlify/functions/updateBarracaStatus', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    barracaId: 'barraca-123',
    isOpen: true,
    manualStatus: 'open',
    apiKey: 'your-api-key'
  })
});

const result = await response.json();
console.log(result.success); // true/false
```

#### Get Barraca Status
```javascript
const response = await fetch('/.netlify/functions/updateBarracaStatus?barracaId=barraca-123&apiKey=your-api-key');
const result = await response.json();
console.log(result.data); // Current status
```

### For Website/PWA

#### Access Real-Time Status
```javascript
import { useApp } from './contexts/AppContext';

function MyComponent() {
  const { firestoreConnected, barracaStatuses } = useApp();
  
  // Check connection status
  if (!firestoreConnected) {
    return <div>Connecting to real-time updates...</div>;
  }
  
  // Access real-time status
  const barracaStatus = barracaStatuses.get('barraca-123');
  console.log(barracaStatus?.isOpen); // true/false
}
```

## Environment Variables

Add these to your `.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# External API
VITE_EXTERNAL_API_KEY=your-secure-api-key
```

## Testing

### Run Firestore Tests
```bash
npm run test:firestore
```

### Run External API Tests
```bash
npm run test:external-api
```

### Manual Testing
1. Start the development server
2. Check the Firestore status indicator (bottom-right corner)
3. Use the test scripts to update status
4. Verify real-time updates in the UI

## Deployment

### Netlify
1. Deploy the function to `netlify/functions/`
2. Set environment variables in Netlify dashboard
3. The API will be available at `/.netlify/functions/updateBarracaStatus`

### Firebase
1. Enable Firestore in your Firebase project
2. Set up security rules for the collections
3. Configure authentication if needed

## Security

### API Key Protection
- Store API keys in environment variables
- Validate API keys on every request
- Use HTTPS for all API calls

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to barraca status
    match /barraca_status/{document} {
      allow read: if true;
      allow write: if request.auth != null || 
                   request.resource.data.updatedBy == 'external';
    }
    
    // Allow read access to barracas
    match /barracas/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Monitoring

### Connection Status
- **Green indicator**: Firestore connected
- **Red indicator**: Firestore disconnected
- **Status count**: Number of monitored barracas

### Error Handling
- **Automatic reconnection** on network issues
- **Fallback to Supabase** if Firestore unavailable
- **Error logging** for debugging

## Performance

### Optimization
- **Efficient subscriptions** with cleanup
- **Minimal data transfer** with selective updates
- **Caching** for offline support
- **Background sync** for missed updates

### Scalability
- **Firestore auto-scaling** for high traffic
- **Connection pooling** for multiple clients
- **Rate limiting** on API endpoints

## Troubleshooting

### Common Issues

1. **Firestore not connecting**
   - Check Firebase configuration
   - Verify project ID and API keys
   - Check network connectivity

2. **Real-time updates not working**
   - Verify Firestore security rules
   - Check subscription setup
   - Monitor console for errors

3. **API calls failing**
   - Validate API key
   - Check CORS configuration
   - Verify endpoint URL

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'firestore:*');
```

## Future Enhancements

### Planned Features
- [ ] **Status change notifications** via push
- [ ] **Status history** and analytics
- [ ] **Bulk status updates** for multiple barracas
- [ ] **Advanced filtering** and search
- [ ] **Status scheduling** for future changes

### Performance Improvements
- [ ] **Connection pooling** optimization
- [ ] **Data compression** for large datasets
- [ ] **Intelligent caching** strategies
- [ ] **Background sync** improvements

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Firebase/Firestore documentation
3. Check console logs for error details
4. Test with the provided test scripts 