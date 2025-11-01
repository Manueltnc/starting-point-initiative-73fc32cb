-- =====================================================
-- RENAME TABLES WITH multiplications_app_ PREFIX
-- This migration preserves all existing data
-- =====================================================

-- 1. Rename all tables
ALTER TABLE IF EXISTS learning_sessions RENAME TO multiplications_app_learning_sessions;
ALTER TABLE IF EXISTS math_grid_progress RENAME TO multiplications_app_math_grid_progress;
ALTER TABLE IF EXISTS question_attempts RENAME TO multiplications_app_question_attempts;
ALTER TABLE IF EXISTS daily_student_metrics RENAME TO multiplications_app_daily_student_metrics;
ALTER TABLE IF EXISTS daily_difficulty_metrics RENAME TO multiplications_app_daily_difficulty_metrics;
ALTER TABLE IF EXISTS app_config RENAME TO multiplications_app_config;

-- 2. Drop old indexes (they were renamed automatically but let's recreate with proper names)
DROP INDEX IF EXISTS idx_question_attempts_student_date;
DROP INDEX IF EXISTS idx_question_attempts_time_classification;
DROP INDEX IF EXISTS idx_question_attempts_multiplication;
DROP INDEX IF EXISTS idx_daily_student_metrics_student_date;
DROP INDEX IF EXISTS idx_daily_difficulty_metrics_student_date_band;
DROP INDEX IF EXISTS idx_learning_sessions_student_status;

-- 3. Create new indexes with proper names
CREATE INDEX idx_mult_question_attempts_student_date ON multiplications_app_question_attempts(student_id, created_at);
CREATE INDEX idx_mult_question_attempts_time_class ON multiplications_app_question_attempts(time_classification);
CREATE INDEX idx_mult_question_attempts_multiplication ON multiplications_app_question_attempts(multiplicand, multiplier);
CREATE INDEX idx_mult_daily_student_metrics_student_date ON multiplications_app_daily_student_metrics(student_id, metric_date);
CREATE INDEX idx_mult_daily_difficulty_metrics_student_date_band ON multiplications_app_daily_difficulty_metrics(student_id, metric_date, difficulty_band);
CREATE INDEX idx_mult_learning_sessions_student_status ON multiplications_app_learning_sessions(student_id, status);

-- 4. Update the trigger function for daily metrics
CREATE OR REPLACE FUNCTION upsert_daily_student_metrics()
RETURNS TRIGGER AS $$
DECLARE
    et_date date := (NEW.created_at AT TIME ZONE 'America/New_York')::date;
    current_difficulty_band text := get_difficulty_band(NEW.multiplicand, NEW.multiplier);
BEGIN
    -- Upsert daily student metrics
    INSERT INTO multiplications_app_daily_student_metrics (
        student_id, metric_date, app_type, attempted, correct, 
        avg_time_seconds, fast_count, medium_count, slow_count, time_spent_seconds
    )
    SELECT 
        NEW.student_id,
        et_date,
        'math',
        COUNT(*),
        COUNT(CASE WHEN is_correct THEN 1 END),
        AVG(time_spent_seconds),
        COUNT(CASE WHEN time_classification = 'fast' THEN 1 END),
        COUNT(CASE WHEN time_classification = 'medium' THEN 1 END),
        COUNT(CASE WHEN time_classification = 'slow' THEN 1 END),
        SUM(time_spent_seconds)
    FROM multiplications_app_question_attempts
    WHERE student_id = NEW.student_id 
    AND (created_at AT TIME ZONE 'America/New_York')::date = et_date
    ON CONFLICT (student_id, metric_date, app_type)
    DO UPDATE SET
        attempted = EXCLUDED.attempted,
        correct = EXCLUDED.correct,
        avg_time_seconds = EXCLUDED.avg_time_seconds,
        fast_count = EXCLUDED.fast_count,
        medium_count = EXCLUDED.medium_count,
        slow_count = EXCLUDED.slow_count,
        time_spent_seconds = EXCLUDED.time_spent_seconds,
        updated_at = NOW();

    -- Upsert daily difficulty metrics
    INSERT INTO multiplications_app_daily_difficulty_metrics (
        student_id, metric_date, app_type, difficulty_band, 
        attempted, correct, avg_time_seconds, time_spent_seconds
    )
    SELECT 
        NEW.student_id,
        et_date,
        'math',
        current_difficulty_band,
        COUNT(*),
        COUNT(CASE WHEN is_correct THEN 1 END),
        AVG(time_spent_seconds),
        SUM(time_spent_seconds)
    FROM multiplications_app_question_attempts
    WHERE student_id = NEW.student_id 
    AND (created_at AT TIME ZONE 'America/New_York')::date = et_date
    AND get_difficulty_band(multiplicand, multiplier) = current_difficulty_band
    ON CONFLICT (student_id, metric_date, app_type, difficulty_band)
    DO UPDATE SET
        attempted = EXCLUDED.attempted,
        correct = EXCLUDED.correct,
        avg_time_seconds = EXCLUDED.avg_time_seconds,
        time_spent_seconds = EXCLUDED.time_spent_seconds,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recreate trigger on the renamed table
DROP TRIGGER IF EXISTS trigger_upsert_daily_metrics ON multiplications_app_question_attempts;
CREATE TRIGGER trigger_upsert_daily_metrics
AFTER INSERT ON multiplications_app_question_attempts
FOR EACH ROW
EXECUTE FUNCTION upsert_daily_student_metrics();

-- 6. Update reconcile_daily_metrics function
CREATE OR REPLACE FUNCTION reconcile_daily_metrics(target_date date)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  time_buckets JSONB;
  fast_threshold NUMERIC;
  medium_threshold NUMERIC;
  attempt_record RECORD;
  time_classification TEXT;
BEGIN
  -- Get time bucket configuration
  SELECT value INTO time_buckets FROM multiplications_app_config WHERE key = 'time_buckets';
  fast_threshold := (time_buckets->>'fast_threshold')::NUMERIC;
  medium_threshold := (time_buckets->>'medium_threshold')::NUMERIC;
  
  -- Clear existing metrics for the target date
  DELETE FROM multiplications_app_daily_student_metrics 
  WHERE metric_date = target_date AND app_type = 'math';
  
  DELETE FROM multiplications_app_daily_difficulty_metrics 
  WHERE metric_date = target_date AND app_type = 'math';
  
  -- Re-aggregate from question_attempts
  FOR attempt_record IN
    SELECT 
      student_id,
      multiplicand,
      multiplier,
      is_correct,
      time_spent_seconds,
      created_at
    FROM multiplications_app_question_attempts
    WHERE CAST(created_at AT TIME ZONE 'America/New_York' AS date) = target_date
  LOOP
    -- Determine time classification
    IF attempt_record.time_spent_seconds < fast_threshold THEN
      time_classification := 'fast';
    ELSIF attempt_record.time_spent_seconds <= medium_threshold THEN
      time_classification := 'medium';
    ELSE
      time_classification := 'slow';
    END IF;
    
    -- Upsert daily student metrics
    INSERT INTO multiplications_app_daily_student_metrics (
      student_id, metric_date, app_type, attempted, correct, 
      avg_time_seconds, fast_count, medium_count, slow_count, time_spent_seconds
    ) VALUES (
      attempt_record.student_id, target_date, 'math', 1, 
      CASE WHEN attempt_record.is_correct THEN 1 ELSE 0 END,
      attempt_record.time_spent_seconds,
      CASE WHEN time_classification = 'fast' THEN 1 ELSE 0 END,
      CASE WHEN time_classification = 'medium' THEN 1 ELSE 0 END,
      CASE WHEN time_classification = 'slow' THEN 1 ELSE 0 END,
      attempt_record.time_spent_seconds
    )
    ON CONFLICT (student_id, metric_date, app_type) 
    DO UPDATE SET
      attempted = multiplications_app_daily_student_metrics.attempted + 1,
      correct = multiplications_app_daily_student_metrics.correct + CASE WHEN attempt_record.is_correct THEN 1 ELSE 0 END,
      avg_time_seconds = (multiplications_app_daily_student_metrics.avg_time_seconds * multiplications_app_daily_student_metrics.attempted + attempt_record.time_spent_seconds) / (multiplications_app_daily_student_metrics.attempted + 1),
      fast_count = multiplications_app_daily_student_metrics.fast_count + CASE WHEN time_classification = 'fast' THEN 1 ELSE 0 END,
      medium_count = multiplications_app_daily_student_metrics.medium_count + CASE WHEN time_classification = 'medium' THEN 1 ELSE 0 END,
      slow_count = multiplications_app_daily_student_metrics.slow_count + CASE WHEN time_classification = 'slow' THEN 1 ELSE 0 END,
      time_spent_seconds = multiplications_app_daily_student_metrics.time_spent_seconds + attempt_record.time_spent_seconds,
      updated_at = NOW();
    
    -- Upsert daily difficulty metrics
    INSERT INTO multiplications_app_daily_difficulty_metrics (
      student_id, metric_date, app_type, difficulty_band, attempted, correct, 
      avg_time_seconds, time_spent_seconds
    ) VALUES (
      attempt_record.student_id, target_date, 'math', 
      get_difficulty_band(attempt_record.multiplicand, attempt_record.multiplier), 1,
      CASE WHEN attempt_record.is_correct THEN 1 ELSE 0 END,
      attempt_record.time_spent_seconds,
      attempt_record.time_spent_seconds
    )
    ON CONFLICT (student_id, metric_date, app_type, difficulty_band)
    DO UPDATE SET
      attempted = multiplications_app_daily_difficulty_metrics.attempted + 1,
      correct = multiplications_app_daily_difficulty_metrics.correct + CASE WHEN attempt_record.is_correct THEN 1 ELSE 0 END,
      avg_time_seconds = (multiplications_app_daily_difficulty_metrics.avg_time_seconds * multiplications_app_daily_difficulty_metrics.attempted + attempt_record.time_spent_seconds) / (multiplications_app_daily_difficulty_metrics.attempted + 1),
      time_spent_seconds = multiplications_app_daily_difficulty_metrics.time_spent_seconds + attempt_record.time_spent_seconds,
      updated_at = NOW();
  END LOOP;
END;
$$;

-- 7. Update learning sessions trigger function
CREATE OR REPLACE FUNCTION update_learning_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_learning_sessions_updated_at ON multiplications_app_learning_sessions;
CREATE TRIGGER update_learning_sessions_updated_at
BEFORE UPDATE ON multiplications_app_learning_sessions
FOR EACH ROW
EXECUTE FUNCTION update_learning_sessions_updated_at();

-- 8. Update mark_abandoned_sessions function
CREATE OR REPLACE FUNCTION mark_abandoned_sessions()
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

-- 9. Update get_active_sessions_for_student function
CREATE OR REPLACE FUNCTION get_active_sessions_for_student(student_uuid uuid)
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
  RAISE NOTICE 'Tables successfully renamed with multiplications_app_ prefix';
  RAISE NOTICE 'All historical data preserved';
  RAISE NOTICE 'Indexes, triggers, and functions updated';
END $$;