import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, FormEvent } from "react";
import { useLocation } from "wouter";

export function BibleLandingPage() {
  const [searchInput, setSearchInput] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    const str = searchInput.trim();
    const match = str.match(/^((?:[1-3]\s+)?[A-Za-z\s]+)\s+(\d+)(?:\s*:\s*\d+(?:-\d+)?)?$/);
    
    if (match) {
      const b = match[1].trim();
      const c = match[2].trim();
      setLocation(`/bible/${encodeURIComponent(b)}/${c}`);
    } else {
      const fallbackMatch = str.match(/^((?:[1-3]\s+)?[A-Za-z\s]+)$/);
      if (fallbackMatch) {
        setLocation(`/bible/${encodeURIComponent(fallbackMatch[1].trim())}/1`);
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-5 sm:px-8 py-16 md:py-24 max-w-4xl text-center">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <BookOpen className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
          Read the NET Bible
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
          A trustworthy and clear translation to help you explore God's Word.
        </p>

        <Card className="max-w-xl mx-auto mb-16 shadow-lg border-border/60 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4 text-left">Jump to a passage</h2>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="e.g. John 3 or Romans 8" 
                  aria-label="Bible passage or book"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 h-12 text-lg bg-background"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8">
                Read
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto text-left animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400 fill-mode-both">
          <Link href="/bible/John/1" className="group block p-6 bg-card border border-border/60 rounded-xl hover:border-primary/50 transition-colors">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Gospel of John</h3>
            <p className="text-sm text-muted-foreground mb-4">A great place to start reading about the life of Jesus.</p>
            <span className="text-primary text-sm font-semibold flex items-center">
              Start Reading <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          
          <Link href="/bible/Psalms/1" className="group block p-6 bg-card border border-border/60 rounded-xl hover:border-primary/50 transition-colors">
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Psalms</h3>
            <p className="text-sm text-muted-foreground mb-4">Poetry and prayers for every season of life.</p>
            <span className="text-primary text-sm font-semibold flex items-center">
              Start Reading <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
