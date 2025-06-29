# Multi-Environment Database Setup Guide

This guide explains how to set up and manage different database schemas for different environments (dev, qa, uat, prod) in the Carioca Coastal Club application.

## 🌍 Environment Overview

The application supports four distinct environments, each with its own database schema:

| Environment | Schema | Purpose | Data Volume |
|-------------|--------|---------|-------------|
| **Development** | `dev` | Local development and testing | Full dataset |
| **QA** | `qa` | Quality assurance testing | Subset dataset |
| **UAT** | `uat` | User acceptance testing | Minimal dataset |
| **Production** | `prod` | Live production environment | Full dataset |

## 🔧 Setup Instructions

### 1. Environment Variables

Create environment-specific variables in your `.env` file:

```bash
# Environment Configuration
VITE_APP_ENV=development

# Development Environment
VITE_SUPABASE_URL_DEV=your_supabase_dev_project_url
VITE_SUPABASE_ANON_KEY_DEV=your_supabase_dev_anon_key

# QA Environment
VITE_SUPABASE_URL_QA=your_supabase_qa_project_url
VITE_SUPABASE_ANON_KEY_QA=your_supabase_qa_anon_key

# UAT Environment
VITE_SUPABASE_URL_UAT=your_supabase_uat_project_url
VITE_SUPABASE_ANON_KEY_UAT=your_supabase_uat_anon_key

# Production Environment
VITE_SUPABASE_URL_PROD=your_supabase_prod_project_url
VITE_SUPABASE_ANON_KEY_PROD=your_supabase_prod_anon_key
```

### 2. Database Migration

Run the multi-environment migration to set up all schemas:

```sql
-- This migration creates:
-- 1. Separate schemas (dev, qa, uat, prod)
-- 2. Complete table structure in each schema
-- 3. Environment-specific functions and triggers
-- 4. Appropriate data seeding for each environment
```

### 3. Running Different Environments

Use the provided npm scripts to run specific environments:

```bash
# Development (default)
npm run dev

# QA Environment
npm run dev:qa

# UAT Environment
npm run dev:uat

# Build for specific environments
npm run build:dev
npm run build:qa
npm run build:uat
npm run build:prod
```

## 🎯 Environment-Specific Features

### Development Environment
- **Full admin access** for testing all features
- **Debug mode enabled** with detailed error logging
- **Test data included** for comprehensive testing
- **Longer data retention** (7 days for stories)

### QA Environment
- **Admin access enabled** for testing admin features
- **Analytics enabled** for testing tracking
- **Subset of data** for focused testing
- **Medium data retention** (3 days for stories)

### UAT Environment
- **Limited admin access** to simulate production
- **No test data** for realistic user testing
- **Minimal dataset** for performance testing
- **Short data retention** (1 day for stories)

### Production Environment
- **No admin access** through UI for security
- **Full analytics and error reporting**
- **Complete dataset** for live operations
- **Standard data retention** (24 hours for stories)

## 🔍 Environment Detection

The application automatically detects the current environment and configures itself accordingly:

```typescript
// Environment info is available throughout the app
import { environmentInfo } from '../lib/supabase';

console.log(environmentInfo.environment); // 'development', 'qa', 'uat', or 'production'
console.log(environmentInfo.schema); // 'dev', 'qa', 'uat', or 'prod'
console.log(environmentInfo.isProduction); // boolean
```

## 🛡️ Security Considerations

### Row Level Security (RLS)
Each environment has its own RLS policies:
- **Public read access** for barracas, stories, weather
- **Authenticated write access** for admin operations
- **User-specific access** for email subscriptions

### Data Isolation
- Complete schema separation prevents cross-environment data leaks
- Environment-specific functions ensure proper data handling
- Separate Supabase projects recommended for production isolation

## 📊 Data Management

### Data Seeding
Each environment receives appropriate data:
- **Development**: Full dataset with all barracas and test data
- **QA**: Subset for testing specific scenarios
- **UAT**: Minimal data for user acceptance testing
- **Production**: Live data only

### Data Retention Policies
Environment-specific retention periods:
- **Stories**: 1-7 days depending on environment
- **Weather Cache**: 5-15 minutes depending on environment
- **Visitor Data**: 7-365 days depending on environment

## 🔧 Maintenance Tasks

### Schema Updates
When adding new features:
1. Update the `create_environment_schema()` function
2. Run migration on all environments
3. Test changes in dev/qa before production

### Data Cleanup
Automated cleanup functions for each environment:
```sql
-- Clean expired stories
SELECT dev.cleanup_expired_stories();
SELECT qa.cleanup_expired_stories();

-- Clean expired weather cache
SELECT dev.cleanup_expired_weather();
SELECT qa.cleanup_expired_weather();
```

### Environment Monitoring
Use the environment info panel (non-production only) to:
- View current environment configuration
- Check feature flags
- Monitor data retention settings
- Access debug tools

## 🚀 Deployment Workflow

### Recommended Flow
1. **Development**: Build and test features
2. **QA**: Automated testing and quality assurance
3. **UAT**: User acceptance testing with stakeholders
4. **Production**: Live deployment after approval

### Environment Promotion
```bash
# Build for each environment
npm run build:dev    # Test in development
npm run build:qa     # Deploy to QA for testing
npm run build:uat    # Deploy to UAT for acceptance
npm run build:prod   # Deploy to production
```

## 🐛 Troubleshooting

### Common Issues

**Environment not switching:**
- Check `VITE_APP_ENV` environment variable
- Verify environment-specific Supabase URLs are set
- Clear browser cache and localStorage

**Database connection errors:**
- Verify Supabase project URLs and keys
- Check if schemas exist in the database
- Ensure RLS policies are properly configured

**Missing data:**
- Run the seeding function for the environment
- Check if data retention policies have cleaned up data
- Verify the correct schema is being used

### Debug Tools

In non-production environments, use the environment info panel:
- Click the info button (bottom right)
- View environment configuration
- Access debug console logs
- Clear storage and reload

## 📝 Best Practices

1. **Always test in dev/qa** before deploying to UAT/production
2. **Use environment-specific data** appropriate for testing needs
3. **Monitor data retention** to prevent unexpected data loss
4. **Keep environment configurations** in sync across deployments
5. **Use feature flags** to control functionality per environment
6. **Implement proper error handling** with environment-aware logging

This multi-environment setup ensures proper separation of concerns, data isolation, and appropriate testing workflows for the Carioca Coastal Club application.