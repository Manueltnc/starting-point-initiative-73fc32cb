-- Grant execute on ensure_user_exists to allow email-only student flow
GRANT EXECUTE ON FUNCTION public.ensure_user_exists(uuid, text, text, text) TO anon, authenticated;

-- Add prototype RLS policies for multiplications_app_math_grid_progress
-- This allows students to write their progress without JWT authentication

CREATE POLICY "prototype_math_grid_insert"
ON multiplications_app_math_grid_progress
FOR INSERT
WITH CHECK (true);

CREATE POLICY "prototype_math_grid_select"
ON multiplications_app_math_grid_progress
FOR SELECT
USING (true);

CREATE POLICY "prototype_math_grid_update"
ON multiplications_app_math_grid_progress
FOR UPDATE
USING (true)
WITH CHECK (true);