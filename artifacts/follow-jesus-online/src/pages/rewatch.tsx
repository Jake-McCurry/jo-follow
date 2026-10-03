import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { REWATCH_VIDEOS } from "@/data/rewatch-videos";
import { ArrowLeft } from "lucide-react";

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
          {REWATCH_VIDEOS.map((video, index) => (
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
              <Accordion
                type="single"
                collapsible
                className="mt-4 rounded-xl border border-warm-200 bg-warm-50 px-5 sm:px-6"
              >
                <AccordionItem value={`transcript-${video.id}`} className="border-0">
                  <AccordionTrigger
                    aria-label={`Read the transcript of ${video.title}`}
                    className="gap-4 py-5 text-base font-semibold text-navy"
                  >
                    Read the transcript
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    {video.transcript ? (
                      <div className="space-y-5 text-base leading-relaxed text-slate sm:text-lg">
                        {video.transcript.blocks.map((block, blockIndex) =>
                          block.kind === "heading" ? (
                            <h3 key={blockIndex} className="pt-3 text-lg font-bold text-navy sm:text-xl">
                              {block.text}
                            </h3>
                          ) : block.kind === "list" ? (
                            <p key={blockIndex} className="pl-5">• {block.text}</p>
                          ) : (
                            <p key={blockIndex}>{block.text}</p>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-base leading-relaxed text-slate">
                        The transcript for this video is not available on this page yet.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}
