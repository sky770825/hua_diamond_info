import type { Member } from "@/data/types";
import { apiUrl } from "./client";

export async function fetchMembers(): Promise<Member[]> {
  const res = await fetch(apiUrl("api/members"));
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}
