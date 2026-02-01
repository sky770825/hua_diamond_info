import type { Member } from "@/data/types";

export interface FilterParams {
  search: string;
  tags: string[];
}

export function filterMembers(members: Member[], { search, tags }: FilterParams): Member[] {
  const q = search.trim().toLowerCase();
  return members.filter((m) => {
    const matchSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q)) ||
      m.needs.general.toLowerCase().includes(q) ||
      m.needs.ideal.toLowerCase().includes(q) ||
      m.needs.dream.toLowerCase().includes(q) ||
      m.services.some((s) => s.toLowerCase().includes(q));
    const matchTags =
      tags.length === 0 || tags.some((t) => m.tags.includes(t));
    return matchSearch && matchTags;
  });
}
