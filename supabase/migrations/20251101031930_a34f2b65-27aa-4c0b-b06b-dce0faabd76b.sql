-- Ensure a corresponding row exists in public.users for local-auth students
CREATE OR REPLACE FUNCTION public.ensure_user_exists(
  _id uuid,
  _email text,
  _display_name text DEFAULT NULL,
  _grade_level text DEFAULT '3'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, grade_level, role, created_at, updated_at)
  VALUES (_id, _email, COALESCE(_display_name, split_part(_email,'@',1)), COALESCE(_grade_level,'3'), 'student', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, users.display_name),
    grade_level = COALESCE(EXCLUDED.grade_level, users.grade_level),
    updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_exists(uuid, text, text, text) TO anon, authenticated;