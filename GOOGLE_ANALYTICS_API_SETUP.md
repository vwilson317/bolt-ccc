# Google Analytics Data API Setup Guide

## Overview

This guide explains how to set up Google Analytics Data API integration to fetch real-time active user data for the Carioca Coastal Club application. The integration allows the UniqueVisitorCounter component to display actual Google Analytics data instead of simulated values.

## What's Been Implemented

### 1. Google Analytics API Service (`src/services/googleAnalyticsApiService.ts`)
- **Real GA4 Data API calls**: Actual HTTP requests to Google Analytics Data API
- **Multiple authentication methods**: Service account, OAuth, and Google Identity Services
- **New users query**: Since June 31st (or July 1st) to current day
- **Active users**: Last 24 hours approximation
- **Page views**: Same date range as new users
- **Error handling**: Graceful fallback to local tracking
- **Token refresh**: Automatic token refresh on 401 errors

### 2. Updated UniqueVisitorCounter Component
- **Real data only**: Shows GA4 data when available, local tracking when not
- **Clear indicators**: Shows data source (GA4 vs local)
- **New users count**: "New Users Since June 31st" when using GA4
- **Active users**: Real-time active user count from GA4

## Setup Instructions

### Step 1: Get Your Google Analytics IDs

#### Property ID (for API calls)
1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your GA4 property
3. Go to **Admin** → **Property Settings**
4. Copy the **Property ID** (numeric, like `123456789`)

#### Measurement ID (for tracking)
1. Go to **Admin** → **Data Streams**
2. Select your web stream
3. Copy the **Measurement ID** (starts with G-, like `G-XXXXXXXXXX`)

### Step 2: Set Up Authentication

You have **three options** for authentication:

#### Option A: Service Account (Recommended for Production)

1. **Create a Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project
   - Go to **IAM & Admin** → **Service Accounts**
   - Click **Create Service Account**
   - Name it "GA4 API Service Account"
   - Grant **Analytics Data Viewer** role

2. **Create and Download Key**:
   - Click on your service account
   - Go to **Keys** tab
   - Click **Add Key** → **Create New Key**
   - Choose **JSON** format
   - Download the JSON file

3. **Get Access Token**:
   ```bash
   # Install Google Cloud CLI
   gcloud auth activate-service-account --key-file=path/to/service-account.json
   gcloud auth print-access-token
   ```

4. **Set Environment Variable**:
   ```env
   VITE_GA_ACCESS_TOKEN=your_access_token_here
   ```

#### Option B: OAuth 2.0 (For User-Specific Access)

1. **Create OAuth 2.0 Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client IDs**
   - Set application type to **Web application**
   - Add authorized origins: `http://localhost:3000`, `https://yourdomain.com`

2. **Set Environment Variables**:
   ```env
   VITE_GA_CLIENT_ID=your_oauth_client_id_here
   ```

3. **Add Google Sign-In** (optional):
   ```html
   <!-- Add to index.html -->
   <script src="https://apis.google.com/js/api.js"></script>
   <script src="https://accounts.google.com/gsi/client"></script>
   ```

#### Option C: Manual Access Token

1. **Get Access Token Manually**:
   - Use [Google OAuth Playground](https://developers.google.com/oauthplayground/)
   - Set scope to: `https://www.googleapis.com/auth/analytics.readonly`
   - Exchange authorization code for access token

2. **Set Environment Variable**:
   ```env
   VITE_GA_ACCESS_TOKEN=your_manual_access_token_here
   ```

### Step 3: Configure Environment Variables

Create or update your `.env` file:

```env
# Required for API calls
VITE_GA_PROPERTY_ID=123456789

# Required for tracking
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Required for authentication (choose one method)
VITE_GA_ACCESS_TOKEN=your_access_token_here
# OR
VITE_GA_CLIENT_ID=your_oauth_client_id_here
```

### Step 4: Grant API Access

1. **Enable Google Analytics Data API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Go to **APIs & Services** → **Library**
   - Search for "Google Analytics Data API"
   - Click **Enable**

2. **Grant Service Account Access** (if using service account):
   - Go to [Google Analytics](https://analytics.google.com/)
   - Go to **Admin** → **Property Access Management**
   - Click **+** → **Add users**
   - Add your service account email
   - Grant **Viewer** permissions

### Step 5: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Check browser console** for these messages:
   ```
   ✅ Google Analytics tracking found: G-XXXXXXXXXX
   ✅ Google Analytics Property ID found: 123456789
   ✅ Using service account access token
   ✅ Google Analytics API service initialized with real data access
   ```

3. **Verify API calls** in Network tab:
   - Look for requests to `analyticsdata.googleapis.com`
   - Check for successful responses with real data

## API Endpoints Used

### New Users Query
```javascript
POST https://analyticsdata.googleapis.com/v1beta/properties/{propertyId}:runReport
{
  "dateRanges": [{
    "startDate": "2024-07-01",
    "endDate": "2024-12-19"
  }],
  "metrics": [{"name": "newUsers"}]
}
```

### Active Users Query
```javascript
POST https://analyticsdata.googleapis.com/v1beta/properties/{propertyId}:runReport
{
  "dateRanges": [{
    "startDate": "2024-12-18",
    "endDate": "2024-12-19"
  }],
  "metrics": [{"name": "activeUsers"}]
}
```

## Troubleshooting

### Common Issues

1. **"No access token available"**
   - Check that `VITE_GA_ACCESS_TOKEN` is set
   - Verify the token hasn't expired
   - Ensure the service account has proper permissions

2. **"GA4 API error: 403"**
   - Verify the service account has access to the GA4 property
   - Check that the Property ID is correct
   - Ensure the Google Analytics Data API is enabled

3. **"GA4 API error: 401"**
   - The access token has expired
   - The system will automatically try to refresh the token
   - If using manual token, get a new one

4. **"No new users data found in GA4"**
   - Check the date range (June 31st to today)
   - Verify there's actual data in your GA4 property
   - Ensure the property has been collecting data since July 1st

### Debug Mode

Enable detailed logging by checking the browser console for:
- API request URLs and payloads
- Response data
- Authentication status
- Error messages

## Security Considerations

1. **Never commit access tokens** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate access tokens** regularly
4. **Use service accounts** for production applications
5. **Limit API scope** to read-only access

## Performance Notes

- API calls are cached for 30 seconds
- Active users update every 10 seconds
- Total users update every 30 seconds
- Failed API calls fall back to local tracking
- Network errors are handled gracefully

## Next Steps

Once the API integration is working:

1. **Monitor API usage** in Google Cloud Console
2. **Set up alerts** for API quota limits
3. **Consider implementing** more advanced metrics
4. **Add error tracking** for failed API calls
5. **Optimize caching** based on your needs

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Test API access using the Google Analytics Data API Explorer
4. Check Google Cloud Console for API usage and errors
5. Review the Google Analytics Data API documentation
