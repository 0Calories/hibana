'use client';

export function NewsletterForm() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex w-full gap-2"
    >
      <input
        type="email"
        placeholder="your@email.com"
        aria-label="Email address for newsletter"
        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none backdrop-blur-sm transition-colors focus:border-orange-500/50 focus:bg-white/[0.08]"
      />
      <button
        type="submit"
        className="group relative cursor-pointer overflow-hidden rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-400 hover:shadow-[0_0_30px_rgba(249,115,22,0.35)]"
      >
        <span className="relative z-10">Join Waitlist</span>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
      </button>
    </form>
  );
}
