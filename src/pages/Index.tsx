import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { Member } from "@/data/types";
import { getAllTags, getTagCounts } from "@/data/tags";
import { filterMembers } from "@/lib/filters";
import { sortMembers, type MemberSortBy } from "@/lib/sort";
import { useMembers } from "@/hooks/useMembers";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useToast } from "@/hooks/use-toast";
import { MemberCard, MemberCardSkeleton, MemberDetailDialog } from "@/components/members";
import { RefreshButton, ClearFiltersButton } from "@/components/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, Filter, UsersRound, ChevronDown, ChevronUp } from "lucide-react";

const SORT_OPTIONS: { value: MemberSortBy; label: string }[] = [
  { value: "name", label: "姓名" },
  { value: "no", label: "編號" },
  { value: "portfolioCount", label: "作品數" },
];

const SKELETON_COUNT = 6;

const Index = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { members, loading, error, loadMembers } = useMembers(toast);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 280);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<MemberSortBy>("no");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(false);

  const allTags = useMemo(() => getAllTags(members), [members]);
  const tagCounts = useMemo(() => getTagCounts(members), [members]);
  const filteredMembers = useMemo(
    () => filterMembers(members, { search: debouncedSearch, tags: selectedTags }),
    [members, debouncedSearch, selectedTags]
  );
  const sortedMembers = useMemo(
    () => sortMembers(filteredMembers, sortBy),
    [filteredMembers, sortBy]
  );
  const hasFilters = debouncedSearch !== "" || selectedTags.length > 0;

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleTagClickFromCard = useCallback((tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
  }, []);

  const handleClear = useCallback(() => {
    setSearchInput("");
    setSelectedTags([]);
  }, []);

  const handleMemberClick = useCallback((member: Member) => {
    setSelectedMember(member);
    setDetailOpen(true);
  }, []);

  const handleShare = useCallback(
    (member: Member) => {
      const url = `${window.location.origin}${window.location.pathname}?member=${member.no}`;
      setSearchParams({ member: member.no });
      navigator.clipboard.writeText(url).then(
        () => toast({ title: "已複製連結", description: "分享連結已複製到剪貼簿。" }),
        () => toast({ title: "複製失敗", variant: "destructive" })
      );
    },
    [setSearchParams, toast]
  );

  useEffect(() => {
    const no = searchParams.get("member");
    if (!no || !members.length) return;
    const m = members.find((x) => x.no === no);
    if (m) {
      setSelectedMember(m);
      setDetailOpen(true);
    }
  }, [members, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-destructive font-medium">載入失敗</p>
        <p className="text-muted-foreground text-sm text-center">{error}</p>
        <p className="text-muted-foreground text-sm">
          請確認後端 API 已啟動（預設 http://localhost:3001）
        </p>
        <RefreshButton
          onClick={loadMembers}
          disabled={loading}
          loading={loading}
          label="重試"
          aria-label="重試"
          title="重新載入"
          className="mt-2"
        />
      </div>
    );
  }

  const showSkeleton = loading && members.length === 0;
  const showEmptyMembers = !loading && members.length === 0;
  const showNoResults = members.length > 0 && sortedMembers.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">
        跳到主內容
      </a>
      <header className="relative border-b border-border bg-gradient-to-b from-secondary/30 to-background">
        <div className="container py-8 sm:py-10 md:py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 sm:gap-8">
            <div className="min-w-0">
              <h1 className="text-3xl xs:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 leading-tight flex items-center gap-2 flex-wrap">
                <UsersRound className="w-8 h-8 sm:w-9 sm:h-9 text-primary shrink-0" aria-hidden />
                <span>
                  <span className="text-gradient">資訊組</span>
                  <span className="text-foreground">｜成員牆</span>
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                快速找到能協助你的人（引薦需求 / 服務項目）
              </p>
            </div>

            <div className="flex flex-col xs:flex-row gap-3 lg:w-auto w-full shrink-0 no-print">
              <div className="relative flex-1 min-w-0 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground shrink-0 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="搜尋姓名 / 關鍵字（例：廣告、直播、LINE OA）"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 min-h-[48px] sm:h-12 bg-secondary/50 border-border text-foreground text-base placeholder:text-muted-foreground focus:ring-primary touch-manipulation"
                />
              </div>
              <div className="flex gap-2 xs:gap-3 flex-shrink-0">
                <ClearFiltersButton
                  onClick={handleClear}
                  disabled={!hasFilters}
                  className="min-h-[48px] sm:h-12 flex-1 xs:flex-initial px-4 border-border text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-50 touch-manipulation"
                />
                <RefreshButton
                  onClick={loadMembers}
                  disabled={loading}
                  loading={loading}
                  className="min-h-[48px] sm:h-12 flex-1 xs:flex-initial px-4 border-border text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-50 touch-manipulation"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b border-border bg-secondary/20 no-print" role="search" aria-label="篩選成員">
        <div className="container py-2 sm:py-3">
          <Collapsible open={filterExpanded} onOpenChange={setFilterExpanded}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left focus-ring rounded-md py-1.5 px-1 -mx-1"
                aria-expanded={filterExpanded}
                aria-label={filterExpanded ? "收合技能標籤" : "展開技能標籤"}
              >
                <Filter className="w-4 h-4 shrink-0" />
                <span>技能標籤：</span>
                <span className="text-foreground font-medium">
                  {selectedTags.length === 0 ? `全部 (${members.length})` : `${selectedTags.join("、")} · 顯示 ${sortedMembers.length} 位`}
                </span>
                <span className="ml-auto shrink-0 text-muted-foreground">
                  {filterExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap pt-2 pb-1">
                <Badge
                  variant={selectedTags.length === 0 ? "default" : "outline"}
                  role="button"
                  tabIndex={0}
                  className={`touch-target cursor-pointer transition-all py-2.5 px-3 rounded-md text-sm focus-ring ${
                    selectedTags.length === 0
                      ? "bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-primary"
                  }`}
                  onClick={() => setSelectedTags([])}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedTags([]);
                    }
                  }}
                >
                  全部{members.length > 0 ? ` (${members.length})` : ""}
                </Badge>
                {allTags.map((tag) => {
                  const n = tagCounts[tag] ?? 0;
                  return (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      role="button"
                      tabIndex={0}
                      className={`touch-target cursor-pointer transition-all py-2.5 px-3 rounded-md text-sm focus-ring ${
                        selectedTags.includes(tag)
                          ? "bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-primary"
                      }`}
                      onClick={() => handleTagToggle(tag)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleTagToggle(tag);
                        }
                      }}
                    >
                      {tag}{n > 0 ? ` (${n})` : ""}
                    </Badge>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </section>

      <main id="main-content" className="container py-6 sm:py-8 md:py-10 lg:py-12" tabIndex={-1}>
        {showEmptyMembers ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <UsersRound className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">尚無成員</h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-[65ch] mb-4">
              成員資料由後台維護，請至管理後台新增成員後再瀏覽。
            </p>
          </div>
        ) : showSkeleton ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <MemberCardSkeleton key={i} />
            ))}
          </div>
        ) : showNoResults ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">找不到符合條件的成員</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-[65ch]">
              請調整關鍵字或清除篩選條件；也可試試放寬標籤。
            </p>
            <Button
              variant="outline"
              onClick={handleClear}
              className="min-h-[48px] px-6 border-border text-muted-foreground hover:text-foreground touch-manipulation"
            >
              清除所有篩選
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-5 no-print">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">排序：</span>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as MemberSortBy)}>
                  <SelectTrigger className="w-[140px] h-10 border-border bg-secondary/50" aria-label="排序依據">
                    <SelectValue placeholder="排序" />
                  </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {sortedMembers.map((member) => (
                <MemberCard
                  key={member.no}
                  member={member}
                  onClick={() => handleMemberClick(member)}
                  onTagClick={handleTagClickFromCard}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-border bg-secondary/20 no-print">
        <div className="container py-4 sm:py-6">
          <div className="text-center text-sm text-muted-foreground">
            <span>2026 華地產鑽石分會資訊組 蔡濬瑒製</span>
          </div>
        </div>
      </footer>

      <MemberDetailDialog
        member={selectedMember}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onShare={handleShare}
      />
    </div>
  );
};

export default Index;
