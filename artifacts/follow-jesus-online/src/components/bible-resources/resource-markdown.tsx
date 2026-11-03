import { Children, createContext, Fragment, isValidElement, useContext, useMemo, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "wouter";
import { ScripturePreview } from "@/components/bible-resources/scripture-preview";
import {
  assetUrl, isDiscussionHeading, isEquipUrl, normalizeSourceUrl, numericChapters, preprocessSurveyMarkdown,
  slugify, splitRefs, stripOutline,
} from "@/lib/bible-resources";
import { cn } from "@/lib/utils";

type Ctx = { book: string | null; links: Map<string, string>; inLink: boolean; survey: boolean };
const MdContext = createContext<Ctx>({ book: null, links: new Map(), inLink: false, survey: false });

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

function Enhanced({ children }: { children: ReactNode }) {
  const ctx = useContext(MdContext);
  if (ctx.inLink) return <>{children}</>;
  return (
    <>
      {Children.map(children, (child) => {
        if (typeof child !== "string") return child;
        const display = ctx.survey ? numericChapters(child) : child;
        return splitRefs(display, ctx.book).map((p, i) =>
          p.ref ? (
            <Fragment key={i}>
              {p.prefix}
              <ScripturePreview reference={p.ref}>{p.text}</ScripturePreview>
              {p.suffix}
            </Fragment>
          ) : <Fragment key={i}>{p.text}</Fragment>,
        );
      })}
    </>
  );
}

function MdLink({ href = "", children }: { href?: string; children?: ReactNode }) {
  const ctx = useContext(MdContext);
  const inner = <MdContext.Provider value={{ ...ctx, inLink: true }}>{children}</MdContext.Provider>;
  if (ctx.inLink) return <>{inner}</>;
  const mapped = ctx.links.get(normalizeSourceUrl(href));
  if (mapped) {
    return mapped.endsWith(".pdf")
      ? <a href={assetUrl(mapped)} download className="resource-link">{inner}</a>
      : <Link href={mapped} className="resource-link">{inner}</Link>;
  }
  if (isEquipUrl(href) || href.startsWith("/")) {
    const local = ctx.links.get(normalizeSourceUrl(href));
    // Uncrawled Equip destinations remain readable text; readers are never sent to Equip.
    if (!local) return <span>{inner}</span>;
    return <Link href={local} className="resource-link">{inner}</Link>;
  }
  if (/^mailto:|^https?:/i.test(href)) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className="resource-link">{inner}</a>;
  }
  return <span>{inner}</span>;
}

const components: Components = {
  ol: ({ children, start }) => {
    const { survey } = useContext(MdContext);
    return <ol start={start} style={survey ? { counterReset: `item ${(start ?? 1) - 1}` } : undefined}>{children}</ol>;
  },
  p: ({ children }) => {
    const t = textOf(children).trim();
    const theme = /^(overall\s+)?(theme|overview|key theme)\b/i.test(t);
    const note = /^(\(?note\b|\*?note:)/i.test(t);
    return <p className={cn(theme && "resource-theme", note && "resource-note")}><Enhanced>{children}</Enhanced></p>;
  },
  li: ({ children }) => <li><Enhanced>{children}</Enhanced></li>,
  strong: ({ children }) => <strong><Enhanced>{children}</Enhanced></strong>,
  em: ({ children }) => <em><Enhanced>{children}</Enhanced></em>,
  td: ({ children }) => <td><Enhanced>{children}</Enhanced></td>,
  blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  a: ({ href, children }) => <MdLink href={href}>{children}</MdLink>,
  img: () => null,
};

function headingComponents(survey: boolean): Components {
  const make = (Tag: "h2" | "h3" | "h4") => ({ children }: { children?: ReactNode }) => {
    const t = textOf(children).trim();
    const discussion = survey && isDiscussionHeading(t);
    const label = survey ? numericChapters(discussion ? stripOutline(t) : t) : t;
    return <Tag id={slugify(stripOutline(t))}>{survey ? label : children}</Tag>;
  };
  return { h1: make("h2"), h2: make("h2"), h3: make("h3"), h4: make("h4") };
}

type Section = { heading: string | null; level: number; body: string };
function splitSections(md: string): Section[] {
  const sections: Section[] = [{ heading: null, level: 0, body: "" }];
  let fence = false;
  for (const line of md.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const h = !fence && line.match(/^(#{1,3})\s+(.+?)\s*#*$/);
    if (h) sections.push({ heading: h[2].replace(/[*_`]/g, ""), level: h[1].length, body: `${line}\n` });
    else sections[sections.length - 1].body += `${line}\n`;
  }
  return sections.filter((s) => s.body.trim());
}

export function ResourceMarkdown({ markdown, book, links, survey }: {
  markdown: string; book: string | null; links: Map<string, string>; survey: boolean;
}) {
  const prepared = useMemo(() => (survey ? preprocessSurveyMarkdown(markdown) : markdown), [markdown, survey]);
  const sections = useMemo(() => splitSections(prepared), [prepared]);
  const all = useMemo(() => ({ ...components, ...headingComponents(survey) }), [survey]);
  const jumps = sections.filter((s) => s.heading && s.level <= 2);
  const ctx = useMemo(() => ({ book, links, inLink: false, survey }), [book, links, survey]);

  return (
    <MdContext.Provider value={ctx}>
      {survey && jumps.length >= 3 && (
        <nav aria-label="Sections in this lesson" className="resource-jumps">
          <p>In this lesson</p>
          <ul>
            {jumps.map((s, i) => {
              const t = isDiscussionHeading(s.heading!) ? stripOutline(s.heading!) : s.heading!;
              return <li key={i}><a href={`#${slugify(stripOutline(s.heading!))}`} data-testid={`link-jump-${i}`}>{numericChapters(t)}</a></li>;
            })}
          </ul>
        </nav>
      )}
      <div className={cn("resource-prose", survey && "resource-prose--survey")}>
        {sections.map((s, i) => {
          const discussion = survey && !!s.heading && isDiscussionHeading(s.heading);
          const theme = survey && !!s.heading && /^(overall\s+)?(theme|overview)\b/i.test(stripOutline(s.heading));
          return (
            <section key={i} className={cn(discussion && "resource-discussion", theme && "resource-theme-section")}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={all} skipHtml>{s.body}</ReactMarkdown>
            </section>
          );
        })}
      </div>
    </MdContext.Provider>
  );
}
