/**
 * 測試 Supabase Storage 上傳（形象照 / 作品）
 * 執行: node scripts/test-supabase-upload.mjs
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://cnzqtuuegdqwkgvletaa.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuenF0dXVlZ2Rxd2tndmxldGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMjUxMTksImV4cCI6MjA4MzcwMTExOX0.gsO3RKdMu2bUXW4b5aHseouIkjXtJyIqqP_0x3Y6trE";

const BUCKET = "hua-diamond-images";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log("1. 測試 Storage 上傳（avatar）...");
  const avatarPath = "avatars/016_" + Date.now() + ".txt";
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(avatarPath, "test avatar content", { contentType: "text/plain", upsert: true });
  if (upErr) {
    console.error("Avatar 上傳失敗:", upErr.message);
    process.exit(1);
  }
  console.log("   Avatar 上傳成功:", avatarPath);

  console.log("2. 測試 Storage 上傳（portfolio）...");
  const portfolioPath = "portfolio/016/" + Date.now() + ".txt";
  const { error: upErr2 } = await supabase.storage.from(BUCKET).upload(portfolioPath, "test portfolio content", { contentType: "text/plain", upsert: true });
  if (upErr2) {
    console.error("Portfolio 上傳失敗:", upErr2.message);
    process.exit(1);
  }
  console.log("   Portfolio 上傳成功:", portfolioPath);

  console.log("3. 取得 public URL...");
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(avatarPath);
  console.log("   Public URL:", urlData?.publicUrl);

  console.log("4. 測試更新 hua_members.avatar...");
  const { error: updateErr } = await supabase.from("hua_members").update({ avatar: urlData?.publicUrl || "" }).eq("no", "016");
  if (updateErr) {
    console.error("   更新 avatar 失敗:", updateErr.message);
  } else {
    console.log("   更新 avatar 成功");
  }

  console.log("5. 測試新增 hua_member_portfolios...");
  const { data: inserted, error: insertErr } = await supabase.from("hua_member_portfolios").insert({
    member_no: "016",
    title: "測試作品",
    description: "腳本測試",
    image: urlData?.publicUrl || "",
  }).select().single();
  if (insertErr) {
    console.error("   新增作品失敗:", insertErr.message);
  } else {
    console.log("   新增作品成功, id:", inserted?.id);
  }

  console.log("\n全部測試通過。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
