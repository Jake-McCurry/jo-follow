import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTrackRecentPage } from "@/hooks/use-recent-page";
import { ArrowLeft } from "lucide-react";

export function RewatchPage() {
  useTrackRecentPage();
  
  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-5 py-8 sm:px-8 md:py-10">
        <div className="mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground -ml-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to start
            </Link>
          </Button>
        </div>

        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">Rewatch the Video</h1>
          <div className="w-16 h-1 bg-warm-accent mx-auto rounded-full"></div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-border-soft aspect-video w-full animate-in fade-in zoom-in-95 duration-700 delay-150 fill-mode-both">
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/psw_5rn9WFY?rel=0" 
            title="How God sees you now" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </div>
    </Layout>
  );
}
