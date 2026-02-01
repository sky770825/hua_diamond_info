// 開發時 VITE_API_URL 留空：走 Vite proxy 同源請求，避免 CORS
const raw = import.meta.env.VITE_API_URL;
const API_BASE =
  raw === undefined || raw === "" ? "" : String(raw).replace(/\/$/, "");

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${p}` : p;
}
