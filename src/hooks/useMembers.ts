import { useState, useCallback, useEffect } from "react";
import { fetchMembers } from "@/api/members";
import type { Member } from "@/data/types";

type ToastFn = (o: { title: string; description?: string; variant?: "destructive" }) => void;

export function useMembers(toast?: ToastFn) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchMembers()
      .then((data) => {
        setMembers(data);
        setError(null);
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "載入失敗";
        setError(msg);
        toast?.({ title: "無法載入成員資料", description: String(e), variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMembers()
      .then((data) => {
        if (!cancelled) setMembers(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "載入失敗");
          toast?.({ title: "無法載入成員資料", description: String(e), variant: "destructive" });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [toast]);

  return { members, loading, error, loadMembers };
}
