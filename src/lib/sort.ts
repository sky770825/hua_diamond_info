import type { Member } from "@/data/types";

export type MemberSortBy = "name" | "no" | "portfolioCount";

export function sortMembers(members: Member[], by: MemberSortBy): Member[] {
  const list = [...members];
  switch (by) {
    case "name":
      return list.sort((a, b) => a.name.localeCompare(b.name, "zh-TW"));
    case "no":
      return list.sort((a, b) => a.no.localeCompare(b.no, undefined, { numeric: true }));
    case "portfolioCount":
      return list.sort(
        (a, b) => (b.portfolio?.length ?? 0) - (a.portfolio?.length ?? 0)
      );
    default:
      return list;
  }
}
