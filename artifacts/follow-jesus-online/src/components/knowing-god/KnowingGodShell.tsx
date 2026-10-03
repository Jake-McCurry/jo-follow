import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { EquipHeader } from "./EquipHeader";
import "@/styles/knowing-god-fonts.css";
import "@/styles/knowing-god-scope.css";
import "@/styles/knowing-god-theme.css";
import "@/styles/knowing-god-intro.css";

/** Feature-only frame: local return link, JO EQUIP header, then the scoped reader. Global site Layout is not used. */
export function KnowingGodShell({ children, warmWrapper = false }: { children: ReactNode; warmWrapper?: boolean }) {
  return (
    <div className="kg-root">
      <div className="kg-local-return kg-no-print">
        <Link href="/" data-testid="link-kg-return-home"><ArrowLeft size={14} className="mr-1 inline align-[-2px]" aria-hidden="true" />Back to Follow Jesus Online</Link>
      </div>
      <div className="kg-equip-navigation"><EquipHeader /></div>
      {warmWrapper
        ? <div className="kg-warm-theme kg-intro-theme-wrapper flex-1">{children}</div>
        : children}
    </div>
  );
}
