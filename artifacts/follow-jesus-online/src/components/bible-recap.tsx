const questions = [
  ["R", "Revelation", "Is there a revelation about God that I should embrace?", "bg-[#ffc86b]"],
  ["E", "Example", "Is there an example I should follow or avoid?", "bg-[#76dbea]"],
  ["C", "Command", "Is there a command I should obey?", "bg-[#f47c62]"],
  ["A", "Application", "Is there something I need to apply to my life?", "bg-[#84e69a]"],
  ["P", "Promise", "Is there a promise I should claim?", "bg-[#c49add]"],
] as const

export function BibleRecap() {
  return (
    <aside
      className="rounded-2xl border border-[#b9d9f3] bg-[#eff8ff] p-5 shadow-sm lg:sticky lg:top-24"
      aria-labelledby="recap-heading"
    >
      <h2 id="recap-heading" className="text-2xl font-bold text-[#073192]">
        R.E.C.A.P.
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-foreground/75">
        When you read the Bible, you can ask one or more of the following five questions.
      </p>

      <div className="mt-5 space-y-3" role="list" aria-label="R.E.C.A.P. Bible reading questions">
        {questions.map(([letter, label, question, color]) => (
          <div
            key={letter}
            className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 gap-y-2 sm:grid-cols-[2.25rem_7.25rem_minmax(0,1fr)] sm:items-center"
            role="listitem"
            aria-label={`${letter}: ${label}. ${question}`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-black ${color}`}
              aria-hidden="true"
            >
              {letter}
            </span>
            <span className={`rounded-xl px-3 py-2 text-sm font-bold leading-tight text-black ${color}`}>
              {label}
            </span>
            <p className="col-start-2 text-sm leading-relaxed text-foreground sm:col-start-auto">
              {question}
            </p>
          </div>
        ))}
      </div>
    </aside>
  )
}