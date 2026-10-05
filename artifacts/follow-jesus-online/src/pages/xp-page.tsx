import { useRoute } from "wouter";
import { Layout } from "@/components/layout";
import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlayCircle, MessageCircle, Heart } from "lucide-react";
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
  believer: {
    "Refresh the foundations of your own walk with Jesus": "more-believer-refresh-the-foundation",
    "Find clear language for conversations with others": "more-believer-find-clear-language-for-conversations-with-others",
    "Help someone who is new in their faith": "more-believer-help-someone-new-in-faith",
    "Revisit a specific area (identity, prayer, Scripture, purpose)": "more-believer-revisit-a-specific-area-of-spiritual-growth",
    "More options?": "more-believer-more-options",
  },
  "did-not-pray": {
    "I have questions about what I heard": "more-no-decision-i-have-questions-about-what-i-heard",
    "I’d like to understand the Christian message more clearly": "more-no-decision-id-like-to-understand-the-christian-message-more-clearly",
    "I already follow Jesus and want to go deeper": "more-no-decision-i-already-follow-jesus-and-want-to-go-deeper",
    "I want to help someone else explore these things": "more-no-decision-i-want-to-help-someone-else-explore-these-things",
    "More options?": "more-no-decision-more-options",
  },
};

const XP_CONTENT: Record<XPType, {
  title: string;
  subtitle?: string;
  intro: string | string[];
  guideHeading?: string;
  guideLabel?: string;
  guideText?: string | string[];
  questionsTitle: string;
  questions: string[];
  contactText: string;
  contactHeading?: string;
}> = {
  "received": {
    title: "He heard you. You are His.",
    intro: "You asked Jesus to come into your heart. And He did. What happened is real. God already sees you as His child — forgiven, belonging, and secure.",
    guideHeading: "Something real has begun.",
    guideText: [
      "When you invited Jesus Christ into your life, you entered a personal relationship with God that lasts forever. He now lives within you, accepting you as you are and transforming your life as you walk with Him.",
      "This relationship isn't based on fleeting feelings; Christ's presence is constant. The days ahead may be unpredictable, but His Spirit is always at work within you, equipping you for your journey.",
      "This short guide will help you understand who you are now, the Spirit in you, moving forward, and living purposefully. Take the next step.",
    ],
    guideLabel: "Read what just happened — 2 minutes",
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
    title: "Welcome back. He never left.",
    intro: [
      "You just turned toward Jesus again. He receives you. You do not have to earn your way back, and you did not lose your place as His child while you were away.",
      "If you feel ashamed or far off, that feeling is not the verdict. He already knows where you have been. Coming back is the step that matters.",
    ],
    guideHeading: "You are still His",
    guideText: [
      "Turning back to Jesus is not about obtaining a second salvation; it's a return home, like the prodigal son. The Father welcomed him back without requiring reacceptance. Christ doesn't abandon His own. Instead, confession is simply the way to walk back into the light, not a means of being readopted.",
      "You don't need to fix everything at once or feel close to Him before you are. Just take the next faithful step. He welcomes you back with open arms, regardless of your past.",
    ],
    guideLabel: "How to walk with Him again — 2 minutes",
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
    title: "You already belong to Him.",
    intro: "You said you already trust Jesus. God already sees you as His child — forgiven, belonging, and accepted.",
    guideHeading: "Already His",
    guideText: [
      "If you have trusted Christ, you are not a guest in God’s family. You are His child.",
      "Many believers live as if they were still on trial — useful when they do well, distant when they fail. That is not how the Father sees you. Christ has already settled the case. Your part now is to walk in what is already true.",
    ],
    guideLabel: "How to walk with Him again — 2 minutes",
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
    title: "You do not have to decide today.",
    intro: [
      "You watched. You did not pray. That is an honest answer, and it is all right to still be unsure.",
      "Jesus does not ask you to pretend. If you have a question, start there. If you want to look again at who He is, that door is open.",
    ],
    contactHeading: "We’re here to answer your questions.",
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
  
  if (!match || !params?.type) return <NotFound />;
  
  const type = params.type as XPType;
  const content = XP_CONTENT[type];
  
  if (!content) return <NotFound />;
  const hasGuide = Boolean(content.guideHeading);
  const introParagraphs = Array.isArray(content.intro) ? content.intro : [content.intro];
  const guideParagraphs = Array.isArray(content.guideText) ? content.guideText : content.guideText ? [content.guideText] : [];

  const inboundParams = new URLSearchParams(
    typeof window === "undefined" ? "" : window.location.search,
  );
  const journey = type;
  const entry = inboundParams.get("entry") || "direct";
  const articleHref = (slug: string) => {
    const journeyParams = new URLSearchParams({
      journey,
      entry,
      from: "xp",
      step: "faq",
    });

    return `/${slug}?${journeyParams.toString()}`;
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-5 py-8 sm:px-8 md:py-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-1 bg-warm-accent mx-auto rounded-full mb-6"></div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            {content.title}
          </h1>
          {content.subtitle && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              {content.subtitle}
            </p>
          )}
          
          <div className="space-y-5 max-w-2xl mx-auto text-xl leading-relaxed text-muted-foreground">
            {introParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        </div>

        {/* Main Content Area */}
        {hasGuide && <div className="bg-white border border-warm-200 rounded-2xl p-8 md:p-12 shadow-sm mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start mb-8">
            <div className="shrink-0 w-full max-w-[240px] md:w-64">
              <img src={guideCoverUrl} alt="The Adventure of Living with Jesus" className="w-full rounded-xl shadow-md border border-border/30 rotate-[-1deg]" />
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-5">{content.guideHeading}</h2>
              {guideParagraphs.map((paragraph, index) => (
                <p key={index} className="text-lg leading-relaxed text-card-foreground/90 mb-5">{paragraph}</p>
              ))}
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button asChild size="lg" variant="warm" className="text-base h-auto min-h-14 px-6 py-4 whitespace-normal text-center shadow-sm">
                  <Link href="/adv/begin-the-adventure">
                    {content.guideLabel ?? "Begin This Short Guide"}
                  </Link>
                </Button>
              </div>
              
              <Link href="/videos/Gods-Vision" className="inline-flex items-start gap-2 text-warm-700 font-semibold hover:text-warm-800 transition-colors">
                  <PlayCircle className="w-6 h-6 shrink-0" />
                  <span>Prefer to listen?  3 minutes — How God sees you now</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-warm-200 flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
            <span>Want to come back easily later?</span>
            <ShareButton 
              title={content.title} 
              text={`I found this helpful: ${content.title} - Follow Jesus Online`}
              label="Save or Send this page" 
              variant="secondary"
              className="w-full sm:w-auto bg-warm-100 hover:bg-warm-200 text-warm-900 border-none"
            />
          </div>
        </div>}

        {/* Questions / Next Steps */}
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">{content.questionsTitle}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {content.questions.map((q, i) => (
              <div key={i} className="bg-white border border-warm-200 rounded-xl p-6 flex items-start gap-4 shadow-sm hover:border-warm-300 transition-colors">
                <Heart className="w-5 h-5 text-warm-400 shrink-0 mt-0.5" />
                {XP_ARTICLE_LINKS[type]?.[q] ? (
                  <Link
                    href={articleHref(XP_ARTICLE_LINKS[type][q])}
                    className="text-left font-medium text-foreground/90 underline decoration-warm-300 underline-offset-4 transition-colors hover:text-warm-800"
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
        <div className="bg-warm-50 border border-warm-200 text-foreground rounded-2xl p-8 md:p-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both shadow-sm">
          <MessageCircle className="w-12 h-12 mx-auto mb-6 text-warm-700" />
          <h2 className="text-3xl font-bold mb-4">{content.contactHeading ?? "We’re Here If You Need Anything"}</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            {content.contactText}
          </p>
          <Button asChild size="lg" variant="warm" className="shadow-md">
            <Link href="/message">Send a Message</Link>
          </Button>
        </div>

      </div>
    </Layout>
  );
}
