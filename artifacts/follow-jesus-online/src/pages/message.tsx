import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MessageCircle, ArrowLeft } from "lucide-react";

export function MessagePage() {
  return (
    <Layout>
      <div className="container mx-auto px-5 sm:px-8 py-16 md:py-24 max-w-3xl flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8">
          <MessageCircle className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          Send a Message
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-xl leading-relaxed">
          We are preparing a way for you to reach out. Check back soon. 
          If you need immediate assistance, please visit our main ministry site.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button asChild size="lg" className="px-8">
            <a href="https://jesusonline.com" target="_blank" rel="noopener noreferrer">
              Visit JesusOnline Ministries
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-8">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to Start
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
