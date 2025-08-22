#!/bin/bash

# Production Registration Form Fix Deployment Script
# This script helps deploy the fixes for the registration form

set -e

echo "🚀 Starting Production Registration Form Fix Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Checking current environment..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    print_error "Netlify CLI is not installed. Please install it first:"
    echo "npm install -g netlify-cli"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_warning "Supabase CLI is not installed. You'll need to run migrations manually."
fi

print_status "Building the project..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed. Please fix the build errors first."
    exit 1
fi

print_status "Checking Netlify status..."
netlify status

print_status "Deploying to production..."
netlify deploy --prod

if [ $? -ne 0 ]; then
    print_error "Deployment failed. Please check the error messages above."
    exit 1
fi

print_status "Deployment completed successfully!"

echo ""
print_warning "IMPORTANT: You need to manually apply the database migration:"
echo ""
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to the SQL editor"
echo "3. Run the migration: 20250103000000_ensure_barraca_registrations_public_access.sql"
echo ""
echo "Or run: supabase db push --db-url 'your-production-db-url'"
echo ""

print_warning "Also ensure these environment variables are set in Netlify:"
echo "- VITE_APP_ENV=prod"
echo "- VITE_SUPABASE_URL_PROD=your_production_supabase_url"
echo "- VITE_SUPABASE_ANON_KEY_PROD=your_production_supabase_anon_key"
echo ""

print_status "Testing the production API..."
echo "You can test the API with:"
echo ""
echo "curl -X POST https://your-domain.netlify.app/.netlify/functions/barraca-registrations \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"name\": \"Test Barraca\","
echo "    \"ownerName\": \"Test Owner\","
echo "    \"location\": \"Copacabana\","
echo "    \"typicalHours\": \"9:00-18:00\","
echo "    \"description\": \"Test description\","
echo "    \"contact\": {"
echo "      \"phone\": \"+55 11 98765-4321\","
echo "      \"email\": \"test@example.com\""
echo "    },"
echo "    \"nearestPosto\": \"Posto 6\","
echo "    \"amenities\": [],"
echo "    \"environment\": []"
echo "  }'"
echo ""

print_status "Deployment script completed!"
print_warning "Remember to check the Netlify function logs if you encounter any issues."
