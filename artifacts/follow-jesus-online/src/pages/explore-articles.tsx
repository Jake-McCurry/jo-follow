import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useTrackRecentPage } from "@/hooks/use-recent-page";
import { getArticlesInGroup } from "@/data/article-library";

const ARTICLES = [
  {
    title: "Begin the Adventure",
    desc: "Discover the greatest journey of your life—learning to live each day with Jesus.",
    link: "/adv/begin-the-adventure",
    deeper: { label: "The Need for a New Heart", link: "/deeper/the-need-for-a-new-heart" },
  },
  {
    title: "Citizen of Heaven",
    desc: "The Bible says you can be certain you will go to Heaven when you die.",
    link: "/adv/citizen-of-heaven",
    deeper: { label: "The Gift of Eternal Life", link: "/deeper/the-gift-of-eternal-life" },
  },
  {
    title: "Your New Identity in Christ",
    desc: "See yourself the way God now sees you—and watch how that new identity changes everything.",
    link: "/adv/your-new-identity-christ",
    deeper: { label: "Embracing Your New Identity in Christ", link: "/deeper/embracing-your-new-identity-in-christ" },
  },
  {
    title: "The Holy Spirit – Your Constant Companion",
    desc: "Meet the personal presence of God who walks with you, guides you, and never leaves your side.",
    link: "/adv/the-holy-spirit",
    deeper: { label: "Living an Empowered Life", link: "/deeper/living-an-empowered-life" },
  },
  {
    title: "Walking by Faith, Not by Feelings",
    desc: "Learn to trust God steadily even when your emotions rise and fall like the weather.",
    link: "/adv/walking-by-faith",
    deeper: { label: "Faith: Knowing God Who Is Trustworthy", link: "/deeper/faith-knowing-god-who-is-trustworthy" },
  },
  {
    title: "God’s Word – Your Road Map",
    desc: "Let Scripture become the clear, trustworthy guide that keeps you on the right path.",
    link: "/adv/gods-word",
    deeper: { label: "Renewing the Mind for Transformation", link: "/deeper/renewing-the-mind-for-transformation" },
  },
  {
    title: "Prayer – Your Ongoing Conversation with God",
    desc: "Turn prayer from a duty into a natural, ongoing conversation with the One who loves you most.",
    link: "/adv/prayer",
    deeper: { label: "The Lord’s Prayer Guide", link: "/deeper/the-lords-prayer-guide" },
  },
  {
    title: "Belonging to God’s Family",
    desc: "Step into the rich community of believers who walk beside you as true family.",
    link: "/adv/belonging-to-gods-family",
    deeper: { label: "Belong and Become", link: "/deeper/belong-and-become" },
  },
  {
    title: "Living a Life of Purpose",
    desc: "Uncover the unique design God has for your life and begin living it with confidence.",
    link: "/adv/living-a-life-of-purpose",
    deeper: { label: "God’s Plan for You", link: "/deeper/gods-plan-for-you" },
  },
  {
    title: "Continuing with Jesus",
    desc: "Keep growing in your relationship with Jesus so the adventure of following Him never ends.",
    link: "/adv/continuing-with-jesus",
    deeper: { label: "Your Journey Continues", link: "/deeper/your-journey-continues" },
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
      <div className="container mx-auto max-w-5xl px-5 py-8 sm:px-8 md:py-10">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-6">Explore Articles</h1>
          <div className="w-16 h-1 bg-warm-accent mx-auto rounded-full"></div>
          <p className="mt-6 text-xl text-slate max-w-2xl mx-auto">
            Resources and guides to help you understand your faith and walk with Jesus every day.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          {ARTICLES.map((article, i) => (
              <Card key={i} className="flex flex-col h-full border-border-soft hover:border-brand/30 shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white">
                <CardContent className="p-0 flex flex-col h-full">
                  <Link href={article.link} className="flex-1 p-5 md:p-6 flex flex-col items-start focus-visible:outline-none focus-visible:bg-blue-50">
                    <h3 className="text-2xl font-bold mb-3 text-navy group-hover:text-brand transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-slate leading-relaxed mb-4">
                      {article.desc}
                    </p>
                    <span className="mt-auto text-sm font-bold text-brand">View topic</span>
                  </Link>
                  
                  {article.deeper && (
                    <div className="bg-surface-soft border-t border-border-soft px-6 md:px-8 py-4">
                      <Link 
                        href={article.deeper.link} 
                        className="text-sm font-semibold text-navy hover:text-brand transition-colors flex items-center"
                      >
                        <span className="bg-blue-200 text-navy text-xs font-bold px-2 py-0.5 rounded mr-3 uppercase tracking-wide">
                          Go Deeper
                        </span>
                        {article.deeper.label}
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
          ))}
        </div>

        <section className="mt-20" aria-labelledby="go-deeper-heading">
          <div className="mb-8 border-b border-blue-100 pb-4">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-wider text-warm-700">Keep growing</p>
              <h2 id="go-deeper-heading" className="text-3xl font-bold text-navy">Go Deeper</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {deeperArticles.map((article) => (
              <Link
                key={article.slug}
                href={article.slug.replace(/^((?:adv|deeper))-/, "/$1/")}
                className="group rounded-xl border border-border-soft bg-white p-5 shadow-sm transition-all hover:border-brand/40 hover:shadow-md"
              >
                <h3 className="text-xl font-bold text-navy group-hover:text-brand">{article.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{article.excerpt}</p>
                <span className="mt-4 inline-block text-sm font-bold text-brand">Read study</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-20" aria-labelledby="questions-heading">
          <div className="mb-8 border-b border-blue-100 pb-4">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-wider text-warm-700">Questions are welcome</p>
              <h2 id="questions-heading" className="text-3xl font-bold text-navy">Next-step questions</h2>
            </div>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <QuestionGroup title="After you begin following Jesus" articles={receivedArticles} />
            <QuestionGroup title="When you are returning to Jesus" articles={rededicatedArticles} />
          </div>
        </section>

        <section className="mt-20" aria-labelledby="more-resources-heading">
          <div className="mb-8 border-b border-blue-100 pb-4">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-warm-700">More to explore</p>
            <h2 id="more-resources-heading" className="text-3xl font-bold text-navy">Additional discipleship resources</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {resourceArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/${article.slug}`}
                className="group rounded-xl border border-border-soft bg-white p-5 shadow-sm transition-all hover:border-brand/40 hover:shadow-md"
              >
                <h3 className="text-xl font-bold text-navy group-hover:text-brand">{article.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{article.excerpt}</p>
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
    <div className="rounded-2xl border border-border-soft bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-xl font-bold text-navy">{title}</h3>
      <div className="space-y-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/${article.slug}`}
            className="group block rounded-lg border border-border-soft bg-surface-soft px-4 py-3 transition-colors hover:border-brand/40 hover:bg-white"
          >
            <span className="font-semibold leading-snug text-navy group-hover:text-brand">{article.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
