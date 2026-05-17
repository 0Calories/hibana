/**
 * Decorative star-shaped sparkle particles. Deterministic seed values keep
 * server and client renders identical.
 */
const SPARKLES = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  x: 1 + ((i * 2741) % 90),
  y: 1 + ((i * 1723) % 90),
  size: 3 + ((i * 937) % 3),
  delay: ((i * 571) % 3000) / 1000,
  duration: 5 + ((i * 1291) % 5000) / 1000,
  rotation: (i * 433) % 30,
  color: i % 3 === 0 ? '#ffb3d9' : i % 2 === 0 ? '#E60076' : '#ffffff',
}));

export function SparkleEffect({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      {children}
      {SPARKLES.map((s) => (
        <span
          key={s.id}
          aria-hidden="true"
          className="pointer-events-none absolute motion-safe:animate-marketing-sparkle"
          style={
            {
              width: s.size,
              height: s.size,
              left: `${s.x}%`,
              top: `${s.y}%`,
              backgroundColor: s.color,
              boxShadow: `0 0 ${s.size * 2}px ${s.color}90`,
              opacity: 0,
              '--sparkle-duration': `${s.duration}s`,
              '--sparkle-delay': `${s.delay}s`,
              '--sparkle-rot': `${s.rotation}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}
