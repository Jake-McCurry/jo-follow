import { useState } from "react";
import content from "../content/xp-content.json";
import "./xp-content.css";

export type XPType = "received" | "rededicated" | "believer" | "did-not-pray";
export interface XPPageContent {
  title: string;
  subtitle?: string;
  intro: string[];
  guideHeading?: string;
  guideLabel?: string;
  guideText: string[];
  questionsTitle: string;
  questions: { title: string; href: string }[];
  contactText: string;
  contactHeading?: string;
}
const pages = content as Record<XPType, XPPageContent>;

export interface XPContentProps {
  type: XPType;
  /** "" keeps resource links on this project; an origin keeps them on another site. */
  resourceBaseUrl: string;
  guideCoverSrc: string;
  /** Override this if the new project uses a different contact destination. */
  messageHref?: string;
  entry?: string;
  /** Optional canonical URL to share instead of the current browser URL. */
  shareUrl?: string;
}

function Icon({ name }: { name: "heart" | "play" | "message" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={"follow-xp-icon follow-xp-icon-" + name}>
      {name === "heart" ? <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /> :
        name === "play" ? <><circle cx="12" cy="12" r="10" /><path d="m10 8 6 4-6 4Z" /></> :
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />}
    </svg>
  );
}

/** Main content only: no app shell, site header, navigation, footer or backend. */
export function XPContent({ type, resourceBaseUrl, guideCoverSrc, messageHref, entry = "direct", shareUrl }: XPContentProps) {
  const [shareStatus, setShareStatus] = useState("");
  const page = pages[type];
  if (!page) throw new Error("Unknown XP page type: " + type);
  const resourceHref = (path: string) => resourceBaseUrl.replace(/\/$/, "") + path;
  const questionHref = (path: string) => {
    const query = new URLSearchParams({ journey: type, entry, from: "xp", step: "faq" });
    return resourceHref(path) + "?" + query.toString();
  };
  const share = async () => {
    const url = shareUrl || window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: page.title, text: "I found this helpful: " + page.title + " - Follow Jesus Online", url });
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        setShareStatus("Link copied.");
      } else {
        setShareStatus("Copy this page link: " + url);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setShareStatus("Unable to share automatically. Copy this page link: " + url);
      }
    }
  };

  return (
    <div className="follow-xp" data-xp-type={type}>
      <div className="follow-xp-introduction">
        <div className="follow-xp-accent" aria-hidden="true" />
        <h1>{page.title}</h1>
        {page.subtitle && <p className="follow-xp-subtitle">{page.subtitle}</p>}
        <div className="follow-xp-intro-text">{page.intro.map((text, index) => <p key={index}>{text}</p>)}</div>
      </div>

      {page.guideHeading && (
        <section className="follow-xp-card follow-xp-guide" aria-labelledby={"xp-guide-" + type}>
          <div className="follow-xp-guide-columns">
            <img className="follow-xp-cover" src={guideCoverSrc} alt="The Adventure of Living with Jesus" />
            <div className="follow-xp-guide-copy">
              <h2 id={"xp-guide-" + type}>{page.guideHeading}</h2>
              {page.guideText.map((text, index) => <p key={index}>{text}</p>)}
              <a className="follow-xp-button" data-resource-path="/adv/begin-the-adventure" href={resourceHref("/adv/begin-the-adventure")}>{page.guideLabel ?? "Begin This Short Guide"}</a>
              <a className="follow-xp-listen" data-resource-path="/videos/Gods-Vision" href={resourceHref("/videos/Gods-Vision")}>
                <Icon name="play" /><span>Prefer to listen?  3 minutes — How God sees you now</span>
              </a>
            </div>
          </div>
          <div className="follow-xp-save">
            <span>Want to come back easily later?</span>
            <button className="follow-xp-button follow-xp-button-secondary" type="button" data-xp-share onClick={share}>Save or Send this page</button>
            <span className="follow-xp-share-status" role="status" data-xp-share-status>{shareStatus}</span>
          </div>
        </section>
      )}

      <section className="follow-xp-questions" aria-labelledby={"xp-questions-" + type}>
        <h2 id={"xp-questions-" + type}>{page.questionsTitle}</h2>
        <div className="follow-xp-question-grid">
          {page.questions.map(question => (
            <div className="follow-xp-question" key={question.href}>
              <Icon name="heart" />
              <a data-resource-path={question.href} data-question-link href={questionHref(question.href)}>{question.title}</a>
            </div>
          ))}
        </div>
      </section>

      <section className="follow-xp-card follow-xp-contact" aria-labelledby={"xp-contact-" + type}>
        <Icon name="message" />
        <h2 id={"xp-contact-" + type}>{page.contactHeading ?? "We’re Here If You Need Anything"}</h2>
        <p>{page.contactText}</p>
        <a className="follow-xp-button" data-contact-link href={messageHref ?? resourceHref("/message")}>Send a Message</a>
      </section>
    </div>
  );
}
