
-- Drop overly-permissive public SELECT policy that exposed player_key
DROP POLICY IF EXISTS "demo participants readable by all" ON public.demo_participants;

-- Keep insert policy as-is. Add a restrictive SELECT policy: no direct public reads.
-- (No SELECT policy => no rows are returned via direct table SELECT.)

-- Public-safe view without player_key
CREATE OR REPLACE VIEW public.demo_participants_public
WITH (security_invoker = true) AS
SELECT id, class_code, nickname, created_at, updated_at
FROM public.demo_participants;

GRANT SELECT ON public.demo_participants_public TO anon, authenticated;

-- Because the view uses security_invoker, we need a SELECT policy that allows
-- reading rows through the view. Allow reading rows but the view itself does
-- not project player_key.
CREATE POLICY "demo participants public columns readable"
ON public.demo_participants
FOR SELECT
TO anon, authenticated
USING (true);

-- Revoke column-level SELECT on player_key so direct table selects cannot read it
REVOKE SELECT ON public.demo_participants FROM anon, authenticated;
GRANT SELECT (id, class_code, nickname, created_at, updated_at)
  ON public.demo_participants TO anon, authenticated;

-- Security-definer lookup so a participant can find their own row by their private key
CREATE OR REPLACE FUNCTION public.find_demo_participant(
  _player_key text,
  _class_code text
)
RETURNS TABLE (
  id uuid,
  class_code text,
  nickname text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, class_code, nickname, created_at, updated_at
  FROM public.demo_participants
  WHERE player_key = _player_key
    AND class_code = _class_code
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.find_demo_participant(text, text) TO anon, authenticated;
