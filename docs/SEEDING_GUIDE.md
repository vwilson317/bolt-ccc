# Database Seeding Guide

This guide explains how to use the environment-specific database seeding system for the Carioca Coastal Club application.

## 🌍 Environment-Specific Seeding

The application uses different data sets for each environment to ensure appropriate testing and development workflows.

### Environment Types

| Environment | Purpose | Data Volume | Characteristics |
|-------------|---------|-------------|-----------------|
| **Development** | Local development and comprehensive testing | Full dataset | All features, edge cases, debug data |
| **QA** | Quality assurance and automated testing | Focused subset | Test scenarios, edge cases, validation data |
| **UAT** | User acceptance testing and demos | Minimal realistic | Clean, professional, stakeholder-friendly |
| **Production** | Live environment | Real data only | No seeding - managed separately |

## 📊 Data Breakdown by Environment

### Development Environment
- **12 barracas** with diverse offerings and complete data
- **15+ stories** across multiple barracas with various scenarios
- **20+ email subscriptions** with different preference combinations
- **Complex business hours** scenarios for testing
- **Rich visitor analytics** with international users
- **Comprehensive weather cache** for all locations

### QA Environment
- **6 barracas** representing key functionality areas
- **8 stories** with specific test scenarios (expiration, video, etc.)
- **10 email subscriptions** with edge cases and validation scenarios
- **Focused business hours** for testing complex scheduling
- **Targeted analytics data** for performance testing

### UAT Environment
- **4 barracas** representing core business types
- **4 stories** with clean, professional content
- **5 email subscriptions** with realistic user scenarios
- **Essential business hours** for demo purposes
- **Current weather and visitor data** for live demos

## 🚀 Running Seeds

### Automatic Seeding
Seeds run automatically when migrations are applied, based on the current environment setting.

```bash
# Set environment before running migrations
export VITE_APP_ENV=development
# Then apply migrations - seeds will run automatically
```

### Manual Seeding
You can also run specific seed files manually:

```sql
-- Set environment
SET app.environment = 'development';

-- Run specific seed
\i supabase/migrations/20250630130000_seed_development.sql
```

### Environment Detection
The system automatically detects the environment from:
1. `app.environment` PostgreSQL setting
2. `VITE_APP_ENV` environment variable
3. Defaults to `development` if not set

## 📋 Seed File Structure

Each seed file follows this pattern:

```sql
-- Environment check
DO $$
BEGIN
  IF current_setting('app.environment', true) != 'target_environment' THEN
    RAISE NOTICE 'Skipping seed - not in target environment';
    RETURN;
  END IF;
END $$;

-- Clear existing data (non-production only)
TRUNCATE TABLE ... CASCADE;

-- Insert environment-specific data
INSERT INTO barracas (...) VALUES (...);
-- ... more inserts

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Environment seeded successfully with: ...';
END $$;
```

## 🔧 Customizing Seeds

### Adding New Test Data

1. **Development**: Add comprehensive test cases in `seed_development.sql`
2. **QA**: Add focused test scenarios in `seed_qa.sql`
3. **UAT**: Add minimal realistic data in `seed_uat.sql`

### Environment-Specific Features

Each environment can have different:
- **Data volumes** (more/fewer records)
- **Data characteristics** (test vs. realistic data)
- **Feature flags** (enabled/disabled features)
- **Business rules** (different validation scenarios)

### Example: Adding a New Barraca

```sql
-- Development: Full featured with test data
INSERT INTO barracas (id, name, ...) VALUES 
('dev-new-001', 'Test Barraca with All Features', ...);

-- QA: Focused on specific functionality
INSERT INTO barracas (id, name, ...) VALUES 
('qa-new-001', 'QA Test Barraca', ...);

-- UAT: Clean and professional
INSERT INTO barracas (id, name, ...) VALUES 
('uat-new-001', 'Premium Beach Experience', ...);
```

## 🧹 Data Cleanup

### Automatic Cleanup
Seeds automatically clear existing data before inserting new data (except in production).

### Manual Cleanup
```sql
-- Clear all data (be careful!)
TRUNCATE TABLE visitor_analytics, weather_cache, email_subscriptions, 
               stories, business_hours, barracas CASCADE;
```

### Selective Cleanup
```sql
-- Clear only specific tables
TRUNCATE TABLE stories CASCADE;
TRUNCATE TABLE email_subscriptions CASCADE;
```

## 🔍 Verification

### Check Current Environment
```sql
SELECT current_setting('app.environment', true) as current_environment;
```

### Verify Data Counts
```sql
-- Check data volumes by environment
SELECT 
  'barracas' as table_name, 
  count(*) as record_count 
FROM barracas
UNION ALL
SELECT 
  'stories' as table_name, 
  count(*) as record_count 
FROM stories
UNION ALL
SELECT 
  'email_subscriptions' as table_name, 
  count(*) as record_count 
FROM email_subscriptions;
```

### Validate Environment-Specific Data
```sql
-- Check for environment-specific prefixes
SELECT id, name FROM barracas WHERE id LIKE 'dev-%';
SELECT id, name FROM barracas WHERE id LIKE 'qa-%';
SELECT id, name FROM barracas WHERE id LIKE 'uat-%';
```

## ⚠️ Important Notes

### Production Safety
- **Never run seeds in production**
- Production data is managed through proper data migration processes
- Seeds include safety checks to prevent accidental execution in production

### Data Consistency
- Seeds ensure referential integrity across all tables
- Foreign key relationships are maintained
- Timestamps are realistic and properly ordered

### Performance Considerations
- Development seeds include more data for performance testing
- QA seeds focus on edge cases and boundary conditions
- UAT seeds are minimal for fast demo loading

## 🐛 Troubleshooting

### Common Issues

**Environment not detected:**
```sql
-- Check current setting
SELECT current_setting('app.environment', true);

-- Set manually if needed
SET app.environment = 'development';
```

**Foreign key violations:**
- Ensure parent records (barracas) are inserted before child records (stories, business_hours)
- Check that referenced IDs exist in parent tables

**Duplicate key errors:**
- Seeds clear existing data first, but manual runs might conflict
- Use `TRUNCATE CASCADE` to clear all related data

**Permission errors:**
- Ensure database user has INSERT, DELETE, TRUNCATE permissions
- Check RLS policies don't block seed operations

### Debug Mode
Enable detailed logging:
```sql
SET client_min_messages = NOTICE;
-- Run seed scripts to see detailed progress
```

This seeding system ensures each environment has appropriate data for its intended use while maintaining data integrity and performance across all environments.