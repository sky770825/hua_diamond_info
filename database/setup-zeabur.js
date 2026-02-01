#!/usr/bin/env node
/**
 * 執行 hua_internation schema 與 seed 到 Zeabur PostgreSQL
 * 使用方式：DATABASE_URL="postgresql://..." node database/setup-zeabur.js
 */

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("請設定 DATABASE_URL 環境變數");
  console.error("例如：DATABASE_URL='postgresql://user:pass@host:port/db' node database/setup-zeabur.js");
  process.exit(1);
}

async function runSql(client, filePath) {
  const sql = fs.readFileSync(path.join(__dirname, filePath), "utf-8");
  await client.query(sql);
  console.log(`✓ 已執行 ${filePath}`);
}

async function main() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    console.log("已連線到 Zeabur PostgreSQL\n");

    await runSql(client, "hua_internation_schema.sql");
    await runSql(client, "hua_internation_seed.sql");

    const res = await client.query(
      "SELECT no, name FROM hua_internation.members ORDER BY no"
    );
    console.log("\n已建立的成員：");
    res.rows.forEach((r) => console.log(`  - ${r.no}: ${r.name}`));
    console.log("\n完成。");
  } catch (err) {
    console.error("錯誤：", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
