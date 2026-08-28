import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShareButton } from "@/components/share-button";
import { ArrowRight, BookOpen, Search, HelpCircle, Compass, PlayCircle } from "lucide-react";
import { getRecentPage, clearRecentPage } from "@/hooks/use-recent-page";

const guideCoverUrl = `${import.meta.env.BASE_URL}guide-cover.png`;

export function Home() {
  const [recentPage, setRecentPage] = useState<string | null>(null);

  useEffect(() => {
    setRecentPage(getRecentPage());
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary"></div>
        
        <div className="container relative z-10 px-5 sm:px-8 mx-auto max-w-4xl text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white text-balance leading-tight">
            Walking with Jesus
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
            Whether you are just beginning, returning, or have followed Him for years, you are welcome here.
          </p>
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
      <div className="container mx-auto px-5 sm:px-8 py-16 max-w-5xl space-y-24">
        
        {/* Where to begin */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Where Would You Like to Begin?</h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <Card className="flex flex-col h-full border-border/60 shadow-sm hover:shadow-md transition-shadow group">
              <CardContent className="pt-8 pb-6 px-6 flex flex-col h-full items-center text-center">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">I Just Began Following Jesus</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">
                  Something real has started. Here are simple next steps to help you understand what happened and walk forward with confidence.
                </p>
                <Button asChild className="w-full group-hover:bg-primary/90">
                  <Link href="/xp/received">
                    Begin Here <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col h-full border-border/60 shadow-sm hover:shadow-md transition-shadow group">
              <CardContent className="pt-8 pb-6 px-6 flex flex-col h-full items-center text-center">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">I’m Returning to Jesus</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">
                  Turning toward Him again matters. These pages will help you renew your walk and move forward with clarity.
                </p>
                <Button asChild className="w-full group-hover:bg-primary/90">
                  <Link href="/xp/rededicated">
                    Welcome Back <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col h-full border-border/60 shadow-sm hover:shadow-md transition-shadow group">
              <CardContent className="pt-8 pb-6 px-6 flex flex-col h-full items-center text-center">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">I Already Walk with Jesus</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">
                  Whether you want to be refreshed in the foundations or find clear ways to help others, you are in the right place.
                </p>
                <Button asChild className="w-full group-hover:bg-primary/90">
                  <Link href="/xp/believer">
                    Continue Growing <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Featured Guide */}
        <section className="bg-secondary rounded-2xl p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
            <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22h20L12 2zm0 4.5l7.5 14h-15L12 6.5z"/>
            </svg>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="shrink-0 flex items-center justify-center w-full md:w-48 mb-6 md:mb-0">
              <img src={guideCoverUrl} alt="The Adventure of Living with Jesus Guide" className="w-full max-w-[200px] md:max-w-full rounded-xl shadow-lg border border-border/20 rotate-[-2deg] hover:rotate-0 transition-transform duration-500" />
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="inline-block px-3 py-1 bg-secondary-foreground/10 text-secondary-foreground text-xs font-bold uppercase tracking-wider rounded-full mb-2">
                Featured Guide
              </div>
              <h2 className="text-3xl font-bold text-secondary-foreground">The Adventure of Living with Jesus</h2>
              <p className="text-secondary-foreground/80 text-lg max-w-xl mx-auto md:mx-0">
                A clear, steady companion for the first steps—and for the journey that follows.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-4 w-full md:w-auto mt-6 md:mt-0">
              <Button asChild size="lg" className="px-8 shadow-md">
                <Link href="/adv-begin-the-adventure">Start the Guide</Link>
              </Button>
              <ShareButton
                title="The Adventure of Living with Jesus"
                text="A clear, steady companion for walking with Jesus."
                label="Send this page to yourself"
                variant="outline"
                className="bg-background/70"
              />
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
            <Link href="/rewatch" className="group flex flex-col items-center p-6 bg-card border border-border/60 rounded-xl hover:bg-muted/50 hover:border-primary/30 transition-all text-center">
              <PlayCircle className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-card-foreground">Rewatch the video</span>
            </Link>
            <Link href="/explore-articles" className="group flex flex-col items-center p-6 bg-card border border-border/60 rounded-xl hover:bg-muted/50 hover:border-primary/30 transition-all text-center">
              <Search className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-card-foreground">Explore Articles</span>
            </Link>
            <Link href="/bible" className="group flex flex-col items-center p-6 bg-card border border-border/60 rounded-xl hover:bg-muted/50 hover:border-primary/30 transition-all text-center">
              <BookOpen className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-card-foreground">Read the Bible</span>
            </Link>
            <a href="https://jesusonline.com" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center p-6 bg-card border border-border/60 rounded-xl hover:bg-muted/50 hover:border-primary/30 transition-all text-center">
              <Compass className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-card-foreground">About JesusOnline</span>
            </a>
          </div>
        </section>

        {/* Support CTA */}
        <section className="bg-primary/5 border border-primary/10 rounded-2xl p-8 text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700 fill-mode-both">
          <h2 className="text-2xl font-bold text-foreground mb-4">We’re Here If You Need Anything</h2>
          <p className="text-muted-foreground mb-8">
            If something is on your mind or you would simply like help finding the right resource, feel free to reach out.
          </p>
          <Button asChild size="lg" variant="outline" className="border-primary/20 hover:bg-primary/10 hover:text-primary">
            <Link href="/message">Send a Message</Link>
          </Button>
        </section>

      </div>
    </Layout>
  );
}
