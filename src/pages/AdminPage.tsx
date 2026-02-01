import { useEffect, useState } from "react";
import { fetchMembers } from "@/api/members";
import type { Member } from "@/data/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// 完整管理後台網址：生產環境必須設 VITE_ADMIN_URL；開發時用 localhost
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || "";
const IS_DEV = import.meta.env.DEV;

const AdminPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ADMIN_URL) {
      window.location.href = `${ADMIN_URL}/admin`;
      return;
    }
    fetchMembers()
      .then(setMembers)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  // 有後端網址時顯示轉向中
  if (ADMIN_URL) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <p>正在前往管理後台…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-secondary/20">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold">管理後台（唯讀預覽）</h1>
            <a href="/" className="text-sm text-primary hover:underline">
              ← 回成員牆
            </a>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
          <p className="mb-2">
            <strong className="text-foreground">此為唯讀預覽</strong>
            ，僅顯示成員資料。
          </p>
          {ADMIN_URL ? (
            <a
              href={`${ADMIN_URL}/admin`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-primary hover:underline"
            >
              → 開啟完整管理後台（新增／編輯／刪除）
            </a>
          ) : IS_DEV ? (
            <>
              <p className="mb-2">本機開發：啟動後端後可開啟完整管理後台。</p>
              <code className="block rounded bg-secondary/50 p-2 text-xs mb-2">
                npm run dev:backend
              </code>
              <a
                href="http://localhost:3001/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-primary hover:underline"
              >
                → 開啟完整管理後台（http://localhost:3001/admin）
              </a>
            </>
          ) : (
            <p className="mt-2">
              完整編輯功能需將後端部署至 Zeabur 等服務，並在 Cloudflare Pages 設定{" "}
              <code className="rounded bg-secondary/50 px-1">VITE_ADMIN_URL</code>。
              詳見 docs/完整管理後台部署說明.md。
            </p>
          )}
        </div>

        {loading ? (
          <p className="text-muted-foreground">載入中…</p>
        ) : error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-destructive">載入失敗：{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchMembers()
                  .then(setMembers)
                  .catch((e) => setError(e instanceof Error ? e.message : String(e)))
                  .finally(() => setLoading(false));
              }}
            >
              重試
            </Button>
          </div>
        ) : members.length === 0 ? (
          <p className="text-muted-foreground">尚無成員資料</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <Card key={m.no} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">NO.{m.no}</span>
                  </div>
                  <h2 className="text-lg font-semibold">{m.name}</h2>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="flex flex-wrap gap-1">
                    {(m.tags || []).map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  {m.needs?.general && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {m.needs.general}
                    </p>
                  )}
                  {(m.services || []).length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      服務：{(m.services || []).slice(0, 2).join("、")}
                      {(m.services?.length || 0) > 2 ? "…" : ""}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
