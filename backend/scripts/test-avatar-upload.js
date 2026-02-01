#!/usr/bin/env node
/**
 * 測試形象照上傳與刪除：為三位成員上傳隨機圖片，驗證後刪除
 * 使用方式：確保後端已啟動 (npm run dev:backend)，執行 node backend/scripts/test-avatar-upload.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API = process.env.API_URL || "http://localhost:3001";
const MEMBERS = ["016", "080", "100"];

const COLORS = [
  [79, 195, 247],   // 藍
  [129, 199, 132],  // 綠
  [255, 183, 77],   // 橙
];

async function createTestImage(filePath, color) {
  const [r, g, b] = color;
  await sharp({
    create: {
      width: 200,
      height: 300,
      channels: 3,
      background: { r, g, b },
    },
  })
    .jpeg({ quality: 90 })
    .toFile(filePath);
}

async function uploadAvatar(no, filePath) {
  const form = new FormData();
  const buffer = fs.readFileSync(filePath);
  const blob = new Blob([buffer], { type: "image/jpeg" });
  form.append("image", blob, `avatar-${no}.jpg`);

  const res = await fetch(`${API}/api/members/${no}/avatar`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || res.statusText);
  }
  return res.json();
}

async function deleteAvatar(no) {
  const res = await fetch(`${API}/api/members/${no}/avatar`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

async function main() {
  const tmpDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  console.log("1. 建立測試圖片…");
  const files = [];
  for (let i = 0; i < MEMBERS.length; i++) {
    const fp = path.join(tmpDir, `test-${MEMBERS[i]}.jpg`);
    await createTestImage(fp, COLORS[i]);
    files.push(fp);
  }

  console.log("2. 上傳形象照…");
  const avatars = [];
  for (let i = 0; i < MEMBERS.length; i++) {
    const no = MEMBERS[i];
    const m = await uploadAvatar(no, files[i]);
    avatars.push(m.avatar);
    console.log(`   ✓ ${no} ${m.name}: ${m.avatar}`);
  }

  console.log("3. 驗證資料已寫入（avatar 欄位）");
  const listRes = await fetch(`${API}/api/members`);
  const members = await listRes.json();
  for (const m of members) {
    const hasAvatar = !!m.avatar;
    console.log(`   ${m.no} ${m.name}: ${hasAvatar ? m.avatar : "(無)"}`);
  }

  console.log("4. 刪除形象照…");
  for (const no of MEMBERS) {
    await deleteAvatar(no);
    console.log(`   ✓ 已刪除 ${no}`);
  }

  for (const fp of files) {
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  console.log("5. 完成。");
}

main().catch((e) => {
  console.error("錯誤：", e.message);
  process.exit(1);
});
