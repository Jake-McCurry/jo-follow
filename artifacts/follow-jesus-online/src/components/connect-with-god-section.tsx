import { Link } from "wouter"
import { ArrowRight } from "lucide-react"
import { CONNECT_WITH_GOD_RESOURCES } from "@/data/connect-with-god"

export function ConnectWithGodSection() {
  return (
    <section
      id="connect-with-god"
      aria-labelledby="connect-with-god-heading"
      className="scroll-mt-32"
    >
      <div className="mb-8 text-center">
        <h2 id="connect-with-god-heading" className="mb-4 text-3xl font-bold text-foreground">
          Connect with God
        </h2>
        <div className="mx-auto h-1 w-16 rounded-full bg-warm-accent" />
      </div>
      <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
        {CONNECT_WITH_GOD_RESOURCES.map((item, i) => (
          <li key={item.title} className="flex">
            <Link
              href={item.href}
              data-testid={`link-connect-${i}`}
              className="group flex w-full flex-col rounded-xl border border-warm-200 bg-warm-50 p-6 transition-all hover:border-warm-400 hover:bg-warm-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0095FF]"
            >
              <h3 className="mb-2 text-xl font-bold text-card-foreground">{item.title}</h3>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              <span className="inline-flex items-center text-sm font-semibold text-[#004E8A]">
                Open <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
