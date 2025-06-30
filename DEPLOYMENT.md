# Netlify Deployment Guide

## Prerequisites

1. **Node.js 22+** - Ensure you have Node.js 22 or higher installed
2. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
3. **Supabase Project** - Set up your Supabase database
4. **OpenWeather API Key** - Get your API key from [openweathermap.org](https://openweathermap.org/api)

## Environment Variables

You need to configure these environment variables in your Netlify dashboard:

### Required Environment Variables

```bash
# App Environment (set to 'production' for live site)
VITE_APP_ENV=production

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenWeather API
VITE_OPENWEATHER_API_KEY=your_openweather_api_key

# Lingo Translation (if using)
GROQ_API_KEY=your_groq_api_key
```

### Optional Environment Variables (for different environments)

```bash
# Development Environment
VITE_SUPABASE_URL_DEV=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY_DEV=your_dev_supabase_anon_key

# QA Environment
VITE_SUPABASE_URL_QA=https://your-qa-project.supabase.co
VITE_SUPABASE_ANON_KEY_QA=your_qa_supabase_anon_key

# UAT Environment
VITE_SUPABASE_URL_UAT=https://your-uat-project.supabase.co
VITE_SUPABASE_ANON_KEY_UAT=your_uat_supabase_anon_key

# Production Environment
VITE_SUPABASE_URL_PROD=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY_PROD=your_prod_supabase_anon_key
```

## Deployment Steps

### 1. Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub/GitLab/Bitbucket repository
4. Select your repository

### 2. Configure Build Settings

Netlify will automatically detect these settings from `netlify.toml`:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `22`

### 3. Set Environment Variables

1. Go to Site settings → Environment variables
2. Add all the required environment variables listed above
3. Make sure to set `VITE_APP_ENV=production` for your live site

### 4. Deploy

1. Netlify will automatically deploy when you push to your main branch
2. For manual deployment, click "Deploy site" in the Netlify dashboard

## Custom Domain Setup

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions
4. Enable HTTPS (Netlify provides free SSL certificates)

## Troubleshooting

### Common Issues

1. **Build fails**: Check that all environment variables are set correctly
2. **MIME type errors**: The `netlify.toml` file includes proper MIME type headers
3. **404 errors**: The redirect rule in `netlify.toml` handles SPA routing

### Environment Variable Debugging

If you're having issues with environment variables:

1. Check the build logs in Netlify dashboard
2. Ensure all variables start with `VITE_` (required for Vite)
3. Verify Supabase URL and API key are correct
4. Test your OpenWeather API key

### Performance Optimization

The build process includes:
- Code splitting and minification
- PWA manifest generation
- Service worker for caching
- Optimized assets

## Monitoring

- **Build logs**: Available in the Netlify dashboard
- **Function logs**: If using Netlify Functions
- **Analytics**: Enable Netlify Analytics in site settings

## Security Notes

- Never commit API keys to your repository
- Use environment variables for all sensitive data
- Enable HTTPS for all custom domains
- Regularly rotate API keys 