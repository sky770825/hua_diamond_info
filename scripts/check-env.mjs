#!/usr/bin/env node
/**
 * 檢查環境變數（本地或 CI 用）
 * 用法: node scripts/check-env.mjs [--deploy]
 * --deploy 時會多檢查 Vercel API 用的 SUPABASE_*
 */

const isDeploy = process.argv.includes("--deploy");

const required = [
  // 前端建置（生產可選，若用靜態 members.json 可不設）
  ["VITE_SUPABASE_URL", "前端 Supabase URL（成員牆資料）"],
  ["VITE_SUPABASE_PUBLISHABLE_KEY", "前端 Supabase anon key"],
];

const deployOnly = [
  ["SUPABASE_URL", "Vercel API /api/events 用"],
  ["SUPABASE_SERVICE_ROLE_KEY", "Vercel API service role key"],
];

const toCheck = isDeploy ? [...required, ...deployOnly] : required;
const missing = toCheck.filter(([key]) => !process.env[key]?.trim());

if (missing.length) {
  console.error("缺少環境變數：");
  missing.forEach(([key, desc]) => console.error(`  - ${key}: ${desc}`));
  console.error("\n請在 .env 或 Vercel/CI 中設定。參考 .env.example");
  process.exit(1);
}

console.log("環境變數檢查通過。");
process.exit(0);
