import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Compass, Shield, User, Heart, Footprints, Book, MessageCircle, Users, Target, RefreshCw, BookOpen, HelpCircle } from "lucide-react";
import { useTrackRecentPage } from "@/hooks/use-recent-page";
import { getArticlesInGroup } from "@/data/article-library";

const ARTICLES = [
  {
    title: "Begin the Adventure",
    desc: "Discover the greatest journey of your life—learning to live each day with Jesus.",
    link: "/adv-begin-the-adventure",
    icon: Compass
  },
  {
    title: "Citizen of Heaven",
    desc: "The Bible says you can be certain you will go to Heaven when you die.",
    link: "/adv-citizen-of-heaven",
    deeper: { label: "Assurance of Your Salvation", link: "/deeper-assurance-of-your-salvation" },
    icon: Shield
  },
  {
    title: "Your New Identity in Christ",
    desc: "See yourself the way God now sees you—and watch how that new identity changes everything.",
    link: "/adv-your-new-identity-christ",
    icon: User
  },
  {
    title: "The Holy Spirit – Your Constant Companion",
    desc: "Meet the personal presence of God who walks with you, guides you, and never leaves your side.",
    link: "/adv-the-holy-spirit",
    icon: Heart
  },
  {
    title: "Walking by Faith, Not by Feelings",
    desc: "Learn to trust God steadily even when your emotions rise and fall like the weather.",
    link: "/adv-walking-by-faith",
    deeper: { label: "Faith: Knowing Who You Can Trust", link: "/deeper-faith-knowing-who-you-can-trust" },
    icon: Footprints
  },
  {
    title: "God’s Word – Your Road Map",
    desc: "Let Scripture become the clear, trustworthy guide that keeps you on the right path.",
    link: "/adv-gods-word",
    icon: Book
  },
  {
    title: "Prayer – Your Ongoing Conversation with God",
    desc: "Turn prayer from a duty into a natural, ongoing conversation with the One who loves you most.",
    link: "/adv-prayer",
    icon: MessageCircle
  },
  {
    title: "Belonging to God’s Family",
    desc: "Step into the rich community of believers who walk beside you as true family.",
    link: "/adv-belonging-to-gods-family",
    icon: Users
  },
  {
    title: "Living a Life of Purpose",
    desc: "Uncover the unique design God has for your life and begin living it with confidence.",
    link: "/adv-living-a-life-of-purpose",
    icon: Target
  },
  {
    title: "Continuing with Jesus",
    desc: "Keep growing in your relationship with Jesus so the adventure of following Him never ends.",
    link: "/adv-continuing-with-jesus",
    icon: RefreshCw
  },
];

export function ExploreArticlesPage() {
  useTrackRecentPage();
  const deeperArticles = getArticlesInGroup("deeper");
  const resourceArticles = getArticlesInGroup("resources");
  const receivedArticles = getArticlesInGroup("received");
  const rededicatedArticles = getArticlesInGroup("rededicated");
  
  return (
    <Layout>
      <div className="container mx-auto px-5 sm:px-8 py-16 max-w-5xl">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Explore Articles</h1>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Resources and guides to help you understand your faith and walk with Jesus every day.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          {ARTICLES.map((article, i) => {
            const Icon = article.icon;
            return (
              <Card key={i} className="flex flex-col h-full border-border/60 hover:border-primary/30 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                <CardContent className="p-0 flex flex-col h-full">
                  <Link href={article.link} className="flex-1 p-6 md:p-8 flex flex-col items-start focus-visible:outline-none focus-visible:bg-muted/50">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-card-foreground group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {article.desc}
                    </p>
                    <div className="mt-auto flex items-center text-primary font-semibold text-sm">
                      View topic <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                  
                  {article.deeper && (
                    <div className="bg-muted/30 border-t border-border/50 px-6 md:px-8 py-4">
                      <Link 
                        href={article.deeper.link} 
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center"
                      >
                        <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded mr-3 uppercase tracking-wide">
                          Go Deeper
                        </span>
                        {article.deeper.label}
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <section className="mt-20" aria-labelledby="go-deeper-heading">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">Keep growing</p>
              <h2 id="go-deeper-heading" className="text-3xl font-bold text-foreground">Go Deeper</h2>
            </div>
            <BookOpen className="h-8 w-8 text-primary/50" aria-hidden="true" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {deeperArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/${article.slug}`}
                className="group rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary">{article.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                  Read study <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-20" aria-labelledby="questions-heading">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">Questions are welcome</p>
              <h2 id="questions-heading" className="text-3xl font-bold text-foreground">Next-step questions</h2>
            </div>
            <HelpCircle className="h-8 w-8 text-primary/50" aria-hidden="true" />
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <QuestionGroup title="After you begin following Jesus" articles={receivedArticles} />
            <QuestionGroup title="When you are returning to Jesus" articles={rededicatedArticles} />
          </div>
        </section>

        <section className="mt-20" aria-labelledby="more-resources-heading">
          <div className="mb-8">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">More to explore</p>
            <h2 id="more-resources-heading" className="text-3xl font-bold text-foreground">Additional discipleship resources</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {resourceArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/${article.slug}`}
                className="group flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary">{article.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

function QuestionGroup({
  title,
  articles,
}: {
  title: string;
  articles: ReturnType<typeof getArticlesInGroup>;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <h3 className="mb-5 text-xl font-bold text-card-foreground">{title}</h3>
      <div className="space-y-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/${article.slug}`}
            className="group flex items-start justify-between gap-3 rounded-lg border border-border/50 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-muted/40"
          >
            <span className="font-medium leading-snug text-foreground group-hover:text-primary">{article.title}</span>
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
