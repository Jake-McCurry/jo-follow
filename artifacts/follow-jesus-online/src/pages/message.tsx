import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { ArrowLeft, Mail, Send } from "lucide-react";

export function MessagePage() {
  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-5 py-8 animate-in fade-in slide-in-from-bottom-8 duration-700 sm:px-8 md:py-10">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="pt-2">
            <div className="w-16 h-16 bg-warm-100 text-warm-700 rounded-full flex items-center justify-center mb-7">
              <Mail className="w-8 h-8" aria-hidden="true" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-navy mb-5">
              Send a Message
            </h1>

            <p className="text-lg text-slate max-w-xl leading-relaxed mb-7">
              Have a question about following Jesus or one of these resources?
              We would be glad to hear from you.
            </p>

            <p className="text-sm text-slate max-w-md leading-relaxed mb-8">
              Share your email so the JesusOnline team can receive your message
              and respond when appropriate.
            </p>

            <Button asChild variant="outline" className="px-6 border-border-control text-navy hover:bg-warm-50">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" /> Return to Start
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border-soft bg-white p-6 sm:p-8 shadow-sm">
            <form
              action="https://jesusonline.us1.list-manage.com/subscribe/post?u=c02949f5de137184b156da9bc&amp;id=e06ba0649d&amp;f_id=00a087e5f0"
              method="post"
              id="mc-embedded-subscribe-form"
              name="mc-embedded-subscribe-form"
              target="_blank"
              className="space-y-6"
            >
              <div>
                <label htmlFor="mce-EMAIL" className="block text-sm font-bold text-navy mb-2">
                  Email Address <span className="text-warm-700" aria-hidden="true">*</span>
                  <span className="sr-only"> required</span>
                </label>
                <input
                  type="email"
                  name="EMAIL"
                  id="mce-EMAIL"
                  required
                  autoComplete="email"
                  className="flex h-11 w-full rounded-md border border-border-control bg-white px-3 py-2 text-base ring-offset-background placeholder:text-slate/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 text-navy"
                />
              </div>

              <div>
                <label htmlFor="mce-MMERGE25" className="block text-sm font-bold text-navy mb-2">
                  Message <span className="text-slate font-normal">(optional)</span>
                </label>
                <Textarea
                  name="MMERGE25"
                  id="mce-MMERGE25"
                  rows={7}
                  className="min-h-[160px] bg-white border-border-control focus-visible:ring-brand text-navy"
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

              <Button type="submit" name="subscribe" value="Send Message" size="lg" className="w-full sm:w-auto px-8" variant="warm">
                <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                Send Message
              </Button>
              <p className="text-xs leading-relaxed text-slate">
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
