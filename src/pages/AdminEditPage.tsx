import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Member } from "@/data/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AdminEditPage = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    document.title = "編輯管理後台｜資訊組";
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      // 從 localStorage 或 API 載入
      const stored = localStorage.getItem("members_data");
      if (stored) {
        setMembers(JSON.parse(stored));
      } else {
        // 載入靜態 JSON 作為初始數據
        const res = await fetch("/members.json");
        const data = await res.json();
        setMembers(data);
        localStorage.setItem("members_data", JSON.stringify(data));
      }
    } catch (error) {
      toast.error("載入失敗：" + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const saveMembers = (newMembers: Member[]) => {
    localStorage.setItem("members_data", JSON.stringify(newMembers));
    setMembers(newMembers);
    toast.success("儲存成功！");
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newMember: Member = {
      no: formData.get("no") as string,
      name: formData.get("name") as string,
      tags: (formData.get("tags") as string)?.split(",").map(t => t.trim()).filter(Boolean) || [],
      needs: {
        general: formData.get("general") as string || "",
        ideal: formData.get("ideal") as string || "",
        dream: formData.get("dream") as string || "",
      },
      services: (formData.get("services") as string)?.split("\n").filter(Boolean) || [],
      portfolio: [],
      contact: {
        line: formData.get("line") as string || undefined,
        email: formData.get("email") as string || undefined,
      },
    };

    saveMembers([...members, newMember]);
    setShowAddForm(false);
    e.currentTarget.reset();
  };

  const handleEdit = (memberId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updatedMembers = members.map(m => {
      if (m.no === memberId) {
        return {
          ...m,
          name: formData.get("name") as string,
          tags: (formData.get("tags") as string)?.split(",").map(t => t.trim()).filter(Boolean) || [],
          needs: {
            general: formData.get("general") as string || "",
            ideal: formData.get("ideal") as string || "",
            dream: formData.get("dream") as string || "",
          },
          services: (formData.get("services") as string)?.split("\n").filter(Boolean) || [],
          contact: {
            line: formData.get("line") as string || undefined,
            email: formData.get("email") as string || undefined,
          },
        };
      }
      return m;
    });

    saveMembers(updatedMembers);
    setEditingId(null);
  };

  const handleDelete = (memberId: string) => {
    if (!confirm("確定要刪除此成員嗎？")) return;
    saveMembers(members.filter(m => m.no !== memberId));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">載入中…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-secondary/20">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold">編輯管理後台</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/admin")}>
                唯讀預覽
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                ← 回成員牆
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <p className="mb-2">
            <strong>本地編輯模式</strong>：資料儲存在瀏覽器 localStorage
          </p>
          <p className="text-muted-foreground">
            注意：清除瀏覽器資料將會遺失所有修改。如需持久化儲存，請部署完整後端。
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? "取消新增" : "＋ 新增成員"}
            </Button>
          </CardHeader>
          {showAddForm && (
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="no">編號 *</Label>
                    <Input id="no" name="no" required placeholder="例：101" />
                  </div>
                  <div>
                    <Label htmlFor="name">姓名 *</Label>
                    <Input id="name" name="name" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">技能標籤（逗號分隔）</Label>
                  <Input id="tags" name="tags" placeholder="例：廣告投放,行銷策略" />
                </div>
                <div>
                  <Label htmlFor="general">引薦需求（一般）</Label>
                  <Textarea id="general" name="general" />
                </div>
                <div>
                  <Label htmlFor="ideal">引薦需求（理想）</Label>
                  <Textarea id="ideal" name="ideal" />
                </div>
                <div>
                  <Label htmlFor="dream">引薦需求（夢想）</Label>
                  <Textarea id="dream" name="dream" />
                </div>
                <div>
                  <Label htmlFor="services">服務項目（每行一項）</Label>
                  <Textarea id="services" name="services" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="line">LINE</Label>
                    <Input id="line" name="line" placeholder="https://line.me/..." />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" />
                  </div>
                </div>
                <Button type="submit">新增成員</Button>
              </form>
            </CardContent>
          )}
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card key={member.no}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">NO.{member.no}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(editingId === member.no ? null : member.no)}
                    >
                      {editingId === member.no ? "取消" : "編輯"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(member.no)}
                    >
                      刪除
                    </Button>
                  </div>
                </div>
                <h2 className="text-lg font-semibold">{member.name}</h2>
              </CardHeader>
              <CardContent>
                {editingId === member.no ? (
                  <form onSubmit={(e) => handleEdit(member.no, e)} className="space-y-3">
                    <div>
                      <Label>姓名</Label>
                      <Input name="name" defaultValue={member.name} required />
                    </div>
                    <div>
                      <Label>技能標籤</Label>
                      <Input name="tags" defaultValue={member.tags?.join(", ")} />
                    </div>
                    <div>
                      <Label>引薦需求</Label>
                      <Textarea name="general" defaultValue={member.needs?.general} rows={2} />
                    </div>
                    <div>
                      <Label>服務項目</Label>
                      <Textarea name="services" defaultValue={member.services?.join("\n")} rows={3} />
                    </div>
                    <div>
                      <Label>LINE</Label>
                      <Input name="line" defaultValue={member.contact?.line} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input name="email" defaultValue={member.contact?.email} />
                    </div>
                    <Button type="submit" size="sm">儲存</Button>
                  </form>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {(member.tags || []).map((t) => (
                        <span key={t} className="rounded bg-primary/10 px-2 py-1 text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                    {member.needs?.general && (
                      <p className="text-muted-foreground">{member.needs.general}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminEditPage;
