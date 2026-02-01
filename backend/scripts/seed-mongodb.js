/**
 * 將 backend/data/members.json 的資料寫入 MongoDB
 * 使用方式：MONGODB_URI="mongodb://..." node scripts/seed-mongodb.js
 * 選項：CLEAR=1 會先清空 members 集合再寫入
 */

import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "../data/members.json");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("請設定 MONGODB_URI 環境變數");
  process.exit(1);
}

const DB_NAME = "hua_diamond_info";
const COLLECTION = "members";

async function main() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const members = JSON.parse(raw);

  if (!Array.isArray(members) || members.length === 0) {
    console.log("members.json 為空，略過");
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION);

    if (process.env.CLEAR === "1") {
      await col.deleteMany({});
      console.log("已清空 members 集合");
    }

    // 移除 _id 欄位（若從其他來源匯入），確保 no 為字串
    const docs = members.map((m) => {
      const { _id, ...rest } = m;
      return { ...rest, no: String(rest.no) };
    });

    const result = await col.insertMany(docs);
    console.log(`已寫入 ${result.insertedCount} 筆成員資料到 MongoDB (${DB_NAME}.${COLLECTION})`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
