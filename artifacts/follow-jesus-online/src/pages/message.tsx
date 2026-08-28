import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { ArrowLeft, Mail, Send } from "lucide-react";

export function MessagePage() {
  return (
    <Layout>
      <div className="container mx-auto px-5 sm:px-8 py-16 md:py-24 max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="pt-2">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-7">
              <Mail className="w-8 h-8" aria-hidden="true" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-5">
              Send a Message
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-7">
              Have a question about following Jesus or one of these resources?
              We would be glad to hear from you.
            </p>

            <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-8">
              Share your email so the JesusOnline team can receive your message
              and respond when appropriate.
            </p>

            <Button asChild variant="outline" className="px-6">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" /> Return to Start
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm">
            <form
              action="https://jesusonline.us1.list-manage.com/subscribe/post?u=c02949f5de137184b156da9bc&amp;id=e06ba0649d&amp;f_id=00a087e5f0"
              method="post"
              id="mc-embedded-subscribe-form"
              name="mc-embedded-subscribe-form"
              target="_blank"
              className="space-y-6"
            >
              <div>
                <label htmlFor="mce-EMAIL" className="block text-sm font-medium text-foreground mb-2">
                  Email Address <span className="text-primary" aria-hidden="true">*</span>
                  <span className="sr-only"> required</span>
                </label>
                <input
                  type="email"
                  name="EMAIL"
                  id="mce-EMAIL"
                  required
                  autoComplete="email"
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                />
              </div>

              <div>
                <label htmlFor="mce-MMERGE25" className="block text-sm font-medium text-foreground mb-2">
                  Message <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Textarea
                  name="MMERGE25"
                  id="mce-MMERGE25"
                  rows={7}
                  className="min-h-[160px] bg-background"
                />
              </div>

              <input type="hidden" name="tags" value="5798254" />
              <div aria-hidden="true" className="absolute left-[-5000px]">
                <label htmlFor="mce-c02949f5de137184b156da9bc-e06ba0649d">
                  Leave this field blank
                </label>
                <input
                  type="text"
                  name="b_c02949f5de137184b156da9bc_e06ba0649d"
                  id="mce-c02949f5de137184b156da9bc-e06ba0649d"
                  tabIndex={-1}
                  defaultValue=""
                />
              </div>

              <Button type="submit" name="subscribe" value="Send Message" size="lg" className="w-full sm:w-auto px-8">
                <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                Send Message
              </Button>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Required fields are marked with an asterisk. Your message is
                sent through JesusOnline&apos;s Mailchimp form.
              </p>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
