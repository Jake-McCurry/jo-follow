import { useEffect, useState } from "react";
import { Link } from "wouter";
import { BibleStartDialog } from "@/components/bible-start-dialog";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShareButton } from "@/components/share-button";
import { ArrowRight, BookOpen, Search, HelpCircle, Compass, Download, PlayCircle } from "lucide-react";
import { getRecentPage, clearRecentPage } from "@/hooks/use-recent-page";

const guideCoverUrl = `${import.meta.env.BASE_URL}guide-cover.png`;
const guideDownloadUrl = `${import.meta.env.BASE_URL}adventure-guide.pdf`;

export function Home() {
  const [recentPage, setRecentPage] = useState<string | null>(null);

  useEffect(() => {
    setRecentPage(getRecentPage());
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#006BB3] py-8 text-white md:py-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#007AE0]/30 to-[#004E8A]/35"></div>
        
        <div className="container relative z-10 px-5 sm:px-8 mx-auto max-w-4xl text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white text-balance leading-tight">
            Walking with Jesus
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Whether you are just beginning, returning, or have followed Him for years, you are welcome here.
          </p>
        </div>
      </section>

      <section className="border-b border-primary/15 bg-primary/10 py-2">
        <div className="container mx-auto flex max-w-4xl justify-center px-5 sm:px-8">
          <ShareButton
            title="Walking with Jesus"
            text="Whether you are just beginning, returning, or have followed Him for years, you are welcome here."
            label="Send this page to yourself"
            variant="outline"
          />
        </div>
      </section>

      {/* Resume Banner */}
      {recentPage && (
        <div className="bg-secondary text-secondary-foreground py-3 border-b border-secondary-foreground/10">
          <div className="container px-5 sm:px-8 mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <span className="font-medium">You have a resource in progress.</span>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="default" className="h-8">
                <Link href={recentPage}>Continue</Link>
              </Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={() => { clearRecentPage(); setRecentPage(null); }}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto max-w-5xl space-y-8 px-5 py-8 sm:px-8 md:space-y-10 md:py-10">
        
        {/* Where to begin */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Where Would You Like to Begin?</h2>
            <div className="w-16 h-1 bg-warm-accent mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <Card className="group flex h-full flex-col border-warm-200 bg-warm-50 shadow-sm transition-all hover:border-warm-400 hover:bg-warm-100 hover:shadow-md">
              <CardContent className="pt-8 pb-6 px-6 flex flex-col h-full items-center text-center">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-warm-100 text-warm-700 transition-transform group-hover:scale-110">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">I Just Began Following Jesus</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">
                  Something real has started. Here are simple next steps to help you understand what happened and walk forward with confidence.
                </p>
                <Button asChild className="w-full group-hover:bg-primary/90">
                  <Link href="/xp/received?journey=received&entry=landing&step=xp">
                    Begin Here <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group flex h-full flex-col border-warm-200 bg-warm-50 shadow-sm transition-all hover:border-warm-400 hover:bg-warm-100 hover:shadow-md">
              <CardContent className="pt-8 pb-6 px-6 flex flex-col h-full items-center text-center">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-warm-100 text-warm-700 transition-transform group-hover:scale-110">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">I’m Returning to Jesus</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">
                  Turning toward Him again matters. These pages will help you renew your walk and move forward with clarity.
                </p>
                <Button asChild className="w-full group-hover:bg-primary/90">
                  <Link href="/xp/rededicated?journey=rededicated&entry=landing&step=xp">
                    Welcome Back <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group flex h-full flex-col border-warm-200 bg-warm-50 shadow-sm transition-all hover:border-warm-400 hover:bg-warm-100 hover:shadow-md">
              <CardContent className="pt-8 pb-6 px-6 flex flex-col h-full items-center text-center">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-warm-100 text-warm-700 transition-transform group-hover:scale-110">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">I Already Walk with Jesus</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">
                  Whether you want to be refreshed in the foundations or find clear ways to help others, you are in the right place.
                </p>
                <Button asChild className="w-full group-hover:bg-primary/90">
                  <Link href="/xp/believer?journey=believer&entry=landing&step=xp">
                    Continue Growing <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Featured Guide */}
        <section className="relative overflow-hidden rounded-2xl bg-secondary p-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both md:p-10">
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="shrink-0 flex items-center justify-center w-full md:w-48 mb-6 md:mb-0">
              <img src={guideCoverUrl} alt="The Adventure of Living with Jesus Guide" className="w-full max-w-[200px] md:max-w-full rounded-xl shadow-lg border border-border/20 rotate-[-2deg] hover:rotate-0 transition-transform duration-500" />
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="inline-block px-3 py-1 bg-warm-accent/15 text-warm-accent text-xs font-bold uppercase tracking-wider rounded-full mb-2">
                Featured Guide
              </div>
              <h2 className="text-3xl font-bold text-secondary-foreground">The Adventure of Living with Jesus</h2>
              <p className="text-secondary-foreground/80 text-lg max-w-xl mx-auto md:mx-0">
                A clear, steady companion for the first steps—and for the journey that follows.
              </p>
            </div>
            <div className="mt-6 flex w-full shrink-0 flex-col gap-2 md:mt-0 md:w-auto">
              <Button asChild size="lg" variant="warm" className="px-8 font-bold shadow-md">
                <Link href="/adv/begin-the-adventure">Start the Guide</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href={guideDownloadUrl} download="The-Adventure-of-Living-with-Jesus.pdf">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* More Ways to Explore */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">More Ways to Explore</h2>
            <p className="text-muted-foreground">You don’t have to figure everything out at once. Take the next step when you’re ready.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/rewatch" className="group flex flex-col items-center rounded-xl border border-warm-200 bg-warm-50 p-6 text-center transition-all hover:border-warm-400 hover:bg-warm-100">
              <PlayCircle className="mb-4 h-8 w-8 text-warm-700 transition-transform group-hover:scale-110" />
              <span className="font-semibold text-card-foreground">Rewatch the video</span>
            </Link>
            <Link href="/gf/" className="group flex flex-col items-center rounded-xl border border-warm-200 bg-warm-50 p-6 text-center transition-all hover:border-warm-400 hover:bg-warm-100">
              <Search className="mb-4 h-8 w-8 text-warm-700 transition-transform group-hover:scale-110" />
              <span className="font-semibold text-card-foreground">Go Further</span>
            </Link>
            <BibleStartDialog>
              <button type="button" className="group flex w-full flex-col items-center rounded-xl border border-warm-200 bg-warm-50 p-6 text-center transition-all hover:border-warm-400 hover:bg-warm-100">
                <BookOpen className="mb-4 h-8 w-8 text-warm-700 transition-transform group-hover:scale-110" />
                <span className="font-semibold text-card-foreground">Read the Bible</span>
              </button>
            </BibleStartDialog>
            <a href="https://jesusonline.com" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center rounded-xl border border-warm-200 bg-warm-50 p-6 text-center transition-all hover:border-warm-400 hover:bg-warm-100">
              <Compass className="mb-4 h-8 w-8 text-warm-700 transition-transform group-hover:scale-110" />
              <span className="font-semibold text-card-foreground">About JesusOnline</span>
            </a>
          </div>
        </section>

        {/* Support CTA */}
        <section className="mx-auto max-w-3xl rounded-2xl border border-primary/10 bg-primary/5 p-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700 fill-mode-both md:p-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">We’re Here If You Need Anything</h2>
          <p className="text-muted-foreground mb-8">
            If something is on your mind or you would simply like help finding the right resource, feel free to reach out.
          </p>
          <Button asChild size="lg" variant="warm" className="shadow-md">
            <Link href="/message">Send a Message</Link>
          </Button>
        </section>

      </div>
    </Layout>
  );
}
