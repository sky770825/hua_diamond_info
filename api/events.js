/**
 * Vercel Serverless: GET /api/events
 * 從 Supabase 讀取 events 表（需有 created_at 欄位），並設定 CDN 快取。
 * 環境變數：SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY（在 Vercel 專案設定）。
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!supabase) {
    return res.status(503).json({
      error: "Supabase not configured (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)",
    });
  }

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  );
  res.setHeader("X-Cache-From", "vercel-edge");

  return res.status(200).json(data ?? []);
}
