import { apiUrl } from "./client";

/** 確保 Supabase Storage URL 為公開路徑（/object/public/），避免 504／403 */
function ensurePublicStorageUrl(url: string): string {
  const s = url.trim();
  if (s.includes("/object/public/")) return s;
  if (s.includes("/storage/v1/object/") && !s.includes("/object/public/")) {
    return s.replace("/storage/v1/object/", "/storage/v1/object/public/");
  }
  return s;
}

export function portfolioImageUrl(image: string): string {
  if (image == null || typeof image !== "string") return "";
  const s = image.trim();
  if (s === "") return "";
  if (s.startsWith("http") || s.startsWith("data:")) return ensurePublicStorageUrl(s);
  return apiUrl(s.startsWith("/") ? s : `/${s}`);
}
