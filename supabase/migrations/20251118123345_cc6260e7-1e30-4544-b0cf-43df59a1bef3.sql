-- Enable pg_net extension for HTTP requests (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule the mark-abandoned-sessions edge function to run every 15 minutes
SELECT cron.schedule(
  'mark-abandoned-sessions-job',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT
    net.http_post(
        url:='https://pyoyzyzhcwrqqyujjmze.supabase.co/functions/v1/mark-abandoned-sessions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5b3l6eXpoY3dycXF5dWpqbXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODA5MTUsImV4cCI6MjA2NzY1NjkxNX0.CG1T1e4pUhipDyesjNiCD2YSDFXQi5dAhpKJZx6ytFk"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);