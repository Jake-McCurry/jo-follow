import { Link, useLocation } from "wouter"
import { TOPIC_MENU_LINKS } from "@/data/connect-with-god"

export function TopicMenuBar() {
  const [location] = useLocation()
  return (
    <nav
      aria-label="Topics"
      className="border-b border-border/40 bg-white"
      data-testid="nav-topics"
    >
      <ul
        className="mx-auto flex max-w-[1800px] snap-x snap-proximity overflow-x-auto overscroll-x-contain px-3 [scrollbar-width:none] sm:px-6 md:justify-center [&::-webkit-scrollbar]:hidden"
        tabIndex={-1}
      >
        {TOPIC_MENU_LINKS.map((item) => {
          const active = location === item.href || location === item.href.replace(/\/$/, "")
          return (
            <li key={item.label} className="shrink-0 snap-start">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                data-testid={`link-topic-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`block whitespace-nowrap px-3 py-3 text-sm font-semibold text-[#004E8A] transition-colors hover:bg-blue-50 hover:text-[#003A66] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0095FF] sm:px-4 sm:text-base ${
                  active ? "border-b-2 border-[#0095FF]" : "border-b-2 border-transparent"
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
