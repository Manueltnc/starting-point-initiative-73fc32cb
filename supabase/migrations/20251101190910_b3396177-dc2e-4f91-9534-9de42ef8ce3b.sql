-- Fix ensure_user_exists to be id-stable and return canonical id
-- This prevents duplicate key violations and ensures RLS works correctly

DROP FUNCTION IF EXISTS public.ensure_user_exists(uuid, text, text, text);

CREATE OR REPLACE FUNCTION public.ensure_user_exists(
  _id uuid,
  _email text,
  _display_name text DEFAULT NULL,
  _grade_level text DEFAULT '3'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id uuid;
BEGIN
  -- Check if user with this email already exists
  SELECT id INTO existing_id
  FROM public.users
  WHERE email = _email;

  IF existing_id IS NOT NULL THEN
    -- Update existing user's metadata, DO NOT change id
    UPDATE public.users
    SET
      display_name = COALESCE(_display_name, display_name),
      grade_level = COALESCE(_grade_level, grade_level),
      updated_at = NOW()
    WHERE id = existing_id;

    -- Return the existing canonical id
    RETURN existing_id;
  END IF;

  -- Insert new user with provided id
  INSERT INTO public.users (id, email, display_name, grade_level, role, created_at, updated_at)
  VALUES (_id, _email, COALESCE(_display_name, split_part(_email,'@',1)), COALESCE(_grade_level, '3'), 'student', NOW(), NOW());

  RETURN _id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_exists(uuid, text, text, text) TO anon, authenticated;