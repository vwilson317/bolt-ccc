/*
  # Environment Seed Runner

  This migration determines the current environment and runs the appropriate
  seed script. It should be run after the base schema is created.

  Environments:
  - development: Full dataset for comprehensive testing
  - qa: Focused dataset for QA validation
  - uat: Minimal realistic data for user acceptance testing
  - production: No seeding (production data is managed separately)
*/

-- Determine environment and run appropriate seed
DO $$
DECLARE
  current_env text;
BEGIN
  -- Get current environment (default to development if not set)
  current_env := COALESCE(current_setting('app.environment', true), 'development');
  
  RAISE NOTICE 'Current environment: %', current_env;
  
  -- Set environment for seed scripts
  PERFORM set_config('app.environment', current_env, false);
  
  CASE current_env
    WHEN 'development' THEN
      RAISE NOTICE 'Running development seed script...';
      -- Development seed will be executed by the development seed file
      
    WHEN 'qa' THEN
      RAISE NOTICE 'Running QA seed script...';
      -- QA seed will be executed by the QA seed file
      
    WHEN 'uat' THEN
      RAISE NOTICE 'Running UAT seed script...';
      -- UAT seed will be executed by the UAT seed file
      
    WHEN 'production' THEN
      RAISE NOTICE 'Production environment detected - no seeding performed';
      RAISE NOTICE 'Production data should be managed through proper data migration processes';
      
    ELSE
      RAISE NOTICE 'Unknown environment: % - defaulting to development', current_env;
      PERFORM set_config('app.environment', 'development', false);
  END CASE;
  
  RAISE NOTICE 'Environment seed runner completed for: %', current_env;
END $$;