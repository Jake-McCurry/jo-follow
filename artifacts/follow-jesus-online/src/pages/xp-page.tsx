import { useRoute } from "wouter";
import { Layout } from "@/components/layout";
import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlayCircle, MessageCircle, ArrowRight, Heart } from "lucide-react";
import { useTrackRecentPage } from "@/hooks/use-recent-page";
import NotFound from "@/pages/not-found";

const guideCoverUrl = `${import.meta.env.BASE_URL}guide-cover.png`;

type XPType = "received" | "rededicated" | "believer" | "did-not-pray";

const XP_ARTICLE_LINKS: Partial<Record<XPType, Record<string, string>>> = {
  received: {
    "How do I know this is real?": "more-received-how-do-i-know-this-is-real",
    "I’m afraid…": "more-received-i-am-afraid",
    "How should I handle my current relationships?": "more-received-how-should-i-handle-my-current-relationships",
    "What do I do now?": "more-received-what-do-i-do-now",
    "I have questions about church": "more-received-i-have-questions-about-church",
    "I want to know Jesus more": "more-received-i-want-to-know-jesus-better",
    "More questions?": "more-received-other-questions",
  },
  rededicated: {
    "How do I start walking closely with Him again?": "more-returning-how-do-i-start-walking-closely-with-him-again",
    "I feel ashamed or distant…": "more-returning-i-feel-ashamed-or-distant",
    "How should I handle the relationships and patterns I left behind?": "more-returning-how-should-i-handle-the-relationships-and-patterns-i-left-behind",
    "What practical steps can I take right now?": "more-returning-what-practical-steps-can-i-take-right-now",
    "I have questions about getting connected again": "more-returning-i-have-questions-about-getting-connected-again",
    "I want to know Jesus more deeply": "more-returning-i-want-to-know-jesus-more-deeply",
    "More questions?": "more-returning-other-questions",
  },
};

const XP_CONTENT: Record<XPType, {
  title: string;
  subtitle?: string;
  intro: string;
  guideText: string;
  questionsTitle: string;
  questions: string[];
  contactText: string;
}> = {
  "received": {
    title: "Something Real Has Begun",
    intro: "You just took a step of faith. What happened is real. These simple next steps will help you understand it more clearly and begin walking forward with confidence.",
    guideText: "In the video you heard that Jesus offers a new life. This guide helps you see what that new life looks like in ordinary days—clearly, gently, and at your own pace.",
    questionsTitle: "You’re Not the Only One Wondering…",
    questions: [
      "How do I know this is real?",
      "I’m afraid…",
      "How should I handle my current relationships?",
      "What do I do now?",
      "I have questions about church",
      "I want to know Jesus more",
      "More questions?"
    ],
    contactText: "If a question or concern is on your heart, you’re welcome to share it."
  },
  "rededicated": {
    title: "Welcome Back",
    intro: "You just took a meaningful step. Turning toward Jesus again matters. What you did is real, and He receives you with open arms. These simple next steps will help you renew your walk with Him and move forward with clarity and confidence.",
    guideText: "In the video you were reminded of the life Jesus offers. This guide will help you return to the daily reality of walking with Him—steadily and sincerely.",
    questionsTitle: "You’re Not the Only One Feeling This Way…",
    questions: [
      "How do I start walking closely with Him again?",
      "I feel ashamed or distant…",
      "How should I handle the relationships and patterns I left behind?",
      "What practical steps can I take right now?",
      "I have questions about getting connected again",
      "I want to know Jesus more deeply",
      "More questions?"
    ],
    contactText: "If something is weighing on you or you simply want help taking the next step, you’re welcome to share it."
  },
  "believer": {
    title: "Good to See You Here",
    intro: "Thank you for watching. Since you already walk with Jesus, we’re glad these truths could encourage you today. If you would like to keep growing or simply be refreshed in the basics of walking with Him, this short guide is a clear and steady place to continue.",
    guideText: "Many believers find it helpful to return to these foundational truths from time to time—or to share them with someone who is just beginning.",
    questionsTitle: "Ways You Might Use These Resources",
    questions: [
      "Refresh the foundations of your own walk with Jesus",
      "Find clear language for conversations with others",
      "Help someone who is new in their faith",
      "Revisit a specific area (identity, prayer, Scripture, purpose)",
      "More options?"
    ],
    contactText: "If you have a question or would like help finding the right resource, feel free to reach out."
  },
  "did-not-pray": {
    title: "Thanks for Watching",
    subtitle: "We’re glad you took the time to hear this message. Whether you are still considering Jesus, have questions, or already walk with Him, you are welcome here.",
    intro: "If you would like to explore further, this short guide offers a clear and steady next step—at whatever pace feels right for you.",
    guideText: "You can also explore it to read later or share with someone else.",
    questionsTitle: "Common Next Steps",
    questions: [
      "I have questions about what I heard",
      "I’d like to understand the Christian message more clearly",
      "I already follow Jesus and want to go deeper",
      "I want to help someone else explore these things",
      "More options?"
    ],
    contactText: "If something is on your mind or you would simply like help finding the right resource, feel free to reach out."
  }
};

export function XPPage() {
  const [match, params] = useRoute("/xp/:type");
  useTrackRecentPage();
  
  if (!match || !params?.type) return <NotFound />;
  
  const type = params.type as XPType;
  const content = XP_CONTENT[type];
  
  if (!content) return <NotFound />;

  const videoUrl = "https://www.youtube.com/watch?v=psw_5rn9WFY&list=PLyI_AdjR33H3yAO7F9M4tJoq9EwU7Afmc&index=2";

  return (
    <Layout>
      <div className="container mx-auto px-5 sm:px-8 py-12 md:py-20 max-w-4xl">
        
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-6"></div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            {content.title}
          </h1>
          {content.subtitle && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              {content.subtitle}
            </p>
          )}
          
          <a 
            href={videoUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-semibold text-lg hover:text-primary/80 transition-colors group"
          >
            <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Watch this video: How God sees you now
            <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Main Content Area */}
        <div className="bg-card border border-border/60 rounded-2xl p-8 md:p-12 shadow-sm mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start mb-8">
            <div className="shrink-0 w-full max-w-[240px] md:w-64">
              <img src={guideCoverUrl} alt="The Adventure of Living with Jesus" className="w-full rounded-xl shadow-md border border-border/30 rotate-[-1deg]" />
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none flex-1">
              <p className="text-xl leading-relaxed text-card-foreground/90 font-medium mb-8">
                {content.intro}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button asChild size="lg" className="text-base h-14 px-8">
                  <Link href="/adv-begin-the-adventure">
                    Begin This Short Guide
                  </Link>
                </Button>
              </div>
              
              <p className="text-muted-foreground">
                {content.guideText}
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
            <span>Want to come back easily later?</span>
            <ShareButton 
              title={content.title} 
              text={`I found this helpful: ${content.title} - Follow Jesus Online`}
              label="Save or Send this page" 
              variant="secondary"
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {/* Questions / Next Steps */}
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">{content.questionsTitle}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {content.questions.map((q, i) => (
              <div key={i} className="bg-background border border-border/50 rounded-xl p-6 flex items-start gap-4">
                <Heart className="w-5 h-5 text-primary/40 shrink-0 mt-0.5" />
                {XP_ARTICLE_LINKS[type]?.[q] ? (
                  <Link
                    href={`/${XP_ARTICLE_LINKS[type][q]}`}
                    className="text-left font-medium text-foreground/90 underline decoration-primary/25 underline-offset-4 transition-colors hover:text-primary"
                  >
                    {q}
                  </Link>
                ) : (
                  <span className="text-foreground/90 font-medium">{q}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Support CTA */}
        <div className="bg-secondary text-secondary-foreground rounded-2xl p-8 md:p-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
          <MessageCircle className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">We’re Here If You Need Anything</h2>
          <p className="text-lg opacity-90 max-w-xl mx-auto mb-8">
            {content.contactText}
          </p>
          <Button asChild size="lg" variant="default" className="shadow-md">
            <Link href="/message">Send a Message</Link>
          </Button>
        </div>

      </div>
    </Layout>
  );
}
