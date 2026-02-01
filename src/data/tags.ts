import type { Member } from "./types";

export function getAllTags(source: Member[]): string[] {
  const tagSet = new Set<string>();
  source.forEach((m) => m.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

/** 各標籤對應的成員數，供 U2 篩選數量預覽 */
export function getTagCounts(source: Member[]): Record<string, number> {
  const counts: Record<string, number> = {};
  source.forEach((m) =>
    m.tags.forEach((t) => {
      counts[t] = (counts[t] ?? 0) + 1;
    })
  );
  return counts;
}
