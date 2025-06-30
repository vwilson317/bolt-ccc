# Google Analytics 4 Setup Guide

## Overview

Your Carioca Coastal Club app now includes comprehensive Google Analytics 4 (GA4) tracking. This setup provides detailed insights into user behavior, engagement, and performance metrics.

## What's Tracked

### Automatic Tracking
- ✅ **Page Views** - Every route change is tracked
- ✅ **Session Duration** - Time spent on each page
- ✅ **Scroll Depth** - How far users scroll (25%, 50%, 75%, 100%)
- ✅ **Device Information** - Mobile vs Desktop usage
- ✅ **Screen Sizes** - User device dimensions
- ✅ **Performance Metrics** - Page load times, DOM ready times
- ✅ **Error Tracking** - JavaScript errors and unhandled promises

### Custom Events
- 🏖️ **Barraca Interactions**
  - Barraca views
  - Filter usage
  - Search terms
- 🌤️ **Weather Features**
  - Weather widget views
  - Weather refresh actions
- 📖 **Story Features**
  - Story views
  - Story sharing
- 👤 **User Engagement**
  - Email subscriptions
  - Language changes
  - CTA clicks
- 🔧 **Admin Actions**
  - Login attempts (success/failure)
  - Barraca management actions
- 📱 **PWA Features**
  - Install prompts
  - Installation success

## Setup Instructions

### 1. Create Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring"
3. Create a new property for "Carioca Coastal Club"
4. Choose "Web" as the platform
5. Enter your website URL: `https://cariocacoastalclub.com`
6. Complete the setup wizard

### 2. Get Your Measurement ID

1. In your GA4 property, go to **Admin** → **Data Streams**
2. Click on your web stream
3. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### 3. Add Environment Variable

Add this to your Netlify environment variables:

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

### 4. Deploy and Verify

1. Deploy your site to Netlify
2. Visit your live site
3. Open browser DevTools → Console
4. Look for: `✅ Google Analytics initialized successfully`
5. Check Google Analytics Real-Time reports to see live data

## Using Analytics in Your Code

### Basic Usage

```typescript
import { useAnalytics } from '../hooks/useAnalytics';

function MyComponent() {
  const { trackEvent, trackCTAClick } = useAnalytics();

  const handleButtonClick = () => {
    trackCTAClick('Primary', 'Book Now', '/discover');
  };

  return <button onClick={handleButtonClick}>Book Now</button>;
}
```

### Available Tracking Functions

```typescript
const {
  // Basic tracking
  trackEvent,
  trackPageView,
  
  // Barraca tracking
  trackBarracaView,
  trackBarracaFilter,
  trackBarracaSearch,
  
  // Weather tracking
  trackWeatherView,
  trackWeatherRefresh,
  
  // Story tracking
  trackStoryView,
  trackStoryShare,
  
  // User tracking
  trackEmailSubscription,
  trackLanguageChange,
  trackUserJourney,
  
  // Admin tracking
  trackAdminLogin,
  trackAdminAction,
  
  // Performance tracking
  trackPerformance,
  trackError,
  
  // Device tracking
  trackDeviceType,
  trackScreenSize,
  
  // Engagement tracking
  trackTimeOnPage,
  trackScrollDepth,
  trackCTAClick,
  
  // Link tracking
  trackExternalLink,
  trackSocialShare,
  
  // Form tracking
  trackFormSubmission,
  
  // PWA tracking
  trackPWAInstall,
  
  // Status
  getStatus
} = useAnalytics();
```

## Admin Analytics Dashboard

Your admin panel now includes an Analytics tab with:

- 📊 **Analytics Status** - Shows if GA is active
- 📈 **Key Metrics** - Page views, visitors, bounce rate, session duration
- 📄 **Top Pages** - Most visited pages
- 📱 **Device Types** - Mobile vs Desktop breakdown

## Privacy and GDPR Compliance

### Data Collected
- Page views and navigation
- User interactions (clicks, form submissions)
- Device and browser information
- Performance metrics
- Error logs

### Data NOT Collected
- Personal information (names, emails, phone numbers)
- IP addresses (anonymized by Google)
- Sensitive user data

### Cookie Notice
Consider adding a cookie consent banner for EU users:

```typescript
// Example cookie consent implementation
const handleCookieConsent = (accepted: boolean) => {
  if (accepted) {
    // Enable analytics
    initAnalytics();
  }
};
```

## Testing Analytics

### Development Testing
1. Set `VITE_GA_MEASUREMENT_ID` in your `.env` file
2. Run `npm run dev`
3. Check browser console for analytics logs
4. Use Google Analytics Debugger extension

### Production Testing
1. Deploy to Netlify with environment variable
2. Visit live site
3. Check GA Real-Time reports
4. Verify events are firing correctly

## Common Issues

### Analytics Not Working
- ✅ Check `VITE_GA_MEASUREMENT_ID` is set correctly
- ✅ Verify no ad blockers are active
- ✅ Check browser console for errors
- ✅ Ensure GA4 property is properly configured

### Missing Data
- ✅ Wait 24-48 hours for data to appear in GA4
- ✅ Check Real-Time reports for immediate feedback
- ✅ Verify events are being sent (browser network tab)

### Performance Impact
- ✅ Analytics code is loaded asynchronously
- ✅ No impact on page load performance
- ✅ Minimal bundle size increase (~15KB)

## Advanced Configuration

### Custom Dimensions
You can add custom dimensions in GA4 for more detailed tracking:

```typescript
// Track user preferences
trackEvent('User', 'Preference', 'Language: Portuguese');

// Track feature usage
trackEvent('Feature', 'Usage', 'Weather Widget');
```

### Enhanced Ecommerce (Future)
For future ecommerce features:

```typescript
// Track barraca bookings
trackEvent('Ecommerce', 'Purchase', 'Barraca Booking', 50);
```

## Support

If you need help with analytics setup or have questions about tracking specific events, check:

1. **Google Analytics Help Center** - Official GA4 documentation
2. **React GA4 Documentation** - Library-specific help
3. **Browser DevTools** - Network tab to verify requests
4. **GA4 DebugView** - Real-time debugging in GA4

## Next Steps

1. **Set up GA4 property** and get your Measurement ID
2. **Add environment variable** to Netlify
3. **Deploy and test** the analytics implementation
4. **Monitor data** in GA4 dashboard
5. **Add custom tracking** for specific user actions as needed

Your analytics are now ready to provide valuable insights into how users interact with your beach vendor discovery platform! 🏖️📊 