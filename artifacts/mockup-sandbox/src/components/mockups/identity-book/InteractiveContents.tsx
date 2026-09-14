import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Headphones,
  Pause,
  Quote,
  RotateCcw,
  Send,
  Sun,
  Type,
} from "lucide-react";
import "./_group.css";

type Reading = {
  slug: string;
  title: string;
  desc: string;
  body: string[];
  verse?: string;
};

const readings: Reading[] = [
  {
    slug: "embracing-your-new-identity-in-christ",
    title: "1. Embracing Your New Identity in Christ",
    desc: "Who you really are is no longer decided by your past. It is declared by God.",
    verse: "“If anyone is in Christ, he is a new creation.” — 2 Corinthians 5:17",
    body: [
      "Something real has begun—and it is deeper than a fresh start. In Christ, God has not merely forgiven what you have done. He has given you a new name.",
      "For years you may have answered to other names: failure, orphan, addict, the one who never measures up. Those names feel true because they are familiar. They are not the last word. The last word belongs to the One who made you and now lives in you.",
    ],
  },
  {
    slug: "walking-in-your-new-identity",
    title: "2. Walking in Your New Identity",
    desc: "A new identity is not only something to believe. It is something to live from, one step at a time.",
    body: [
      "You do not have to perform your way into belonging. The life of faith begins with receiving what God has already said, then letting that truth shape the next ordinary step.",
      "Some days, walking in your new identity will feel strong. Other days it will look like returning after you have wandered. Both are part of learning to walk with Jesus.",
    ],
  },
  {
    slug: "you-are-a-child-of-god",
    title: "3. You Are a Child of God",
    desc: "You do not approach God as a stranger hoping to be noticed. You come as a son or daughter who already belongs.",
    verse: "“See what kind of love the Father has given to us, that we should be called children of God.” — 1 John 3:1",
    body: [
      "The Father is not waiting for a more polished version of you. In Christ, you are welcomed before you have found the right words, fixed the old habits, or understood every question.",
      "Belonging is not a reward for getting everything right. It is the ground beneath your feet while you learn to trust.",
    ],
  },
  {
    slug: "you-are-a-saint-with-a-new-nature",
    title: "4. You Are a Saint with a New Nature",
    desc: "In Christ you are not a condemned sinner trying to become acceptable. You are a saint learning to live as who you already are.",
    body: [
      "God sees more than the patterns you are trying to leave behind. He sees the new life He has planted in you. Your failures are real, but they are not your truest definition.",
      "Grace does not excuse the old life; it gives you a new place from which to face it. You can tell the truth without being crushed by it.",
    ],
  },
  {
    slug: "you-are-a-member-of-the-body-of-christ",
    title: "5. You Are a Member of the Body of Christ",
    desc: "You were not saved to stand alone. You were placed in a living body where your life is needed.",
    body: [
      "There is a place for your particular story, your care, and your imperfect offering. The church is not a room full of finished people; it is a people learning to carry one another.",
      "When you receive help, you are not a burden. When you offer what you have, you are not trying to earn your place. You are participating in the life of the body.",
    ],
  },
  {
    slug: "you-are-a-citizen-of-gods-kingdom",
    title: "6. You Are a Citizen of God’s Kingdom",
    desc: "Your true citizenship is not of this world. You now belong to an unshakable kingdom and represent its King.",
    body: [
      "The places you have lived and the things that have shaped you matter. They are not, however, the deepest place you belong. Jesus gives you a kingdom that cannot be taken away by a change in circumstances.",
      "This belonging makes room for courage and gentleness. You can live with open hands because your future is held.",
    ],
  },
  {
    slug: "choosing-wisely-with-your-new-identity",
    title: "7. Choosing Wisely with Your New Identity",
    desc: "Every choice either agrees with who you are in Christ or returns to an old name God has already taken away.",
    body: [
      "The next decision does not have to carry the weight of your whole life. Ask a smaller question: what would agree with the person God is making me today?",
      "Wisdom often arrives quietly. It may be an honest conversation, a boundary, a pause, or the choice to ask for help before the old pattern takes over.",
    ],
  },
  {
    slug: "living-out-your-new-identity-daily",
    title: "8. Living Out Your New Identity Daily",
    desc: "Identity becomes real not in a single moment of insight, but in the quiet practices of an ordinary day.",
    body: [
      "Most transformation happens without an audience. It happens in the first thought of the morning, in the way you speak to yourself, and in the small decision to stay present with God.",
      "You are allowed to begin again today. A faithful life is not a flawless life; it is a life that keeps turning toward home.",
    ],
  },
  {
    slug: "living-supernaturally-in-your-new-identity",
    title: "9. Living Supernaturally in Your New Identity",
    desc: "The new life God has given you is not merely improved. It is empowered by His Spirit for freedom, peace, and endurance.",
    body: [
      "You were never meant to manufacture this life alone. The Spirit of God is present in your weakness—not as pressure to try harder, but as a steady strength you can receive.",
      "The old names may still speak. They do not get to name you. God already has: beloved, forgiven, alive, and His.",
    ],
  },
];

const storageKey = "fjo-identity-book-last-reading";

export function InteractiveContents() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [fontScale, setFontScale] = useState(1);
  const [nightPage, setNightPage] = useState(false);
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showVerse, setShowVerse] = useState(false);

  useEffect(() => {
    const last = Number(localStorage.getItem(storageKey));
    if (Number.isInteger(last) && last >= 0 && last < readings.length) setActiveIndex(last);
  }, []);

  useEffect(() => {
    if (activeIndex !== null) localStorage.setItem(storageKey, String(activeIndex));
  }, [activeIndex]);

  const activeReading = activeIndex === null ? null : readings[activeIndex];
  const progress = activeIndex === null ? 0 : ((activeIndex + 1) / readings.length) * 100;
  const visibleReadings = showAll ? readings : readings.slice(0, 4);
  const statusText = useMemo(() => (saved ? "Saved only on this device" : "Private note, stored only here"), [saved]);

  const openReading = (index: number) => {
    setActiveIndex(index);
    setListening(false);
    setShowVerse(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleListen = () => {
    if (!activeReading) return;
    if (!listening) {
      window.speechSynthesis?.cancel();
      window.speechSynthesis?.speak(new SpeechSynthesisUtterance(`${activeReading.title}. ${activeReading.body.join(" ")}`));
    } else {
      window.speechSynthesis?.cancel();
    }
    setListening((value) => !value);
  };

  if (activeReading) {
    const readingIndex = activeIndex ?? 0;
    return (
      <main className={`identity-book min-h-[100dvh] px-5 pb-12 pt-5 transition-colors duration-300 ${nightPage ? "bg-[#183b55] text-[#f2eadf]" : "bg-[#f7f5ef] text-[var(--navy)]"}`}>
        <div className="mx-auto max-w-xl">
          <header className="mb-10 flex items-center justify-between">
            <button onClick={() => setActiveIndex(null)} className="flex items-center gap-2 text-sm font-semibold text-[var(--slate)] transition-transform active:translate-x-[-2px]" aria-label="Back to contents">
              <ArrowLeft className="h-4 w-4" /> Contents
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setNightPage((value) => !value)} className="rounded-full border border-current/15 p-2.5 text-[var(--slate)]" aria-label="Toggle page color">
                {nightPage ? <Sun className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
              <button onClick={() => setFontScale((value) => value === 1.12 ? 1 : value + 0.06)} className="flex items-center gap-1 rounded-full border border-current/15 px-3 py-2 text-xs font-bold text-[var(--slate)]" aria-label="Change text size">
                <Type className="h-4 w-4" /> Aa
              </button>
            </div>
          </header>
          <div className="mb-8 h-1 overflow-hidden rounded-full bg-[var(--blue-100)]/70">
            <div className="h-full rounded-full bg-[var(--blue-500)] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="mb-8 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-[var(--slate)]">
            <span>Reading {readingIndex + 1} of 9</span>
            <span>About 4 min</span>
          </div>
          <article style={{ fontSize: `${fontScale}rem` }}>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.15em] text-[var(--warm-700)]">Your new identity in Christ</p>
            <h1 className="mb-6 text-[2.55rem] font-semibold leading-[1.08]">{activeReading.title.replace(/^\d+\.\s/, "")}</h1>
            <p className="mb-8 font-serif text-xl italic leading-8 text-[var(--slate)]">{activeReading.desc}</p>
            <div className="space-y-6 text-[1.08em] leading-[1.8] text-[var(--slate)]">
              {activeReading.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            {activeReading.verse && (
              <button onClick={() => setShowVerse((value) => !value)} className="my-9 flex w-full items-start gap-3 rounded-2xl border-l-4 border-[var(--warm-500)] bg-[var(--warm-50)] p-5 text-left text-base leading-7 text-[var(--navy)]">
                <Quote className="mt-1 h-4 w-4 shrink-0 text-[var(--warm-700)]" />
                <span>{activeReading.verse}{showVerse && <span className="mt-2 block text-sm font-semibold text-[var(--warm-700)]">Open this reference in a Bible →</span>}</span>
              </button>
            )}
            <div className="my-9 flex flex-wrap items-center gap-3">
              <button onClick={toggleListen} className="inline-flex items-center gap-2 rounded-full bg-[var(--blue-900)] px-4 py-2.5 text-sm font-bold text-white transition-transform active:scale-95">
                {listening ? <Pause className="h-4 w-4" /> : <Headphones className="h-4 w-4" />} {listening ? "Pause reading" : "Listen"}
              </button>
              <span className="text-xs text-[var(--slate)]">Optional audio for tired eyes</span>
            </div>
            <div className="rounded-2xl border border-[var(--blue-100)] bg-[var(--blue-50)]/70 p-5">
              <p className="mb-2 text-sm font-bold">A quiet question</p>
              <p className="mb-4 text-sm leading-6 text-[var(--slate)]">Which old name are you ready to stop carrying today?</p>
              <textarea value={note} onChange={(event) => { setNote(event.target.value); setSaved(false); }} placeholder="Write a few honest words…" className="min-h-24 w-full resize-none rounded-xl border border-[var(--blue-100)] bg-[#fffdfa] p-3 text-sm outline-none ring-[var(--blue-500)] focus:ring-2" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-[var(--slate)]">{statusText}</span>
                <button onClick={() => setSaved(true)} className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--blue-800)]">{saved ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />} {saved ? "Saved" : "Keep this note"}</button>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--slate)]">Not synced or backed up. This note can be lost if you clear browser data or change devices.</p>
            </div>
          </article>
          <nav className="mt-12 grid grid-cols-2 gap-3 border-t border-current/10 pt-6">
            <button onClick={() => openReading(readingIndex - 1)} disabled={readingIndex === 0} className="flex items-center gap-2 rounded-xl border border-current/10 p-4 text-left text-sm font-bold disabled:opacity-30"><ArrowLeft className="h-4 w-4" /><span><small className="block font-normal text-[var(--slate)]">Previous</small>{readingIndex > 0 ? readings[readingIndex - 1].title.replace(/^\d+\.\s/, "").slice(0, 19) + "…" : "First reading"}</span></button>
            <button onClick={() => readingIndex < readings.length - 1 && openReading(readingIndex + 1)} disabled={readingIndex === readings.length - 1} className="flex items-center justify-end gap-2 rounded-xl border border-current/10 p-4 text-right text-sm font-bold disabled:opacity-30"><span><small className="block font-normal text-[var(--slate)]">Next reading</small>{readingIndex < readings.length - 1 ? readings[readingIndex + 1].title.replace(/^\d+\.\s/, "").slice(0, 19) + "…" : "You are at the end"}</span><ArrowRight className="h-4 w-4" /></button>
          </nav>
        </div>
      </main>
    );
  }

  return (
    <main className="identity-book min-h-[100dvh] bg-[#f7f5ef] px-5 pb-14 pt-6 text-[var(--navy)]">
      <div className="mx-auto max-w-xl">
        <header className="mb-12 flex items-center justify-between">
          <button className="flex items-center gap-2 text-sm font-semibold text-[var(--slate)]"><ArrowLeft className="h-4 w-4" /> Back to Library</button>
          <span className="rounded-full bg-[var(--blue-100)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--blue-900)]">Go Further</span>
        </header>
        <section className="relative mb-12 overflow-hidden rounded-[1.75rem] bg-[var(--blue-900)] px-6 pb-7 pt-7 text-[#f7f5ef] shadow-[0_18px_45px_rgba(0,58,102,.15)]">
          <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full border border-[var(--blue-500)]/40" />
          <div className="absolute -right-3 top-[-5px] h-28 w-28 rounded-full border border-[var(--blue-500)]/25" />
          <BookOpen className="mb-8 h-6 w-6 text-[var(--blue-100)]" />
          <h1 className="mb-4 text-[2.7rem] font-semibold leading-[1.06]">Your New Identity<br /><span className="text-[var(--blue-100)]">in Christ</span></h1>
          <p className="mb-6 font-serif text-xl italic leading-8 text-[#d7eaf4]">Embracing Who God Says You Are</p>
          <div className="space-y-4 text-[1.05rem] leading-7 text-[#d7eaf4]">
            <p>Something real has begun—and it is deeper than a fresh start.</p>
            <p>These nine short readings are for that settling. They are a slow look at what God has already declared.</p>
          </div>
          <button onClick={() => openReading(0)} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--warm-500)] px-5 py-3.5 font-bold text-white transition-transform active:scale-[.98]">Begin the first reading <ArrowRight className="h-4 w-4" /></button>
        </section>
        <div className="mb-7 flex items-end justify-between">
          <div><p className="mb-1 text-sm font-bold uppercase tracking-[0.14em] text-[var(--warm-700)]">A companion for the road</p><h2 className="text-2xl font-semibold">The 9 readings</h2></div>
          <span className="text-sm text-[var(--slate)]">Start anywhere</span>
        </div>
        <div className="space-y-3">
          {visibleReadings.map((reading, index) => (
            <button key={reading.slug} onClick={() => openReading(index)} className="group flex w-full items-start gap-4 rounded-2xl border border-[var(--blue-100)] bg-[#fffdfa] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--blue-500)] hover:shadow-[0_8px_22px_rgba(0,78,138,.08)]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--blue-50)] text-sm font-bold text-[var(--blue-800)]">{index + 1}</span>
              <span className="min-w-0 flex-1"><span className="mb-1 block text-[1.05rem] font-bold leading-6">{reading.title.replace(/^\d+\.\s/, "")}</span><span className="block text-sm leading-5 text-[var(--slate)]">{reading.desc}</span></span>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--blue-500)] transition-transform group-hover:translate-x-1" />
            </button>
          ))}
        </div>
        <button onClick={() => setShowAll((value) => !value)} className="mx-auto mt-6 flex items-center gap-2 rounded-full border border-[var(--blue-100)] px-4 py-2 text-sm font-bold text-[var(--blue-800)]">{showAll ? "Show fewer readings" : "Show all 9 readings"} <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`} /></button>
        <footer className="mt-14 border-t border-[var(--blue-100)] pt-6 text-sm leading-6 text-[var(--slate)]"><p className="font-serif text-lg italic text-[var(--navy)]">Read them in order if you can. Or open the one that names the old label you still hear.</p><p className="mt-4 flex items-center gap-2"><RotateCcw className="h-4 w-4 text-[var(--warm-700)]" /> Your place is remembered on this device.</p></footer>
      </div>
    </main>
  );
}