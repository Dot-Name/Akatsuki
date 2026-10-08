const reviewPrompts = [
  'We welcome honest feedback from students and families, shared with their permission.',
  'Your experience can help another family get to know Akatsuki.',
  'Have a story to share? Message us and let us know.',
];

function NoteCard({ text, duplicate = false }) {
  return <article className="review-card" aria-hidden={duplicate || undefined}>
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C62828]/15 text-lg font-semibold text-[#F05A5A]" aria-hidden="true">“</span>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#F05A5A]">Family feedback</p>
        <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
      </div>
    </div>
    <p className="mt-4 border-t border-white/10 pt-3 text-xs font-semibold text-slate-400">Akatsuki · Mangol Puri</p>
  </article>;
}

function Lane({ direction, prompts }) {
  return <div className={`review-lane review-lane-${direction}`}>
    <div className="review-track">
      <div className="review-group">{prompts.map((text, i) => <NoteCard text={text} key={`${direction}-${i}`} />)}</div>
      <div className="review-group" aria-hidden="true">{prompts.map((text, i) => <NoteCard text={text} duplicate key={`${direction}-copy-${i}`} />)}</div>
    </div>
  </div>;
}

export default function ReviewsMarquee() {
  return <div className="reviews-marquee" aria-label="Family feedback notes; real reviews will be added with permission">
    <Lane direction="right" prompts={reviewPrompts} />
    <Lane direction="left" prompts={[...reviewPrompts].reverse()} />
  </div>;
}
