import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, HelpCircle, BookOpen } from "lucide-react";

export function XPChooserPage() {
  return (
    <Layout>
      <div className="container mx-auto px-5 sm:px-8 py-16 max-w-5xl">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Where Did You Start?</h1>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
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
      </div>
    </Layout>
  );
}
