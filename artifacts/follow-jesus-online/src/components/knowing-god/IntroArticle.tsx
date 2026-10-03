import { useMemo, useState } from "react";
import { Link } from "wouter";
import { knowingGodIntroductions, type KnowingGodIntroduction } from "@/data/knowingGodIntroductions";
import { aboutAndDedication } from "@/data/knowing-god/introduction/about-and-dedication";
import { foundationalScriptures } from "@/data/knowing-god/introduction/foundational-scriptures";
import { devotionalGuideCategories, devotionalGuideIntroduction } from "@/data/knowing-god/introduction/devotional-guide";
import { notableQuotations } from "@/data/knowing-god/introduction/notable-quotations";

const hymnEmphasis = [
  [["worship the King", "all-glorious"], ["sing", "pow’r", "love"], ["Shield", "Defender"], ["splendor", "praise"]],
  [["His might", "His grace"], ["light"], ["wrath"], []],
  [["wonders untold"], ["Almighty", "power has founded"], ["'stablished", "changeless decree"], []],
  [["bountiful care"], ["light"], ["streams"], ["distills"]],
  [[], ["trust"], ["mercies", "tender", "firm"], ["Maker", "Defender", "Redeemer", "Friend"]],
  [["measureless Might", "Ineffable Love"], ["angels delight"], ["creation"], ["adoration", "praise"]],
] as const;

const markHymnLine = (line: string, stanzaIndex: number, lineIndex: number) => {
  const phrases = [...(hymnEmphasis[stanzaIndex]?.[lineIndex] ?? [])]
    .map(phrase => ({ phrase, index: line.indexOf(phrase) }))
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index);
  const segments: Array<{ text: string; emphasized: boolean }> = [];
  let cursor = 0;
  for (const { phrase, index } of phrases) {
    if (index > cursor) segments.push({ text: line.slice(cursor, index), emphasized: false });
    segments.push({ text: phrase, emphasized: true });
    cursor = index + phrase.length;
  }
  if (cursor < line.length) segments.push({ text: line.slice(cursor), emphasized: false });
  return segments;
};

const devotionalEntryCount = devotionalGuideCategories.reduce((total, category) => total + category.entries.length, 0);

function DevotionalGuide() {
  const [filter, setFilter] = useState("");
  const query = filter.trim().toLowerCase();
  const cards = useMemo(() => devotionalGuideCategories.map(category => ({
    category,
    search: `${category.heading} ${category.entries.map(entry => entry.topic).join(" ")}`.toLowerCase(),
  })), []);
  const visible = cards.filter(card => !query || card.search.includes(query));
  const topics = visible.reduce((total, card) => total + card.category.entries.length, 0);
  const summary = query
    ? `${visible.length} ${visible.length === 1 ? "category" : "categories"} · ${topics} topics`
    : `${devotionalGuideCategories.length} categories · ${devotionalEntryCount} topics`;
  return (
    <article className="content-section guide-content">
      <p className="guide-introduction">{devotionalGuideIntroduction}</p>
      <div className="guide-tools">
        <label htmlFor="guide-filter">Find a category or topic</label>
        <input id="guide-filter" type="search" placeholder="Try “faithful” or “prayer”" autoComplete="off" value={filter} onChange={event => setFilter(event.target.value)} />
        <p id="guide-results" aria-live="polite">{summary}</p>
      </div>
      <div className="guide-categories" id="guide-categories">
        {visible.map(({ category }) => (
          <section className="guide-category" key={category.heading}>
            <h2>{category.heading}</h2>
            <ul>
              {category.entries.map(entry => (
                <li key={`${entry.topic}-${entry.page}`}>
                  <span>{entry.topic}</span>
                  <i aria-hidden="true"></i>
                  <strong>{entry.page}</strong>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}

export function IntroArticle({ article, previous, next }: { article: KnowingGodIntroduction; previous: KnowingGodIntroduction | null; next: KnowingGodIntroduction | null }) {
  const { titlePage, publication, dedication } = aboutAndDedication;
  return (
    <main className="kg-intro-main" id="main-content">
      <nav className="kg-intro-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/knowing-god">Knowing God</Link>{" "}
        <span aria-hidden="true">/</span>{" "}
        <Link href="/knowing-god/introduction">Introductory Articles</Link>{" "}
        <span aria-hidden="true">/</span>{" "}
        {article.title}
      </nav>

      <p className="kg-intro-eyebrow">{article.eyebrow}</p>
      <h1 className="kg-intro-title">{article.title}</h1>
      <p className="kg-intro-lede">{article.description}</p>

      {article.slug === "about-this-edition" && (
        <article className="content-section about-edition">
          <section className="book-title-card" aria-label="Original title page">
            <p>{titlePage.title[0]}</p>
            <h2>{titlePage.title[1]}</h2>
            <div>{titlePage.subtitle.map(line => <span key={line}>{line}</span>)}</div>
            <strong>{titlePage.motto}</strong>
          </section>

          <section className="publication-grid" aria-label="Publication information">
            <div className="publication-contact">
              <p className="section-label">Publisher</p>
              <h2>{publication.publisher}</h2>
              <address>{publication.address.map(line => <span key={line}>{line}</span>)}</address>
              <div className="publisher-mark">{publication.publisherMark.map(line => <span key={line}>{line}</span>)}</div>
            </div>
            <div className="publication-details">
              <p className="copyright"><a className="kg-copyright-link" href="https://www.zmission.org/our-story.html" target="_blank" rel="noopener noreferrer">{publication.copyright}</a></p>
              <p>{publication.rights.join(" ")}</p>
              <p>{publication.internetNotice.join(" ")}</p>
              <h3>{publication.orderingHeading}</h3>
              <p>{publication.orderingInformation.join(" ")}</p>
              {publication.scriptureNotes.map((note, index) => <p key={index}>{note.join(" ")}</p>)}
              <p className="isbn">{publication.isbn}</p>
            </div>
          </section>
        </article>
      )}

      {article.slug === "dedication" && (
        <article className="content-section dedication-content">
          <div className="hymn-heading">
            <p className="section-label">{dedication.heading}</p>
            <h2>{dedication.title}</h2>
          </div>
          <div className="hymn-stanzas">
            {dedication.stanzas.map((stanza, index) => (
              <section className="hymn-stanza" aria-label={`Stanza ${index + 1}`} key={index}>
                <span className="stanza-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <p>
                  {stanza.map((line, lineIndex) => (
                    <span key={lineIndex}>
                      {markHymnLine(line, index, lineIndex).map((segment, segmentIndex) =>
                        segment.emphasized ? <u key={segmentIndex}>{segment.text}</u> : segment.text)}
                    </span>
                  ))}
                </p>
              </section>
            ))}
          </div>
          <p className="hymn-author">{dedication.author}</p>
          <p className="source-footnote">{dedication.footnote}</p>
        </article>
      )}

      {article.slug === "foundational-scriptures" && (
        <article className="content-section scripture-list">
          {foundationalScriptures.map((passage, index) => (
            <section className="scripture-card" aria-labelledby={`scripture-reference-${index}`} key={index}>
              <div className="scripture-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
              <blockquote>{passage.text}</blockquote>
              <h2 id={`scripture-reference-${index}`}>{passage.reference}</h2>
            </section>
          ))}
        </article>
      )}

      {article.slug === "devotional-guide" && <DevotionalGuide />}

      {article.slug === "notable-quotations" && (
        <article className="content-section quotations-grid">
          {notableQuotations.map((quotation, index) => (
            <figure className={`quotation-card${quotation.text.length > 500 ? " featured" : ""}`} key={index}>
              <span className="quote-mark" aria-hidden="true">“</span>
              <blockquote>
                {quotation.text}
                {quotation.footnoteMarkers?.map(marker => <sup key={marker}>{marker}</sup>)}
              </blockquote>
              <figcaption>
                <span aria-hidden="true"></span>
                {quotation.attribution}
              </figcaption>
            </figure>
          ))}
        </article>
      )}

      <nav className="article-navigation" aria-label="Introductory article navigation">
        {previous ? (
          <Link href={`/knowing-god/introduction/${previous.slug}`}>
            <small>Previous</small>
            <span>← {previous.title}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link className="next" href={`/knowing-god/introduction/${next.slug}`}>
            <small>Next</small>
            <span>{next.title} →</span>
          </Link>
        ) : (
          <Link className="next" href="/knowing-god">
            <small>Continue</small>
            <span>Browse the topics →</span>
          </Link>
        )}
      </nav>
    </main>
  );
}

export function IntroIndex() {
  return (
    <main className="kg-intro-main" id="main-content">
      <nav className="kg-intro-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/knowing-god">Knowing God</Link> <span aria-hidden="true">/</span> Introductory Articles
      </nav>
      <p className="kg-intro-eyebrow">Begin Here</p>
      <h1 className="kg-intro-title">Introductory Articles</h1>
      <p className="kg-intro-lede">Read the original material that precedes the Table of Contents, then continue into the Topical Bible.</p>
      <section className="intro-grid" aria-label="Knowing God introductory articles">
        {knowingGodIntroductions.map((article, index) => (
          <Link className="intro-card" href={`/knowing-god/introduction/${article.slug}`} key={article.slug}>
            <span className="intro-number">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p>{article.eyebrow}</p>
              <h2>{article.title}</h2>
              <span>{article.description}</span>
            </div>
            <strong aria-hidden="true">→</strong>
          </Link>
        ))}
      </section>
    </main>
  );
}
