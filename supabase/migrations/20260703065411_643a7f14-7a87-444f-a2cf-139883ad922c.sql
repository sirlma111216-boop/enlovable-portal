
CREATE TABLE public.demo_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_key TEXT NOT NULL,
  class_code TEXT NOT NULL,
  nickname TEXT NOT NULL,
  affiliation TEXT,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_key, class_code)
);
CREATE INDEX demo_participants_class_code_idx ON public.demo_participants (class_code);

GRANT SELECT, INSERT, UPDATE ON public.demo_participants TO anon, authenticated;
GRANT ALL ON public.demo_participants TO service_role;
ALTER TABLE public.demo_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo participants readable by all"
  ON public.demo_participants FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "demo participants insertable by all"
  ON public.demo_participants FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "demo participants self-update"
  ON public.demo_participants FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.demo_activity_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_session_id TEXT NOT NULL UNIQUE,
  participant_id UUID NOT NULL REFERENCES public.demo_participants(id) ON DELETE CASCADE,
  class_code TEXT NOT NULL,
  nickname TEXT NOT NULL,
  affiliation TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX demo_activity_class_code_idx ON public.demo_activity_records (class_code);
CREATE INDEX demo_activity_participant_idx ON public.demo_activity_records (participant_id);

GRANT SELECT, INSERT ON public.demo_activity_records TO anon, authenticated;
GRANT ALL ON public.demo_activity_records TO service_role;
ALTER TABLE public.demo_activity_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo records readable by all"
  ON public.demo_activity_records FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "demo records insertable by all"
  ON public.demo_activity_records FOR INSERT
  TO anon, authenticated WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.demo_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.demo_activity_records;
