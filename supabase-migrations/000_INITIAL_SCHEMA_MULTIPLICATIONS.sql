-- =====================================================
-- INITIAL SCHEMA FOR MULTIPLICATIONS APP
-- Creates all core tables with multiplications_app_ prefix
-- This should be run FIRST before any other migrations
-- =====================================================

-- Enable timezone support
SET timezone = 'America/New_York';

-- Learning Sessions Table
CREATE TABLE IF NOT EXISTS multiplications_app_learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_type TEXT NOT NULL DEFAULT 'math',
  session_type TEXT CHECK (session_type IN ('placement', 'practice', 'assessment')) NOT NULL DEFAULT 'practice',
  session_name TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')) NOT NULL DEFAULT 'active',
  total_items INTEGER DEFAULT 0,
  completed_items INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy NUMERIC(5,2) DEFAULT 0,
  duration_seconds NUMERIC(10,2) DEFAULT 0,
  average_time_per_question NUMERIC(8,2) DEFAULT 0,
  fast_answers_count INTEGER DEFAULT 0,
  medium_answers_count INTEGER DEFAULT 0,
  slow_answers_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Math Grid Progress Table
CREATE TABLE IF NOT EXISTS multiplications_app_math_grid_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  grid_state JSONB NOT NULL DEFAULT '[]'::jsonb,
  guardrails_level TEXT CHECK (guardrails_level IN ('1-5', '1-9', '1-12')) NOT NULL DEFAULT '1-9',
  total_correct_answers INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question Attempts Table
CREATE TABLE IF NOT EXISTS multiplications_app_question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  multiplicand INTEGER NOT NULL,
  multiplier INTEGER NOT NULL,
  user_answer INTEGER NOT NULL,
  correct_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds NUMERIC(8,2) NOT NULL,
  time_classification TEXT CHECK (time_classification IN ('fast', 'medium', 'slow')) NOT NULL,
  attempt_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Student Metrics Table
CREATE TABLE IF NOT EXISTS multiplications_app_daily_student_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  app_type TEXT NOT NULL DEFAULT 'math',
  attempted INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  avg_time_seconds NUMERIC(8,2) DEFAULT 0,
  fast_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  slow_count INTEGER DEFAULT 0,
  time_spent_seconds NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, metric_date, app_type)
);

-- Daily Difficulty Metrics Table
CREATE TABLE IF NOT EXISTS multiplications_app_daily_difficulty_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  app_type TEXT NOT NULL DEFAULT 'math',
  difficulty_band TEXT CHECK (difficulty_band IN ('basic', 'intermediate', 'advanced')) NOT NULL,
  attempted INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  avg_time_seconds NUMERIC(8,2) DEFAULT 0,
  time_spent_seconds NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, metric_date, app_type, difficulty_band)
);

-- App Config Table
CREATE TABLE IF NOT EXISTS multiplications_app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_mult_learning_sessions_student_status ON multiplications_app_learning_sessions(student_id, status);
CREATE INDEX IF NOT EXISTS idx_mult_learning_sessions_student_type ON multiplications_app_learning_sessions(student_id, session_type);
CREATE INDEX IF NOT EXISTS idx_mult_learning_sessions_created ON multiplications_app_learning_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_mult_math_grid_student ON multiplications_app_math_grid_progress(student_id);

CREATE INDEX IF NOT EXISTS idx_mult_question_attempts_student_date ON multiplications_app_question_attempts(student_id, created_at);
CREATE INDEX IF NOT EXISTS idx_mult_question_attempts_time_class ON multiplications_app_question_attempts(time_classification);
CREATE INDEX IF NOT EXISTS idx_mult_question_attempts_multiplication ON multiplications_app_question_attempts(multiplicand, multiplier);
CREATE INDEX IF NOT EXISTS idx_mult_question_attempts_session ON multiplications_app_question_attempts(session_id);

CREATE INDEX IF NOT EXISTS idx_mult_daily_student_metrics_student_date ON multiplications_app_daily_student_metrics(student_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_mult_daily_student_metrics_date ON multiplications_app_daily_student_metrics(metric_date);

CREATE INDEX IF NOT EXISTS idx_mult_daily_difficulty_metrics_student_date_band ON multiplications_app_daily_difficulty_metrics(student_id, metric_date, difficulty_band);
CREATE INDEX IF NOT EXISTS idx_mult_daily_difficulty_metrics_date ON multiplications_app_daily_difficulty_metrics(metric_date);

-- Insert Default Configuration
INSERT INTO multiplications_app_config (key, value, description) VALUES
('time_bucket_config', '{"fastThreshold": 5, "mediumThreshold": 15}', 'Time classification thresholds in seconds')
ON CONFLICT (key) DO NOTHING;

-- Disable RLS for MVP (can be enabled later)
ALTER TABLE multiplications_app_learning_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE multiplications_app_math_grid_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE multiplications_app_question_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE multiplications_app_daily_student_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE multiplications_app_daily_difficulty_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE multiplications_app_config DISABLE ROW LEVEL SECURITY;

-- Helper Functions
CREATE OR REPLACE FUNCTION get_difficulty_band(multiplicand INTEGER, multiplier INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF GREATEST(multiplicand, multiplier) <= 5 THEN
    RETURN 'basic';
  ELSIF GREATEST(multiplicand, multiplier) <= 9 THEN
    RETURN 'intermediate';
  ELSE
    RETURN 'advanced';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function to update learning sessions timestamp
CREATE OR REPLACE FUNCTION update_multiplications_learning_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.status != OLD.status OR NEW.completed_items != OLD.completed_items THEN
    NEW.last_activity_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_learning_sessions_updated_at
BEFORE UPDATE ON multiplications_app_learning_sessions
FOR EACH ROW
EXECUTE FUNCTION update_multiplications_learning_sessions_updated_at();

-- Trigger function for automatic metrics aggregation
CREATE OR REPLACE FUNCTION upsert_multiplications_daily_metrics()
RETURNS TRIGGER AS $$
DECLARE
  et_date DATE;
  time_buckets JSONB;
  fast_threshold NUMERIC;
  medium_threshold NUMERIC;
  time_classification TEXT;
  current_difficulty_band TEXT;
BEGIN
  -- Get Eastern Time date
  et_date := (NEW.created_at AT TIME ZONE 'America/New_York')::date;

  -- Get time bucket configuration
  SELECT value INTO time_buckets FROM multiplications_app_config WHERE key = 'time_bucket_config';
  fast_threshold := COALESCE((time_buckets->>'fastThreshold')::NUMERIC, 5);
  medium_threshold := COALESCE((time_buckets->>'mediumThreshold')::NUMERIC, 15);

  -- Determine time classification
  IF NEW.time_spent_seconds < fast_threshold THEN
    time_classification := 'fast';
  ELSIF NEW.time_spent_seconds <= medium_threshold THEN
    time_classification := 'medium';
  ELSE
    time_classification := 'slow';
  END IF;

  -- Get difficulty band
  current_difficulty_band := get_difficulty_band(NEW.multiplicand, NEW.multiplier);

  -- Upsert daily student metrics
  INSERT INTO multiplications_app_daily_student_metrics (
    student_id, metric_date, app_type, attempted, correct,
    avg_time_seconds, fast_count, medium_count, slow_count, time_spent_seconds
  ) VALUES (
    NEW.student_id, et_date, 'math', 1,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    NEW.time_spent_seconds,
    CASE WHEN time_classification = 'fast' THEN 1 ELSE 0 END,
    CASE WHEN time_classification = 'medium' THEN 1 ELSE 0 END,
    CASE WHEN time_classification = 'slow' THEN 1 ELSE 0 END,
    NEW.time_spent_seconds
  )
  ON CONFLICT (student_id, metric_date, app_type)
  DO UPDATE SET
    attempted = multiplications_app_daily_student_metrics.attempted + 1,
    correct = multiplications_app_daily_student_metrics.correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    avg_time_seconds = (multiplications_app_daily_student_metrics.avg_time_seconds * multiplications_app_daily_student_metrics.attempted + NEW.time_spent_seconds) / (multiplications_app_daily_student_metrics.attempted + 1),
    fast_count = multiplications_app_daily_student_metrics.fast_count + CASE WHEN time_classification = 'fast' THEN 1 ELSE 0 END,
    medium_count = multiplications_app_daily_student_metrics.medium_count + CASE WHEN time_classification = 'medium' THEN 1 ELSE 0 END,
    slow_count = multiplications_app_daily_student_metrics.slow_count + CASE WHEN time_classification = 'slow' THEN 1 ELSE 0 END,
    time_spent_seconds = multiplications_app_daily_student_metrics.time_spent_seconds + NEW.time_spent_seconds,
    updated_at = NOW();

  -- Upsert daily difficulty metrics
  INSERT INTO multiplications_app_daily_difficulty_metrics (
    student_id, metric_date, app_type, difficulty_band, attempted, correct,
    avg_time_seconds, time_spent_seconds
  ) VALUES (
    NEW.student_id, et_date, 'math', current_difficulty_band, 1,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    NEW.time_spent_seconds,
    NEW.time_spent_seconds
  )
  ON CONFLICT (student_id, metric_date, app_type, difficulty_band)
  DO UPDATE SET
    attempted = multiplications_app_daily_difficulty_metrics.attempted + 1,
    correct = multiplications_app_daily_difficulty_metrics.correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    avg_time_seconds = (multiplications_app_daily_difficulty_metrics.avg_time_seconds * multiplications_app_daily_difficulty_metrics.attempted + NEW.time_spent_seconds) / (multiplications_app_daily_difficulty_metrics.attempted + 1),
    time_spent_seconds = multiplications_app_daily_difficulty_metrics.time_spent_seconds + NEW.time_spent_seconds,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_upsert_multiplications_daily_metrics
AFTER INSERT ON multiplications_app_question_attempts
FOR EACH ROW
EXECUTE FUNCTION upsert_multiplications_daily_metrics();

-- Function to mark abandoned sessions
CREATE OR REPLACE FUNCTION mark_abandoned_multiplications_sessions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE multiplications_app_learning_sessions
  SET status = 'abandoned', updated_at = NOW()
  WHERE status = 'active'
  AND last_activity_at < NOW() - INTERVAL '30 minutes';
END;
$$;

-- Function to get active sessions for a student
CREATE OR REPLACE FUNCTION get_active_multiplications_sessions(student_uuid uuid)
RETURNS TABLE(id uuid, session_type text, session_name text, started_at timestamp with time zone, last_activity_at timestamp with time zone, completed_items integer, total_items integer)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ls.id,
    ls.session_type,
    ls.session_name,
    ls.started_at,
    ls.last_activity_at,
    ls.completed_items,
    ls.total_items
  FROM multiplications_app_learning_sessions ls
  WHERE ls.student_id = student_uuid
  AND ls.status = 'active'
  AND ls.last_activity_at > NOW() - INTERVAL '2 hours'
  ORDER BY ls.last_activity_at DESC;
END;
$$;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Multiplications app initial schema created successfully';
  RAISE NOTICE 'All tables created with multiplications_app_ prefix';
  RAISE NOTICE 'Indexes, triggers, and helper functions installed';
END $$;
