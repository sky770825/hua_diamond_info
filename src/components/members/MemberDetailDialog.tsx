import type { Member } from "@/data/types";
import { portfolioImageUrl } from "@/api/images";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Wrench, Star, Sparkles, Target, ImagePlus, MessageCircle, Mail, Phone, Share2 } from "lucide-react";

interface MemberDetailDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare?: (member: Member) => void;
}

const NEEDS_CONFIG = [
  { key: "general" as const, label: "一般需求", icon: Target, color: "text-emerald-400" },
  { key: "ideal" as const, label: "理想需求", icon: Star, color: "text-amber-400" },
  { key: "dream" as const, label: "夢幻需求", icon: Sparkles, color: "text-pink-400" },
];

function initials(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase() || "?";
}

const MemberDetailDialog = ({ member, open, onOpenChange, onShare }: MemberDetailDialogProps) => {
  if (!member) return null;
  const portfolio = member.portfolio ?? [];
  const c = member.contact;
  const hasContact = c && (c.line || c.email || c.phone);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl bg-popover border-border max-h-[80vh] xs:max-h-[85vh] overflow-y-auto rounded-xl no-print">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex gap-4 items-start">
            <Avatar className="h-20 w-20 shrink-0 rounded-xl border border-border">
              {member.avatar ? (
                <AvatarImage src={portfolioImageUrl(member.avatar)} alt={member.name} className="object-cover" />
              ) : null}
              <AvatarFallback className="rounded-xl bg-secondary text-muted-foreground text-lg font-medium">
                {initials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                  NO.{member.no}
                </span>
              </div>
              <DialogTitle className="text-2xl font-bold text-foreground">{member.name}</DialogTitle>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {member.tags.map((tag) => (
                  <Badge key={tag} className="text-xs px-2.5 py-0.5 bg-primary/20 text-primary border-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {(hasContact || onShare) && (
            <section className="flex flex-wrap items-center gap-2">
              {c?.line && (
                <Button asChild variant="default" size="sm" className="gap-2">
                  <a href={c.line.startsWith("http") ? c.line : `https://line.me/ti/p/${c.line}`} target="_blank" rel="noopener noreferrer" aria-label={`以 LINE 聯絡 ${member.name}`} data-event="cta:contact:line">
                    <MessageCircle className="w-4 h-4" />
                    LINE
                  </a>
                </Button>
              )}
              {c?.email && (
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <a href={`mailto:${c.email}`} aria-label={`以 Email 聯絡 ${member.name}`} data-event="cta:contact:email">
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                </Button>
              )}
              {c?.phone && (
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <a href={`tel:${c.phone}`} aria-label={`以電話聯絡 ${member.name}`} data-event="cta:contact:phone">
                    <Phone className="w-4 h-4" />
                    電話
                  </a>
                </Button>
              )}
              {onShare && (
                <Button variant="ghost" size="sm" className="gap-2" onClick={() => onShare(member)} aria-label={`分享 ${member.name} 的聯絡資訊`} data-event="cta:share">
                  <Share2 className="w-4 h-4" />
                  分享
                </Button>
              )}
            </section>
          )}

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-semibold text-foreground">引薦需求</h4>
            </div>
            <div className="space-y-4">
              {NEEDS_CONFIG.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="bg-secondary/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className={`text-sm font-medium ${color}`}>{label}</span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">{member.needs[key]}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-semibold text-foreground">服務項目</h4>
            </div>
            <ul className="space-y-3">
              {member.services.map((service, index) => (
                <li key={index} className="flex items-start gap-3 bg-secondary/20 rounded-lg p-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm text-foreground/90 leading-relaxed">{service}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <ImagePlus className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-semibold text-foreground">作品集</h4>
            </div>
            {portfolio.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl overflow-hidden bg-secondary/30 border border-border/50"
                  >
                    <div className="aspect-square">
                      <img
                        src={portfolioImageUrl(item.image)}
                        alt={item.title ? `${member.name} 的作品：${item.title}` : `${member.name} 的作品`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2.5">
                      {item.title && (
                        <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
                      )}
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-border bg-secondary/20 flex flex-col items-center justify-center py-8 gap-2">
                <ImagePlus className="w-10 h-10 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">尚無作品</span>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberDetailDialog;
