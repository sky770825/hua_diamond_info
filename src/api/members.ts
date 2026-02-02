import type { Member } from "@/data/types";
import { apiUrl } from "./client";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";

const BASE = (SUPABASE_URL || "").replace(/\/$/, "");

function rowToMember(row: {
  no: string;
  name: string;
  avatar?: string | null;
  tags?: string[] | null;
  needs?: Record<string, string> | null;
  services?: string[] | null;
  contact?: Record<string, string> | null;
  portfolios?: { id: string; title?: string; description?: string; image: string }[];
}): Member {
  return {
    no: row.no,
    name: row.name,
    avatar: row.avatar ?? undefined,
    tags: row.tags ?? [],
    needs: (row.needs as Member["needs"]) ?? { general: "", ideal: "", dream: "" },
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

const SUPABASE_HEADERS: HeadersInit = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  "Content-Type": "application/json",
};

/** 用 fetch 直接呼叫 Supabase REST API，確保 Network 會看到請求 */
async function fetchFromSupabase(): Promise<Member[]> {
  const [membersRes, portfoliosRes] = await Promise.all([
    fetch(`${BASE}/rest/v1/hua_members?select=*&order=no.asc`, { headers: SUPABASE_HEADERS }),
    fetch(`${BASE}/rest/v1/hua_member_portfolios?select=*&order=sort_order.asc`, { headers: SUPABASE_HEADERS }),
  ]);
  if (!membersRes.ok) {
    const err = (await membersRes.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message || membersRes.statusText || "Supabase 成員表請求失敗");
  }
  const rows = ((await membersRes.json()) as any[]).filter((r: any) => r?.no != null);
  const portfoliosRaw = await portfoliosRes.json().catch(() => []);
  const portfolios = Array.isArray(portfoliosRaw) ? portfoliosRaw : [];
  if (!portfoliosRes.ok && import.meta.env.DEV) {
    console.warn("[fetchMembers] 作品表請求非 200，使用空列表", portfoliosRes.status);
  }
  const byNo: Record<string, any> = {};
  rows.forEach((r: any) => {
    byNo[r.no] = { ...r, portfolios: [] };
  });
  portfolios.forEach((p: any) => {
    if (byNo[p.member_no]) byNo[p.member_no].portfolios.push(p);
  });
  const list = Object.values(byNo).map((r) => rowToMember(r));
  list.sort((a, b) => a.no.localeCompare(b.no, undefined, { numeric: true }));
  if (import.meta.env.DEV && list.length > 0) {
    const withAvatar = list.filter((m) => m.avatar);
    const withPortfolio = list.filter((m) => (m.portfolio?.length ?? 0) > 0);
    console.log("[fetchMembers] Supabase 已載入", list.length, "位成員，有形象照:", withAvatar.length, "位，有作品:", withPortfolio.length, "位");
  }
  return list;
}

export async function fetchMembers(): Promise<Member[]> {
  if (BASE) {
    return fetchFromSupabase();
  }
  const res = await fetch(apiUrl("api/members"));
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}
