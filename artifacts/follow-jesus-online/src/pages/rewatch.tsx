import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const videos = [
  { id: "psw_5rn9WFY", title: "How God Sees You Now" },
  { id: "XB7wGTnYeaE", title: "The Gift of Heaven" },
  { id: "SEg4a2xaJyw", title: "Jesus’ Resurrection and You" },
];

export function RewatchPage() {
  
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
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Rewatch the Videos</h1>
          <div className="w-16 h-1 bg-warm-accent mx-auto rounded-full"></div>
        </div>

        <div className="space-y-12">
          {videos.map((video, index) => (
            <section key={video.id} aria-labelledby={`video-title-${video.id}`}>
              <h2 id={`video-title-${video.id}`} className="mb-4 text-2xl font-bold text-navy sm:text-3xl">
                {video.title}
              </h2>
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-warm-200 aspect-video w-full">
                <iframe
                  data-testid={`video-${video.id}`}
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${video.id}?rel=0`}
                  title={video.title}
                  loading={index === 0 ? "eager" : "lazy"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}
