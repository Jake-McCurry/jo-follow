import { Link } from "wouter"
import { CONNECT_WITH_GOD_RESOURCES } from "@/data/connect-with-god"

const resourceGroups = [0, 3, 6].map((start) =>
  CONNECT_WITH_GOD_RESOURCES.slice(start, start + 3),
)

export function ConnectWithGodSection() {
  return (
    <section
      id="connect-with-god"
      aria-labelledby="connect-with-god-heading"
      className="scroll-mt-32"
    >
      <div className="mb-6 text-center">
        <h2 id="connect-with-god-heading" className="mb-4 text-3xl font-bold text-foreground">
          Connect with God
        </h2>
        <div className="mx-auto h-1 w-16 rounded-full bg-warm-accent" />
      </div>
      <ul className="grid gap-3 md:grid-cols-3 md:gap-6">
        {resourceGroups.map((resources, groupIndex) => (
          <li key={resources[0].title} className="overflow-hidden rounded-xl border border-warm-200 bg-warm-50">
            <ul className="divide-y divide-warm-200">
              {resources.map((item, itemIndex) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    data-testid={`link-connect-${groupIndex * 3 + itemIndex}`}
                    className="group block px-4 py-3 transition-colors hover:bg-warm-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0095FF] sm:px-5 sm:py-4"
                  >
                    <h3 className="text-base font-bold leading-snug text-card-foreground group-hover:underline group-hover:underline-offset-4 sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-snug text-muted-foreground">
                      {item.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}
