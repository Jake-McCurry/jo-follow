import type { ReactNode } from "react";
import appendices from "@/data/knowing-god/introduction/appendices.json";
import { kjvScriptureHref } from "@/components/knowing-god/knowing-god-ui";

const { memorization: m, salvationPassages, notes, bibliography, resources } = appendices;

function emphasize(text: string, phrase: string): ReactNode {
  const i = text.indexOf(phrase);
  if (i < 0) return text;
  return <>{text.slice(0, i)}<strong>{phrase}</strong>{text.slice(i + phrase.length)}</>;
}

const instructionEmphasis: Record<number, string> = { 5: "Print the words of the passage by phrases", 6: "PRAYER" };

function Marker({ n }: { n: number }) {
  return (
    <a className="appendix-marker" href={`#memory-step-${n}`} id={`memory-field-${n}`} aria-label={`Instruction ${n}`} data-testid={`link-memory-step-${n}`}>{n}</a>
  );
}

function withVerseNumbers(text: string): ReactNode[] {
  return text.split(/ (\d{1,3}) (?=[A-Za-z])/).map((part, i) =>
    i % 2 === 1 ? <span key={i}> <strong className="verse-number">{part}</strong> </span> : <span key={i}>{part}</span>);
}

function Memorization() {
  return (
    <article className="content-section appendix-content">
      <p className="guide-introduction">{m.introduction}</p>
      <div className="memory-cards">
        <section className="memory-card memory-front" aria-labelledby="memory-front-label">
          <h2 id="memory-front-label" className="section-label">Front side</h2>
          <div className="memory-front-grid">
            <p className="mf-summary"><Marker n={2} /> {m.front.summary}</p>
            <p className="mf-prompt"><Marker n={3} /> {m.front.prompt}</p>
            <p className="mf-reference"><Marker n={1} /> <strong>{m.front.reference}</strong></p>
            <div className="mf-comments"><Marker n={4} /><div>{m.front.comments.map(line => <span key={line}>{line}</span>)}</div></div>
            <p className="mf-date"><Marker n={5} /> {m.front.date}</p>
          </div>
        </section>
        <section className="memory-card memory-back" aria-labelledby="memory-back-label">
          <h2 id="memory-back-label" className="section-label">Back side</h2>
          <div className="mb-field"><Marker n={6} /><p className="mb-passage">{m.back.passage.map(line => <span key={line}>{line}</span>)}</p></div>
          <div className="mb-field"><Marker n={7} /><p className="mb-prayer">{m.back.prayer}</p></div>
        </section>
      </div>
      <h2 className="appendix-heading">Instructions</h2>
      <ol className="memory-instructions">
        {m.instructions.map((text, i) => (
          <li key={i} id={`memory-step-${i + 1}`}>
            <span className="appendix-step">{i + 1}</span>
            <p>{instructionEmphasis[i] ? emphasize(text, instructionEmphasis[i]) : text}{" "}
              <a className="appendix-back" href={`#memory-field-${i + 1}`} data-testid={`link-memory-field-${i + 1}`}>Back to card</a></p>
          </li>
        ))}
      </ol>
      <blockquote className="appendix-closing">
        <p>{m.closing.text}</p>
        <cite>{m.closing.reference}</cite>
      </blockquote>
      <h2 className="appendix-heading">Salvation Verses for Memorization</h2>
      <ol className="salvation-list">
        {salvationPassages.map(p => (
          <li key={p.reference}>
            <a href={kjvScriptureHref(p.reference, import.meta.env.BASE_URL)} target="_blank" rel="noopener noreferrer" data-testid={`link-salvation-${p.reference}`}><strong>{p.reference}</strong></a>
            <p>{withVerseNumbers(p.text)}</p>
          </li>
        ))}
      </ol>
    </article>
  );
}

type Cite = { before?: string; title: string; after: string };
const Entry = ({ c }: { c: Cite }) => <>{c.before}<i>{c.title}</i>{c.after}</>;

export function IntroAppendices({ slug }: { slug: string }) {
  if (slug === "bible-memorization") return <Memorization />;
  if (slug === "notes") return (
    <article className="content-section appendix-content">
      <ol className="appendix-citations">{notes.map((c, i) => <li key={i}><Entry c={c} /></li>)}</ol>
    </article>
  );
  if (slug === "bibliography") return (
    <article className="content-section appendix-content">
      <ul className="appendix-citations hanging">{bibliography.map((c, i) => <li key={i}><Entry c={c} /></li>)}</ul>
      <h2 className="appendix-heading">Recommended Resources for Further Study</h2>
      <ul className="appendix-citations hanging">{resources.map((c, i) => <li key={i}><Entry c={c} /></li>)}</ul>
    </article>
  );
  return null;
}
