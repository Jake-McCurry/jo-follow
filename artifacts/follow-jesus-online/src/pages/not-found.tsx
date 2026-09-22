import { Layout } from "@/components/layout";
import { Card, CardContent } from '@/components/ui/card';
import { Compass } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex min-h-[70vh] w-full items-center justify-center">
        <Card className="w-full max-w-md mx-4 border-warm-200 bg-white shadow-sm">
          <CardContent className="pt-8 text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-warm-100 text-warm-700 rounded-full flex items-center justify-center mb-6">
              <Compass className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
              Page Not Found
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We couldn't find the page you were looking for. It might have been moved or removed.
            </p>
            <Button asChild variant="warm" className="w-full">
              <Link href="/">Return to Start</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
