import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Menu, Search as SearchIcon, X } from "lucide-react";
import logoSrc from "@/assets/jol-logo-white.png";

const EQUIP = "https://equip.jesusonline.com";

type NavLink = { name: string; href: string; local?: boolean };

// Hub pages that do not exist in this site point to the live JO EQUIP site;
// Books and Bible map to the matching local Follow Jesus Online pages.
const navLinks: NavLink[] = [
  { name: "Equip", href: `${EQUIP}/equip` },
  { name: "Categories", href: `${EQUIP}/categories` },
  { name: "Playlists", href: `${EQUIP}/playlists` },
  { name: "Books", href: "/gf/", local: true },
  { name: "Read the Bible", href: "/bible", local: true },
  { name: "More", href: `${EQUIP}/more` },
];

/** React port of the source EquipHeader.astro, used only inside the Knowing God feature. */
export function EquipHeader({ navColor = "#0095ff", tagline }: { navColor?: string; tagline?: string }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a[href]")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", onKey); };
  }, [open]);

  const desktopClass = "relative px-3 py-2 text-[19px] font-bold transition-colors rounded hover:underline underline-offset-4";
  const mobileClass = "text-base font-medium py-3.5 px-6 transition-colors";
  const mobileStyle = { color: "var(--color-text)", borderBottom: "1px solid var(--color-border-soft)" };

  return (
    <header className="equip-header sticky top-0 z-50 w-full" style={{ backgroundColor: navColor, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between py-4 md:py-5 relative">
        <a href={`${EQUIP}/`} className="flex items-center gap-3 md:gap-5 hover:opacity-90 transition-opacity">
          <img src={logoSrc} alt="JesusOnline" className="h-8 md:h-10 w-auto" />
          <span className={tagline ? "flex flex-col xl:flex-row xl:items-center xl:gap-5" : undefined}>
            <span className="text-white font-bold text-xl tracking-wide" style={{ fontFamily: "var(--font-sans)" }}>JO EQUIP</span>
            {tagline && <span className="text-white text-xs sm:text-sm xl:text-base font-medium leading-snug">{tagline}</span>}
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-0.5" aria-label="Primary">
          {navLinks.map(link => link.local
            ? <Link key={link.name} href={link.href} className={desktopClass} style={{ color: "#ffffff" }}>{link.name}</Link>
            : <a key={link.name} href={link.href} className={desktopClass} style={{ color: "#ffffff" }}>{link.name}</a>)}
          <a href={`${EQUIP}/search`} className="ml-2 inline-flex items-center justify-center w-9 h-9 rounded transition-colors hover:bg-white/10" style={{ color: "#ffffff" }} aria-label="Search the library" title="Search">
            <SearchIcon className="w-4 h-4" />
          </a>
        </nav>

        <div className="lg:hidden flex items-center gap-1">
          <a href={`${EQUIP}/search`} className="inline-flex items-center justify-center w-10 h-10 rounded transition-colors hover:bg-white/10" style={{ color: "#ffffff" }} aria-label="Search the library" title="Search">
            <SearchIcon className="w-5 h-5" />
          </a>
          <button ref={trigger} type="button" className="p-2 text-white" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-nav-panel" onClick={() => setOpen(value => !value)}>
            {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        ref={panel}
        id="mobile-nav-panel"
        role="navigation"
        aria-label="Mobile"
        className={`lg:hidden absolute left-0 right-0 top-full w-full flex-col z-40 shadow-lg ${open ? "flex" : "hidden"}`}
        style={{ backgroundColor: "#ffffff", borderTop: `3px solid ${navColor}` }}
      >
        {navLinks.map(link => link.local
          ? <Link key={link.name} href={link.href} className={mobileClass} style={mobileStyle} onClick={() => setOpen(false)}>{link.name}</Link>
          : <a key={link.name} href={link.href} className={mobileClass} style={mobileStyle} onClick={() => setOpen(false)}>{link.name}</a>)}
        <a href="mailto:pastorjon@jesusonline.com" className={mobileClass} style={{ color: "var(--color-text)" }} onClick={() => setOpen(false)}>Contact</a>
      </div>
    </header>
  );
}
