const EMBER_DATA = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: (i * 2741) % 100,
  size: 2 + ((i * 1723) % 4),
  delay: ((i * 937) % 8000) / 1000,
  duration: 4 + ((i * 1291) % 6),
  drift: -30 + ((i * 571) % 60),
  color:
    i % 5 === 0
      ? '#E60076'
      : i % 3 === 0
        ? '#ff69b4'
        : i % 2 === 0
          ? '#ff91ce'
          : '#d4006a',
  opacity: 0.15 + ((i * 317) % 45) / 100,
}));

/**
 * Decorative ember particles drifting up from the hero. CSS keyframed; the
 * `motion-safe:` variant nukes the animation for reduced-motion users, and
 * the surrounding container hides the layer entirely in that case via the
 * `motion-reduce:hidden` utility.
 */
export function HeroEmbers() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
      {EMBER_DATA.map((ember) => (
        <span
          key={ember.id}
          aria-hidden="true"
          className="absolute rounded-full motion-safe:animate-marketing-ember"
          style={
            {
              left: `${ember.x}%`,
              bottom: '-5%',
              width: ember.size,
              height: ember.size,
              backgroundColor: ember.color,
              opacity: 0,
              '--ember-duration': `${ember.duration}s`,
              '--ember-delay': `${ember.delay}s`,
              '--ember-drift': `${ember.drift}px`,
              '--ember-opacity': ember.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
