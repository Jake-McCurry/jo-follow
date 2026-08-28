import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Compass, Shield, User, Heart, Footprints, Book, MessageCircle, Users, Target, RefreshCw, Library } from "lucide-react";
import { useTrackRecentPage } from "@/hooks/use-recent-page";
import { ARTICLES as LIBRARY_ARTICLES, type ArticleRecord } from "@/content/articles";

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
    deeper: { label: "Embracing Your New Identity in Christ", link: "/deeper-embracing-your-new-identity-in-christ" },
    icon: User
  },
  {
    title: "The Holy Spirit – Your Constant Companion",
    desc: "Meet the personal presence of God who walks with you, guides you, and never leaves your side.",
    link: "/adv-the-holy-spirit",
    deeper: { label: "Who Is the Holy Spirit?", link: "/more-the-holy-spirit" },
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
    deeper: { label: "What the Bible Says", link: "/more-the-bible" },
    icon: Book
  },
  {
    title: "Prayer – Your Ongoing Conversation with God",
    desc: "Turn prayer from a duty into a natural, ongoing conversation with the One who loves you most.",
    link: "/adv-prayer",
    deeper: { label: "The Lord’s Prayer Guide Overview", link: "/deeper-the-lords-prayer-guide-overview" },
    icon: MessageCircle
  },
  {
    title: "Belonging to God’s Family",
    desc: "Step into the rich community of believers who walk beside you as true family.",
    link: "/adv-belonging-to-gods-family",
    deeper: { label: "Connecting with God’s Family", link: "/deeper-connecting-with-gods-family" },
    icon: Users
  },
  {
    title: "Living a Life of Purpose",
    desc: "Uncover the unique design God has for your life and begin living it with confidence.",
    link: "/adv-living-a-life-of-purpose",
    deeper: { label: "God’s Plan for You", link: "/deeper-gods-plan-for-you" },
    icon: Target
  },
  {
    title: "Continuing with Jesus",
    desc: "Keep growing in your relationship with Jesus so the adventure of following Him never ends.",
    link: "/adv-continuing-with-jesus",
    icon: RefreshCw
  },
  {
    title: "Additional Resources",
    desc: "Find practical tools and next steps to help you keep moving forward on the journey.",
    link: "/adv-resources",
    icon: Library
  }
];

const LIBRARY_GROUPS = ["Go Deeper", "Questions & Answers", "Additional Resource"]
  .map((category) => ({
    category,
    articles: LIBRARY_ARTICLES.filter((article) => article.category === category),
  }))
  .filter((group) => group.articles.length > 0);

function articleExcerpt(article: ArticleRecord) {
  const text = article.blocks.find((block) => block.kind === "paragraph")?.text ?? "";
  return text.length > 180 ? `${text.slice(0, 177).trimEnd()}…` : text;
}

export function ExploreArticlesPage() {
  useTrackRecentPage();
  
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
                      Read article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
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

        <div className="mt-20 space-y-14">
          {LIBRARY_GROUPS.map((group) => (
            <section key={group.category} aria-labelledby={`library-${group.category.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Library className="w-5 h-5" aria-hidden="true" />
                </div>
                <h2
                  id={`library-${group.category.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-3xl font-bold text-foreground"
                >
                  {group.category}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                {group.articles.map((article) => (
                  <Link
                    key={article.route}
                    href={article.route}
                    className="group rounded-xl border border-border/60 bg-card p-6 shadow-sm hover:border-primary/30 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors mb-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {articleExcerpt(article)}
                    </p>
                    <span className="inline-flex items-center text-sm font-semibold text-primary">
                      Read article
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}
