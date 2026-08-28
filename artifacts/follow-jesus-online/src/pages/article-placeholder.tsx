import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";
import { ScriptureRef } from "@/components/scripture-ref";
import { useTrackRecentPage } from "@/hooks/use-recent-page";
import NotFound from "@/pages/not-found";

export function ArticlePlaceholder() {
  useTrackRecentPage();
  const params = useParams();
  const [location] = useLocation();

  const routeSlug = params.slug || "";
  const articlePrefix = ["adv-", "deeper-", "more-"].find((prefix) =>
    routeSlug.startsWith(prefix)
  );

  if (!articlePrefix) return <NotFound />;

  // Create a readable title from the slug
  const title = routeSlug
    .slice(articlePrefix.length)
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const typeLabel = location.startsWith("/deeper") 
    ? "Deep Dive" 
    : location.startsWith("/more") 
      ? "Resource" 
      : "Guide Chapter";

  return (
    <Layout>
      <div className="container mx-auto px-5 sm:px-8 py-12 md:py-20 max-w-3xl">
        <div className="mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground -ml-4">
            <Link href="/explore-articles">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
            </Link>
          </Button>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-8 md:p-12 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider rounded-full mb-6">
            <BookOpen className="w-3.5 h-3.5" /> {typeLabel}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
            {title}
          </h1>
          
          <div className="flex flex-col items-center justify-center py-16 text-center border-t border-border mt-8">
            <Clock className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">Content Coming Soon</h2>
            <p className="text-muted-foreground max-w-md">
              We are currently preparing this material for you. Please check back later.
            </p>
            <p className="text-sm text-muted-foreground mt-8">
              In the meantime, you can try reading <ScriptureRef reference="John 3:16" /> or <ScriptureRef reference="Romans 8:38-39" />.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
