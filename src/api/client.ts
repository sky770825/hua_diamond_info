// 開發時 API_URL 留空：走 Vite proxy 同源請求
// 生產時若未設定 API_URL：改用靜態 members.json
const raw = import.meta.env.API_URL ?? "";
const API_BASE =
  raw === undefined || raw === "" ? "" : String(raw).replace(/\/$/, "");
const USE_STATIC_MEMBERS =
  import.meta.env.PROD && !API_BASE;

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (USE_STATIC_MEMBERS && p === "/api/members") return "/members.json";
  return API_BASE ? `${API_BASE}${p}` : p;
}
