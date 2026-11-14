/**
 * Decorative background art (study doodles + soft shapes).
 * Purely visual: aria-hidden, ignores clicks, hidden when printing.
 */

const CapDoodle = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /><path d="M22 10v6" />
  </svg>
);
const BookDoodle = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2Z" /><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7Z" />
  </svg>
);
const AtomDoodle = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="1.5" />
    <ellipse cx="12" cy="12" rx="10" ry="4" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
  </svg>
);
const PencilDoodle = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
  </svg>
);
const Star = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="m12 2 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 16.9 6.1 20.1l1.3-6.6L2.5 8.9l6.6-.8Z" />
  </svg>
);

/** Dark "chalkboard" decor for the login page. */
export function BoardDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden print:hidden">
      <div className="absolute w-[520px] h-[520px] rounded-full bg-[#172A4D] -top-52 -left-44" />
      <div className="absolute w-[360px] h-[360px] rounded-full bg-[#33290F] -bottom-36 -right-24" />
      <div className="absolute w-52 h-52 rounded-[48px] bg-[#172A4D] top-28 right-[12%] rotate-[18deg] hidden md:block" />
      <div className="absolute w-36 h-36 rounded-full bg-[#3A1D33] bottom-28 left-[16%] hidden md:block" />
      <Star className="absolute w-14 h-14 fill-yellow-400 top-36 left-[26%]" />
      <Star className="absolute w-8 h-8 fill-blue-400 bottom-64 right-[23%]" />

      <CapDoodle className="absolute w-28 h-28 stroke-slate-600 top-80 left-[10%] -rotate-12 hidden md:block" />
      <BookDoodle className="absolute w-24 h-24 stroke-slate-600 bottom-24 left-[33%] rotate-6 hidden md:block" />
      <AtomDoodle className="absolute w-28 h-28 stroke-slate-600 top-[460px] right-[10%] rotate-12 hidden md:block" />
      <PencilDoodle className="absolute w-24 h-24 stroke-slate-600 top-16 right-[28%] -rotate-[20deg] hidden md:block" />
      <span className="absolute text-[28px] font-semibold italic text-slate-600 top-[560px] left-[8%] -rotate-6 hidden md:block">a² + b² = c²</span>
      <span className="absolute text-2xl font-semibold italic text-slate-600 top-24 left-[14%] rotate-3 hidden md:block">E = mc²</span>
      <span className="absolute text-2xl font-semibold italic text-slate-600 bottom-14 right-[30%] hidden md:block">π ≈ 3.14</span>
    </div>
  );
}

/** Light "graph-paper" decor behind the app pages. */
export function PaperDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden print:hidden">
      <div className="absolute w-[420px] h-[420px] rounded-full bg-blue-100 -top-56 -right-28" />
      <div className="absolute w-60 h-60 rounded-full bg-yellow-100 -bottom-32 right-[22%]" />
      <CapDoodle className="absolute w-28 h-28 stroke-[#C3CEE2] top-[55%] right-8 rotate-12" />
      <PencilDoodle className="absolute w-24 h-24 stroke-[#C3CEE2] bottom-14 right-20 -rotate-[16deg]" />
      <BookDoodle className="absolute w-20 h-20 stroke-[#C3CEE2] bottom-24 left-[22%] rotate-6 hidden xl:block" />
    </div>
  );
}
