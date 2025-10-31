-- =====================================================
-- DISABLE RLS FOR MVP TESTING
-- This migration disables all RLS policies for easier testing
-- WARNING: This should be re-enabled before production launch
-- =====================================================

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can read own roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can read all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own question attempts" ON question_attempts;
DROP POLICY IF EXISTS "Users can read own question attempts" ON question_attempts;
DROP POLICY IF EXISTS "Super admins can read all question attempts" ON question_attempts;
DROP POLICY IF EXISTS "Users can read own daily metrics" ON daily_student_metrics;
DROP POLICY IF EXISTS "Super admins can read all daily metrics" ON daily_student_metrics;
DROP POLICY IF EXISTS "Users can read own difficulty metrics" ON daily_difficulty_metrics;
DROP POLICY IF EXISTS "Super admins can read all difficulty metrics" ON daily_difficulty_metrics;
DROP POLICY IF EXISTS "Everyone can read app config" ON app_config;
DROP POLICY IF EXISTS "Super admins can manage app config" ON app_config;

-- Disable RLS on all tables
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_student_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_difficulty_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_config DISABLE ROW LEVEL SECURITY;

-- Log the change
DO $$
BEGIN
  RAISE NOTICE 'RLS disabled for MVP testing on all tables';
  RAISE NOTICE 'WARNING: Re-enable RLS before production launch!';
END $$;
