-- =====================================================
-- DISABLE RLS FOR MVP TESTING - MULTIPLICATIONS APP ONLY
-- This migration disables all RLS policies for easier testing
-- WARNING: This should be re-enabled before production launch
-- NOTE: Only affects multiplications_app_* tables
-- =====================================================

-- Drop all existing RLS policies for multiplications app tables
DROP POLICY IF EXISTS "Users can insert own question attempts" ON multiplications_app_question_attempts;
DROP POLICY IF EXISTS "Users can read own question attempts" ON multiplications_app_question_attempts;
DROP POLICY IF EXISTS "Super admins can read all question attempts" ON multiplications_app_question_attempts;
DROP POLICY IF EXISTS "Users can read own daily metrics" ON multiplications_app_daily_student_metrics;
DROP POLICY IF EXISTS "Super admins can read all daily metrics" ON multiplications_app_daily_student_metrics;
DROP POLICY IF EXISTS "Users can read own difficulty metrics" ON multiplications_app_daily_difficulty_metrics;
DROP POLICY IF EXISTS "Super admins can read all difficulty metrics" ON multiplications_app_daily_difficulty_metrics;
DROP POLICY IF EXISTS "Everyone can read app config" ON multiplications_app_config;
DROP POLICY IF EXISTS "Super admins can manage app config" ON multiplications_app_config;
DROP POLICY IF EXISTS "Users can read own learning sessions" ON multiplications_app_learning_sessions;
DROP POLICY IF EXISTS "Users can update own learning sessions" ON multiplications_app_learning_sessions;
DROP POLICY IF EXISTS "Users can read own grid progress" ON multiplications_app_math_grid_progress;
DROP POLICY IF EXISTS "Users can update own grid progress" ON multiplications_app_math_grid_progress;

-- Disable RLS on all multiplications app tables
ALTER TABLE IF EXISTS multiplications_app_learning_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS multiplications_app_math_grid_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS multiplications_app_question_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS multiplications_app_daily_student_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS multiplications_app_daily_difficulty_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS multiplications_app_config DISABLE ROW LEVEL SECURITY;

-- Log the change
DO $$
BEGIN
  RAISE NOTICE 'RLS disabled for MVP testing on multiplications app tables only';
  RAISE NOTICE 'WARNING: Re-enable RLS before production launch!';
  RAISE NOTICE 'Note: This does NOT affect spelling app or other application tables';
END $$;
