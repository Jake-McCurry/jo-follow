import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import "./_group.css";

const readings = [
  ["1. Embracing Your New Identity in Christ", "Who you really are is no longer decided by your past. It is declared by God."],
  ["2. Walking in Your New Identity", "A new identity is not only something to believe. It is something to live from, one step at a time."],
  ["3. You Are a Child of God", "You come as a son or daughter who already belongs."],
  ["4. You Are a Saint with a New Nature", "You are a saint learning to live as who you already are."],
];

export function Current() {
  return (
    <div className="identity-book min-h-screen bg-white px-5 py-7">
      <button className="mb-7 flex items-center gap-2 text-sm font-semibold text-[var(--slate)]">
        <ArrowLeft className="h-4 w-4" /> Back to Library
      </button>
      <article>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[var(--blue-100)] px-3 py-1 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="h-3.5 w-3.5" /> Go Further
        </div>
        <h1 className="mb-3 text-4xl font-bold leading-[1.08]">Your New Identity in Christ</h1>
        <p className="mb-7 font-serif text-xl italic text-[var(--slate)]">Embracing Who God Says You Are</p>
        <div className="space-y-4 text-[17px] leading-7 text-[var(--slate)]">
          <p>Something real has begun—and it is deeper than a fresh start.</p>
          <p>These nine short readings are for that settling. They are a slow look at what God has already declared.</p>
        </div>
        <button className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--blue-500)] px-5 py-3.5 font-bold text-white">
          Begin the first reading <ArrowRight className="h-4 w-4" />
        </button>
        <div className="mt-12 border-t border-[var(--blue-100)] pt-8">
          <h2 className="mb-5 text-2xl font-bold">The 9 Readings</h2>
          <div className="space-y-3">
            {readings.map(([title, description]) => (
              <div key={title} className="rounded-xl border border-[var(--blue-100)] p-4">
                <h3 className="mb-1 text-lg font-bold">{title}</h3>
                <p className="text-sm leading-5 text-[var(--slate)]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}