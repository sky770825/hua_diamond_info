-- ============================================================
-- Supabase: public.events（供 /api/events 使用）
-- 在 Supabase Dashboard → SQL Editor 執行一次即可
-- ============================================================

-- 若專案已有 public schema，直接建立表
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT,
  description TEXT,
  payload JSONB DEFAULT '{}'
);

-- 建議索引（依 created_at 倒序查詢）
CREATE INDEX IF NOT EXISTS events_created_at_desc
  ON public.events (created_at DESC);

-- RLS：允許 anon 讀取（若需僅 service role 讀取可關閉 anon 讀權限）
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read"
  ON public.events FOR SELECT
  TO anon
  USING (true);

-- 可選：僅允許 service role 寫入
-- CREATE POLICY "Allow service role all"
--   ON public.events FOR ALL
--   TO service_role
--   USING (true)
--   WITH CHECK (true);

COMMENT ON TABLE public.events IS 'Events for /api/events (Vercel serverless)';
