import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { GO_FURTHER_BOOKS } from "@/data/go-further-library";
import { ArrowRight, BookOpen } from "lucide-react";
import { useTrackRecentPage } from "@/hooks/use-recent-page";

export function GoFurtherPage() {
  useTrackRecentPage();

  return (
    <Layout>
      <div className="container mx-auto px-5 sm:px-8 py-16 max-w-4xl">
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-primary/80">Go Further</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-8 text-balance">
            The short guide showed you the path. These books walk it with you for a longer stretch.
          </h1>
          <div className="w-12 h-1 bg-primary/20 mx-auto rounded-full mb-8"></div>
          <div className="space-y-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            <p>
              Each one takes a single part of your new life and gives it room—your heart, your identity, the greatness of God, the Spirit’s presence, and the habits of growing up in Christ.
            </p>
            <p>
              You do not have to read them in order. Begin with the title that meets you today.
            </p>
          </div>
        </div>

        <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          {GO_FURTHER_BOOKS.map((book, i) => (
            <Link 
              key={book.slug} 
              href={`/gf/${book.slug}`}
              className="group flex flex-col md:flex-row gap-6 md:gap-8 rounded-2xl bg-card p-6 sm:p-8 md:p-10 border border-border/40 shadow-sm transition-all hover:border-primary/30 hover:shadow-md hover:bg-muted/10 items-start"
            >
              <div className="hidden md:flex shrink-0 w-16 h-20 bg-primary/5 rounded-md border border-primary/10 items-center justify-center text-primary/40 group-hover:bg-primary/10 group-hover:text-primary/60 transition-colors">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col mb-3">
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-card-foreground group-hover:text-primary transition-colors">
                    {book.title}
                  </h2>
                  <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-1">
                    {book.subtitle}
                  </p>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                  {book.desc}
                </p>
                <div className="flex items-center text-primary font-semibold text-sm">
                  Open this book <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
