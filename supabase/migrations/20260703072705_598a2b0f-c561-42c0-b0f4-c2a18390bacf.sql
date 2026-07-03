-- Remove overly permissive UPDATE policy — participants are now insert-only.
DROP POLICY IF EXISTS "demo participants self-update" ON public.demo_participants;

-- Tighten INSERT policies so they aren't literally WITH CHECK (true).
DROP POLICY IF EXISTS "demo participants insertable by all" ON public.demo_participants;
CREATE POLICY "demo participants insertable by all"
  ON public.demo_participants
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(nickname)) BETWEEN 1 AND 40
    AND length(btrim(class_code)) BETWEEN 1 AND 40
    AND length(btrim(player_key)) BETWEEN 1 AND 100
  );

DROP POLICY IF EXISTS "demo records insertable by all" ON public.demo_activity_records;
CREATE POLICY "demo records insertable by all"
  ON public.demo_activity_records
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(nickname)) BETWEEN 1 AND 40
    AND length(btrim(class_code)) BETWEEN 1 AND 40
    AND length(btrim(activity_session_id)) BETWEEN 1 AND 100
    AND participant_id IS NOT NULL
  );