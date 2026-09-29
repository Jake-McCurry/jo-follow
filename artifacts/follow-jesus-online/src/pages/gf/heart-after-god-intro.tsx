import { BookChapterFrame } from "@/components/book-chapter-frame";
import { ArticleEndSection } from "@/components/article-end-section";
import { getGFBook } from "@/data/go-further-library";
import NotFound from "@/pages/not-found";

const words = [
  ["Heart", "who you are inside; the inner person God sees."],
  ["Soul", "the living self that thinks, chooses, and feels (mind, will, and emotions)."],
  ["Spirit", "the part of you that can know God; it includes the conscience."],
  ["Conscience", "the inner warning light that knows right from wrong."],
  ["Flesh", "the old self-centered pull that remains even after God gives a new heart."],
  ["Adoption", "God legally making you His child through Jesus."],
  ["Fellowship", "closeness with the Father in daily life."],
  ["Wholeheartedness", "an undivided desire for God."],
];

const path = [
  "Your life shows your heart.",
  "God sees the heart and still invites you.",
  "The heart has inner movements that can be guarded.",
  "God gives a new heart.",
  "You belong in the family; fellowship can be restored.",
  "Love for God grows through ordinary practices.",
  "The Spirit is the One who changes the heart.",
  "A heart remains in Christ and bears fruit by staying close to Him.",
];

export function HeartAfterGodIntroPage() {
  const book = getGFBook("a-heart-after-god");
  if (!book?.introChapter || !book.readings[0]) return <NotFound />;

  return (
    <BookChapterFrame
      bookTitle={book.title}
      bookHref={`/gf/${book.slug}`}
      chapterLabel="Introduction"
      title={book.introChapter.title}
    >
          <div className="prose prose-lg max-w-none text-slate prose-p:font-sans prose-headings:font-sans">
            <p>Something in every person longs to be whole.</p>

            <blockquote className="rounded-xl border-l-4 border-warm-500 bg-warm-50/70 p-6 text-navy sm:p-8">
              <p>You have made us for Yourself, O Lord, and our heart is restless until it rests in You.</p>
              <footer>— Augustine</footer>
            </blockquote>

            <p>
              We feel that restlessness when words come out sharper than we intended, when a hidden motive surfaces, when the life we present to others does not match the life we carry within. Scripture is not silent about that inner world. It gives it a name. It calls it the heart.
            </p>

            <blockquote className="rounded-xl border-l-4 border-warm-500 bg-warm-50/70 p-6 text-navy sm:p-8">
              <p>The Bible term ‘heart’ is best understood if we simply say ‘me.’ It is the central citadel of a man’s personality.</p>
              <footer>— Oswald Chambers</footer>
            </blockquote>

            <p>
              The heart is not merely the place of feeling. It is the inner person—the hidden center of thought, will, desire, emotion, conscience, and worship. From it flow the sources of life. What is true there will, in time, become visible in words, choices, and relationships. God does not look first at the street view of a life. He examines the foundation.
            </p>

            <p>
              These eight reflections are an invitation to that inner work. They begin where honesty must begin: with the heart as it is. They then move to the God who sees it fully and still draws near in Jesus Christ. They open the inner life so that thoughts, desires, and conscience can be named and guarded. They tell the gospel’s most necessary news—that the old heart cannot be repaired by effort, but must be made new by God. They announce the security of adoption and the warmth of fellowship. They show how ordinary practices deepen into wholehearted love. They show how the Holy Spirit alone supplies the power that transforms the heart from the inside out. And they end with a heart that remains in Christ, bearing fruit by staying close to Him.
            </p>

            <p>
              This is not a call to try harder in private. It is a call to bring the inner life under the care of the God who gives a new heart and then forms it into the likeness of His Son.
            </p>

            <p>
              A heart after God is not produced in a moment of intensity. It is formed as we learn to live from what He has already given—quietly, honestly, and day by day. The waters of the inner life can become still again. The reflection can grow clear. And the life that follows can begin to tell the truth about the One who lives within.
            </p>

            <p>The journey starts where all true change starts. It starts with the heart.</p>

            <h2 className="mt-14 mb-6 flex items-center gap-3 text-2xl font-bold text-navy sm:text-3xl">
              <span className="hidden h-px w-12 bg-warm-300 sm:block" aria-hidden="true" />
              Before You Begin
            </h2>
            <p>
              This is not a test of how mature you are. It is a walk through the inner life with the God who has already drawn near.
            </p>
            <p>
              You do not need to understand every term on the first reading. You do not need to finish a chapter in one sitting. Read slowly. Look up the verses. Speak honestly with God as you go. If a sentence feels heavy, pause there. The aim is not to complete these pages. The aim is to begin living with Jesus from the inside out.
            </p>
            <p>
              If you are new to faith, you are welcome here. These reflections were written so that a new believer can walk the path without being left behind, and so that a growing believer can return to the foundations with fresh honesty.
            </p>

            <h2 className="mt-14 mb-6 flex items-center gap-3 text-2xl font-bold text-navy sm:text-3xl">
              <span className="hidden h-px w-12 bg-warm-300 sm:block" aria-hidden="true" />
              Words You Will Meet
            </h2>
            <p>
              A few words in these pages carry a biblical meaning that is easy to miss. They are kept because Scripture uses them. Here is their plain sense the first time they appear:
            </p>
            <dl>
              {words.map(([term, meaning]) => (
                <div key={term} className="mb-3">
                  <dt className="inline font-bold text-navy">{term}</dt>
                  <dd className="inline"> — {meaning}</dd>
                </div>
              ))}
            </dl>

            <h2 className="mt-14 mb-6 flex items-center gap-3 text-2xl font-bold text-navy sm:text-3xl">
              <span className="hidden h-px w-12 bg-warm-300 sm:block" aria-hidden="true" />
              The Path of These Eight Reflections
            </h2>
            <ol>
              {path.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <p>
              Each reflection includes a picture to help you see the truth, a short glimpse of how this looks in an ordinary life, one primary step for the day, and a word of assurance. You are not asked to carry this work alone.
            </p>
          </div>
        <ArticleEndSection
          articleSlug={`gf-${book.slug}-${book.introChapter.slug}`}
          next={{
            href: `/gf/${book.slug}/${book.readings[0].slug}`,
            title: book.readings[0].title,
            label: "Begin the first reading",
          }}
        />
    </BookChapterFrame>
  );
}