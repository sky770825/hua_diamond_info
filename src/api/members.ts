import type { Member } from "@/data/types";
import { apiUrl } from "./client";
import { supabase } from "@/integrations/supabase/client";

const USE_SUPABASE =
  typeof import.meta.env.VITE_SUPABASE_URL === "string" &&
  import.meta.env.VITE_SUPABASE_URL.length > 0;

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

export async function fetchMembers(): Promise<Member[]> {
  if (USE_SUPABASE && supabase) {
    const [membersRes, portfoliosRes] = await Promise.all([
      (supabase as any).from("hua_members").select("*").order("no"),
      (supabase as any).from("hua_member_portfolios").select("*").order("sort_order"),
    ]);
    if (membersRes.error) throw new Error(membersRes.error.message);
    const rows = (membersRes.data ?? []).filter((r: any) => r?.no != null);
    const portfolios = portfoliosRes.data ?? [];
    const byNo: Record<string, any> = {};
    rows.forEach((r: any) => {
      byNo[r.no] = { ...r, portfolios: [] };
    });
    portfolios.forEach((p: any) => {
      if (byNo[p.member_no]) byNo[p.member_no].portfolios.push(p);
    });
    const list = Object.values(byNo).map((r) => rowToMember(r));
    list.sort((a, b) => a.no.localeCompare(b.no, undefined, { numeric: true }));
    return list;
  }
  const res = await fetch(apiUrl("api/members"));
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}
