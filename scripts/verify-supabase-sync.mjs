#!/usr/bin/env node
/**
 * 前後端 Supabase 同步驗證
 * 使用與前端相同的邏輯讀取 hua_members + hua_member_portfolios，確認資料與欄位對應一致。
 *
 * 使用方式：
 *   node --env-file=.env scripts/verify-supabase-sync.mjs
 *   或先 export VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY 再執行
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// 從專案根目錄載入 .env（簡單解析 KEY=value）
function loadEnv() {
  const root = resolve(process.cwd());
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) {
      const val = m[2].replace(/^["']|["']$/g, "").trim();
      process.env[m[1]] = val;
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("請設定 VITE_SUPABASE_URL 與 VITE_SUPABASE_PUBLISHABLE_KEY（.env 或環境變數）");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 與前端 src/api/members.ts 一致的欄位對應
function rowToMember(row) {
  return {
    no: row.no,
    name: row.name,
    avatar: row.avatar ?? undefined,
    tags: row.tags ?? [],
    needs: row.needs ?? { general: "", ideal: "", dream: "" },
    services: row.services ?? [],
    contact: row.contact ?? undefined,
    portfolio: (row.portfolios ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      image: p.image,
    })),
  };
}

async function main() {
  console.log("Supabase 前後端同步驗證\n");
  console.log("資料來源:", SUPABASE_URL);
  console.log("表: hua_members, hua_member_portfolios\n");

  const [membersRes, portfoliosRes] = await Promise.all([
    supabase.from("hua_members").select("*").order("no"),
    supabase.from("hua_member_portfolios").select("*").order("sort_order"),
  ]);

  if (membersRes.error) {
    console.error("hua_members 讀取失敗:", membersRes.error.message);
    process.exit(1);
  }
  if (portfoliosRes.error) {
    console.error("hua_member_portfolios 讀取失敗:", portfoliosRes.error.message);
    process.exit(1);
  }

  const rows = (membersRes.data ?? []).filter((r) => r?.no != null);
  const portfolios = portfoliosRes.data ?? [];
  const byNo = {};
  rows.forEach((r) => {
    byNo[r.no] = { ...r, portfolios: [] };
  });
  portfolios.forEach((p) => {
    if (byNo[p.member_no]) byNo[p.member_no].portfolios.push(p);
  });

  const list = Object.values(byNo)
    .map(rowToMember)
    .sort((a, b) => String(a.no).localeCompare(String(b.no), undefined, { numeric: true }));

  console.log("--- 成員列表（與前端 fetchMembers() 一致）---");
  console.log("成員數:", list.length);
  console.log("作品總筆數:", portfolios.length);
  console.log("");

  for (const m of list) {
    const avatarStatus = m.avatar ? "有" : "無";
    const avatarPreview = m.avatar
      ? (m.avatar.includes("/object/public/") ? "URL 含 /object/public/" : "URL 格式請確認")
      : "";
    console.log(`NO.${m.no} ${m.name}`);
    console.log(`  形象照: ${avatarStatus} ${avatarPreview}`);
    console.log(`  作品數: ${m.portfolio?.length ?? 0}`);
    const needsKeys = m.needs && typeof m.needs === "object" ? Object.keys(m.needs) : [];
    if (needsKeys.length && !needsKeys.includes("general")) {
      console.log(`  注意: needs 欄位缺少 general/ideal/dream 其一，前端會用預設空字串`);
    }
    console.log("");
  }

  console.log("--- 欄位對應檢查 ---");
  const dbCols = rows[0] ? Object.keys(rows[0]) : [];
  const expected = ["no", "name", "avatar", "tags", "needs", "services", "contact"];
  const missing = expected.filter((k) => !dbCols.includes(k));
  if (missing.length) {
    console.log("hua_members 缺少欄位:", missing.join(", "));
  } else {
    console.log("hua_members 欄位與前端預期一致: no, name, avatar, tags, needs, services, contact");
  }

  if (portfolios.length > 0) {
    const portCols = Object.keys(portfolios[0]);
    const portExpected = ["id", "member_no", "title", "description", "image", "sort_order"];
    const portMissing = portExpected.filter((k) => !portCols.includes(k));
    if (portMissing.length) {
      console.log("hua_member_portfolios 缺少欄位:", portMissing.join(", "));
    } else {
      console.log("hua_member_portfolios 欄位與前端預期一致: id, member_no, title, description, image, sort_order");
    }
  } else {
    console.log("hua_member_portfolios 目前無資料，欄位以 DB schema 為準: id, member_no, title, description, image, sort_order");
  }

  console.log("\n驗證完成。前端與後台請使用同一組 VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY 以確保同步。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
