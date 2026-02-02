import { apiUrl } from "./client";

const SUPABASE_URL =
  typeof import.meta.env.VITE_SUPABASE_URL === "string" && import.meta.env.VITE_SUPABASE_URL.length > 0
    ? String(import.meta.env.VITE_SUPABASE_URL).replace(/\/$/, "")
    : "";

/** 確保 Supabase Storage URL 為公開路徑（/object/public/），避免 504／403 */
function ensurePublicStorageUrl(url: string): string {
  const s = url.trim();
  if (s.includes("/object/public/")) return s;
  if (s.includes("/storage/v1/object/") && !s.includes("/object/public/")) {
    return s.replace("/storage/v1/object/", "/storage/v1/object/public/");
  }
  return s;
}

/**
 * 將形象照／作品圖路徑轉成可用的圖片 URL。
 * - 完整 URL（http/data:）：確保 Supabase 為 /object/public/ 後回傳。
 * - 使用 Supabase 且為相對路徑：組出 Supabase Storage 公開 URL（後台存的是儲存路徑時前端才能顯示）。
 * - 否則：當作後端 API 相對路徑，用 apiUrl 組出後端 URL。
 */
export function portfolioImageUrl(image: string): string {
  if (image == null || typeof image !== "string") return "";
  const s = image.trim();
  if (s === "") return "";
  if (s.startsWith("http") || s.startsWith("data:")) return ensurePublicStorageUrl(s);
  if (SUPABASE_URL) {
    const path = s.startsWith("/") ? s.slice(1) : s;
    return `${SUPABASE_URL}/storage/v1/object/public/${path}`;
  }
  return apiUrl(s.startsWith("/") ? s : `/${s}`);
}
