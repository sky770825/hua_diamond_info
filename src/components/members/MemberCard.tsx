import type { Member } from "@/data/types";
import { portfolioImageUrl } from "@/api/images";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Wrench, ImagePlus } from "lucide-react";

interface MemberCardProps {
  member: Member;
  onClick: () => void;
  onTagClick?: (tag: string) => void;
}

function initials(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase() || "?";
}

const MemberCard = ({ member, onClick, onTagClick }: MemberCardProps) => {
  return (
    <article
      onClick={onClick}
      className="glass-card glass-card-hover rounded-xl overflow-hidden cursor-pointer group animate-fade-in flex flex-col touch-manipulation focus-ring"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* 形象照橫幅：卡片寬 4:3，放大且為視覺焦點 */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-secondary shrink-0">
        {member.avatar ? (
          <img
            src={portfolioImageUrl(member.avatar)}
            alt={member.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/80 text-2xl font-semibold bg-gradient-to-br from-secondary to-secondary/70">
            {initials(member.name)}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0">
        <header className="mb-2 sm:mb-3">
          <span className="text-xs font-mono text-muted-foreground">NO.{member.no}</span>
          <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors mt-0.5 truncate">
            {member.name}
          </h3>
        </header>

        <section className="mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Lightbulb className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-muted-foreground">引薦需求</span>
          </div>
          <p className="text-sm text-foreground/90 line-clamp-2 leading-relaxed pl-6">
            {member.needs.general}
          </p>
        </section>

        <section className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Wrench className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-muted-foreground">服務項目</span>
          </div>
          <ul className="space-y-1.5 pl-6">
            {member.services.slice(0, 3).map((service, index) => (
              <li key={index} className="text-sm text-foreground/80 flex items-start gap-2">
                <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="line-clamp-1">{service}</span>
              </li>
            ))}
            {member.services.length > 3 && (
              <li className="text-xs text-muted-foreground pl-3.5">
                還有 {member.services.length - 3} 項服務...
              </li>
            )}
          </ul>
        </section>

        <footer className="flex flex-wrap gap-1.5 items-center mt-auto">
          {member.tags.slice(0, 4).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-secondary/80 text-secondary-foreground border-0 hover:bg-secondary cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(tag);
              }}
            >
              {tag}
            </Badge>
          ))}
          {member.tags.length > 4 && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 border-border text-muted-foreground">
              +{member.tags.length - 4}
            </Badge>
          )}
          {(member.portfolio?.length ?? 0) > 0 && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 border-primary/50 text-primary ml-auto">
              <ImagePlus className="w-3 h-3 mr-1" />
              {member.portfolio!.length} 件作品
            </Badge>
          )}
        </footer>

        <div className="mt-4 pt-3 border-t border-border/50 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-muted-foreground">點擊查看完整資訊 →</span>
        </div>
      </div>
    </article>
  );
};

export default MemberCard;
