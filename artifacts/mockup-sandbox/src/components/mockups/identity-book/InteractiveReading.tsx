import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  Headphones,
  Info,
  Minus,
  Moon,
  Play,
  RotateCcw,
  Share2,
  Sun,
  X,
} from "lucide-react";
import "./_group.css";

const READING_KEY = "fjo-identity-reading-place";
const REFLECTION_KEY = "fjo-identity-reflection";

export function InteractiveReading() {
  const [largeType, setLargeType] = useState(false);
  const [night, setNight] = useState(false);
  const [listening, setListening] = useState(false);
  const [saved, setSaved] = useState(false);
  const [verseOpen, setVerseOpen] = useState(false);
  const [reflection, setReflection] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);

  useEffect(() => {
    setSaved(window.localStorage.getItem(READING_KEY) === "1");
    setReflection(window.localStorage.getItem(REFLECTION_KEY) ?? "");
  }, []);

  const paragraphs = useMemo(
    () => [
      "Something real has begun—and it is deeper than a fresh start. In Christ, God has not merely forgiven what you have done. He has given you a new name.",
      "For years you may have answered to other names: failure, orphan, addict, the one who never measures up. Those names feel true because they are familiar. They are not the last word.",
      "The last word belongs to the One who made you and now lives in you. You are not trying to become acceptable. In Christ, you are learning to live from a belonging that has already been given.",
    ],
    [],
  );

  const toggleListen = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (listening) {
      window.speechSynthesis.cancel();
      setListening(false);
      return;
    }
    const text = paragraphs.join(" ");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88;
    utterance.onend = () => setListening(false);
    window.speechSynthesis.speak(utterance);
    setListening(true);
  };

  const savePlace = () => {
    window.localStorage.setItem(READING_KEY, "1");
    setSaved(true);
  };

  const saveReflection = () => {
    window.localStorage.setItem(REFLECTION_KEY, reflection);
    setReflectionSaved(true);
    window.setTimeout(() => setReflectionSaved(false), 2200);
  };

  const shareReading = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Your New Identity in Christ",
        text: "A reading from Follow Jesus Online",
      });
    } else {
      await navigator.clipboard?.writeText(window.location.href);
      setSaved(true);
    }
  };

  const colors = night
    ? {
        page: "#123c5b",
        ink: "#edf8ff",
        muted: "#c5e0ef",
        surface: "#1c4b69",
        line: "#3d6c85",
        accent: "#99d6ff",
      }
    : {
        page: "#f7fbfd",
        ink: "#003a66",
        muted: "#2e5a7a",
        surface: "#e6f5ff",
        line: "#ccebff",
        accent: "#006bb3",
      };

  return (
    <main
      className="identity-book min-h-screen transition-colors duration-300"
      style={{ background: colors.page, color: colors.ink }}
    >
      <div className="mx-auto max-w-xl px-5 pb-10 pt-4">
        <header className="mb-7">
          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              aria-label="Back to the reading list"
              className="flex items-center gap-2 rounded-full py-2 pr-3 text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: colors.muted }}
            >
              <ArrowLeft className="h-4 w-4" /> Reading list
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={largeType ? "Use smaller text" : "Use larger text"}
                onClick={() => setLargeType((value) => !value)}
                className="flex h-9 items-center gap-1 rounded-full border px-2.5 text-xs font-bold"
                style={{ borderColor: colors.line, color: colors.muted }}
              >
                <Minus className="h-3 w-3" /> A <span className="text-base">A</span>
              </button>
              <button
                type="button"
                aria-label={night ? "Use light page" : "Use dark page"}
                onClick={() => setNight((value) => !value)}
                className="flex h-9 w-9 items-center justify-center rounded-full border"
                style={{ borderColor: colors.line, color: colors.muted }}
              >
                {night ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em]" style={{ color: colors.muted }}>
            <span>Reading 1 of 9</span>
            <span>About 4 min</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full" style={{ background: colors.line }}>
            <div className="h-full w-[11%] rounded-full" style={{ background: "#0095ff" }} />
          </div>
        </header>

        <article>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#c45100" }}>
            Your New Identity in Christ
          </p>
          <h1 className="mb-3 text-[2.45rem] font-semibold leading-[1.04] tracking-[-0.035em]">
            Embracing your new identity
          </h1>
          <p className="mb-6 font-serif text-xl italic" style={{ color: colors.muted }}>
            Who you really are is no longer decided by your past.
          </p>

          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleListen}
              className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-white transition-transform active:scale-[.97]"
              style={{ background: listening ? "#c45100" : "#006bb3" }}
            >
              {listening ? <X className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
              {listening ? "Stop listening" : "Listen"}
            </button>
            <button
              type="button"
              onClick={savePlace}
              className="flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold"
              style={{ borderColor: colors.line, color: colors.muted }}
            >
              {saved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {saved ? "Place saved" : "Save my place"}
            </button>
          </div>

          <div
            className="space-y-5 border-l-2 pl-5 transition-all duration-300"
            style={{
              borderColor: "#99d6ff",
              fontSize: largeType ? "1.2rem" : "1.08rem",
              lineHeight: largeType ? 1.85 : 1.72,
              color: colors.muted,
            }}
          >
            {paragraphs.map((paragraph, index) => (
              <p key={paragraph}>
                {index === 2 ? (
                  <>
                    The last word belongs to the One who made you and now lives in you. You are not trying to become
                    acceptable. In Christ, you are learning to live from a belonging that has already been given.
                  </>
                ) : (
                  paragraph
                )}
              </p>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setVerseOpen(true)}
            className="my-8 flex w-full items-start gap-3 rounded-2xl p-5 text-left transition-transform active:scale-[.99]"
            style={{ background: colors.surface }}
          >
            <span className="mt-0.5 text-2xl leading-none" style={{ color: "#0095ff" }}>
              “
            </span>
            <span>
              <span className="block font-serif text-lg italic leading-7" style={{ color: colors.ink }}>
                “If anyone is in Christ, there is a new creation.”
              </span>
              <span className="mt-2 flex items-center gap-1 text-sm font-bold" style={{ color: colors.accent }}>
                2 Corinthians 5:17 <Info className="h-3.5 w-3.5" />
              </span>
            </span>
          </button>

          <section className="rounded-2xl border p-5" style={{ borderColor: colors.line, background: night ? "rgba(255,255,255,.035)" : "#fff" }}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: colors.ink }}>A moment to sit with</p>
                <p className="text-sm" style={{ color: colors.muted }}>No right answer is needed.</p>
              </div>
              <ChevronDown className="h-4 w-4" style={{ color: colors.muted }} />
            </div>
            <label className="block text-base font-semibold leading-6" htmlFor="reflection">
              Which old name are you ready to stop carrying today?
            </label>
            <textarea
              id="reflection"
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              placeholder="Write a few honest words…"
              className="mt-4 min-h-24 w-full resize-none rounded-xl border bg-transparent p-3 text-base outline-none placeholder:opacity-60 focus:ring-2"
              style={{ borderColor: colors.line, color: colors.ink, outlineColor: "#0095ff" }}
            />
            <button
              type="button"
              onClick={saveReflection}
              className="mt-3 flex items-center gap-2 text-sm font-bold"
              style={{ color: colors.accent }}
            >
              {reflectionSaved ? <Check className="h-4 w-4" /> : null}
              {reflectionSaved ? "Saved only on this device" : "Keep this reflection"}
            </button>
            <p className="mt-2 text-xs leading-5" style={{ color: colors.muted }}>
              Not synced or backed up. This reflection can be lost if you clear browser data or change devices.
            </p>
          </section>

          <div className="mt-7 flex items-center justify-between">
            <button type="button" onClick={() => setSaved(false)} className="flex items-center gap-2 text-sm font-semibold" style={{ color: colors.muted }}>
              <RotateCcw className="h-4 w-4" /> Start over
            </button>
            <button type="button" onClick={shareReading} className="flex items-center gap-2 text-sm font-semibold" style={{ color: colors.muted }}>
              <Share2 className="h-4 w-4" /> Send this page
            </button>
          </div>

          <div className="mt-10 flex items-center justify-between border-t pt-6" style={{ borderColor: colors.line }}>
            <span className="text-sm font-semibold" style={{ color: colors.muted }}>Next: Walking in your new identity</span>
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ background: "#006bb3" }} aria-label="Next reading">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </article>
      </div>

      {verseOpen ? (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-[#003a66]/40 p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl p-6 shadow-xl" style={{ background: night ? "#1c4b69" : "#fff", color: colors.ink }}>
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em]" style={{ color: "#c45100" }}>Scripture</p>
                <h2 className="mt-1 text-2xl font-semibold">2 Corinthians 5:17</h2>
              </div>
              <button type="button" onClick={() => setVerseOpen(false)} aria-label="Close Scripture" className="rounded-full p-2" style={{ color: colors.muted }}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="font-serif text-xl italic leading-8" style={{ color: colors.muted }}>
              “Therefore, if anyone is in Christ, he is a new creation; the old has gone, the new has come!”
            </p>
            <a href="https://netbible.org/bible/2+Corinthians+5" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-bold" style={{ color: colors.accent }}>
              Read in NET Bible <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      ) : null}
      {listening ? <div className="sr-only"><Play /> Reading aloud</div> : null}
    </main>
  );
}