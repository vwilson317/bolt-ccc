# Google Analytics Service Account Setup

## Step 1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**
5. Name: `ga4-api-service-account`
6. Description: `Service account for GA4 Data API access`
7. Click **Create and Continue**
8. **Skip role assignment** (we'll do this manually)
9. Click **Done**

## Step 2: Create and Download Key

1. Click on your new service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create New Key**
4. Choose **JSON** format
5. Download the JSON file

## Step 3: Grant GA4 Access

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your GA4 property
3. Go to **Admin** → **Property Access Management**
4. Click **+** → **Add users**
5. Add your service account email (from the JSON file)
6. Grant **Viewer** permissions

## Step 4: Enable API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **APIs & Services** → **Library**
3. Search for "Google Analytics Data API"
4. Click **Enable**

## Step 5: Get Access Token

```bash
# Install Google Cloud CLI if you haven't already
# Download from: https://cloud.google.com/sdk/docs/install

# Authenticate with your service account
gcloud auth activate-service-account --key-file=path/to/your-service-account.json

# Get the access token
gcloud auth print-access-token
```

## Step 6: Test the Token

```bash
# Test with curl (replace YOUR_TOKEN and YOUR_PROPERTY_ID)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dateRanges": [{"startDate": "7daysAgo", "endDate": "today"}],
    "metrics": [{"name": "newUsers"}]
  }' \
  "https://analyticsdata.googleapis.com/v1beta/properties/YOUR_PROPERTY_ID:runReport"
```

## Step 7: Set Environment Variable

```env
VITE_GA_ACCESS_TOKEN=ya29.your_token_here
```

## Troubleshooting

### If you get "insufficient authentication scopes":
1. Make sure you're using a service account token, not a user token
2. Verify the service account has access to the GA4 property
3. Check that the Google Analytics Data API is enabled

### If you get "permission denied":
1. Verify the service account email is added to GA4 property
2. Check that the service account has "Viewer" permissions
3. Make sure you're using the correct Property ID
