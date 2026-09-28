const questions = [
  { letter: "R", word: "REVELATION", before: "Is there a ", after: " about God that I should embrace?", color: "text-orange-700" },
  { letter: "E", word: "EXAMPLE", before: "Is there an ", after: " I should follow or avoid?", color: "text-blue-700" },
  { letter: "C", word: "COMMAND", before: "Is there a ", after: " I should obey?", color: "text-red-700" },
  { letter: "A", word: "APPLICATION", before: "Is there an ", after: " I should make in my life?", color: "text-green-700" },
  { letter: "P", word: "PROMISE", before: "Is there a ", after: " I should claim?", color: "text-purple-700" },
] as const

export function BibleRecap() {
  return (
    <aside
      className="rounded-2xl border border-warm-200 bg-white p-5 shadow-sm lg:sticky lg:top-24"
      aria-labelledby="recap-heading"
    >
      <h2 id="recap-heading" className="text-2xl font-bold text-foreground">
        R.E.C.A.P.
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-foreground/75">
        When you read the Bible, you can ask one or more of the following five questions.
      </p>

      <div className="mt-5 space-y-3" role="list" aria-label="R.E.C.A.P. Bible reading questions">
        {questions.map(({ letter, word, before, after, color }) => (
          <div
            key={letter}
            className="flex items-start gap-3"
            role="listitem"
          >
            <span
              className={`w-7 shrink-0 text-lg font-extrabold ${color}`}
              aria-hidden="true"
            >
              {letter}
            </span>
            <p className="text-sm leading-relaxed text-foreground">
              {before}<strong className={`font-extrabold ${color}`}>{word}</strong>{after}
            </p>
          </div>
        ))}
      </div>
    </aside>
  )
}