/**
 * Pass-through wrappers kept for backwards-compat with page.tsx. The original
 * framer-motion implementation had identical `initial` and `whileInView`
 * values, so the visible effect was already a no-op; the wrappers are now
 * plain server-rendered elements.
 */

export function AnimatedSection({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={className} {...rest}>
      {children}
    </section>
  );
}

export function AnimatedDiv({
  children,
  className,
  delay: _delay,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { delay?: number }) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}
