import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";
import { splitScriptureText } from "@/lib/scripture-text";

type Direction = "left" | "right";
type Tone = "warm" | "light";

export function NavigationChevrons({
  direction = "right",
  tone = "warm",
  className,
  ...props
}: SVGProps<SVGSVGElement> & { direction?: Direction; tone?: Tone }) {
  return (
    <svg
      {...props}
      viewBox="0 0 32 20"
      width="32"
      height="20"
      style={{ width: 32, height: 20, ...props.style }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-navigation-chevron={direction}
      className={cn("inline-block h-5 w-8 shrink-0 align-middle", tone === "light" ? "text-warm-200" : "text-warm-700", className)}
    >
      <g transform={direction === "left" ? "translate(32 0) scale(-1 1)" : undefined}>
        <path d="m3 4 6 6-6 6" />
        <path d="m12 4 6 6-6 6" />
        <path d="m21 4 6 6-6 6" />
      </g>
    </svg>
  );
}

export function ChevronLabel({
  text,
  direction = "right",
  tone = "warm",
  className,
  renderText: providedRenderText,
}: {
  text: string;
  direction?: Direction;
  tone?: Tone;
  className?: string;
  renderText?: (text: string) => ReactNode;
}) {
  const label = text.trimEnd();
  const renderText = providedRenderText ?? (value => value);
  if (direction === "left") {
    const firstPart = providedRenderText ? splitScriptureText(label)[0] : undefined;
    const space = label.indexOf(" ");
    const firstWordEnd = firstPart?.reference ? firstPart.text.length : space < 0 ? label.length : space;
    return (
      <span className={cn("min-w-0 max-w-full whitespace-normal", className)}>
        <span className="whitespace-nowrap">
          <NavigationChevrons direction="left" tone={tone} className="mr-1" />
          {renderText(label.slice(0, firstWordEnd))}
        </span>
        {renderText(label.slice(firstWordEnd))}
      </span>
    );
  }
  // Do not split a trailing Scripture preview into two incomplete references.
  const lastPart = providedRenderText ? splitScriptureText(label).at(-1) : undefined;
  const lastWordStart = lastPart?.reference ? label.length - lastPart.text.length : label.lastIndexOf(" ") + 1;
  return (
    <span className={cn("min-w-0 max-w-full whitespace-normal", className)}>
      {renderText(label.slice(0, lastWordStart))}
      <span className="whitespace-nowrap">
        {renderText(label.slice(lastWordStart))}
        <NavigationChevrons direction={direction} tone={tone} className="ml-1" />
      </span>
    </span>
  );
}
