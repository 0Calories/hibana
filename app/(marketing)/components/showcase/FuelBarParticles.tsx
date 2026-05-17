// Deterministic seed values so server and client render identically.
// Mirrors the look of the in-app FuelDroplets/SmokePuffs without dragging the
// app-side particle engine into the marketing bundle.

const DROPLETS = [
  { size: 2.3, delay: 0.0, duration: 1.4, drift: -2 },
  { size: 2.6, delay: 0.3, duration: 1.5, drift: 1 },
  { size: 2.1, delay: 0.6, duration: 1.3, drift: -1 },
  { size: 2.8, delay: 0.9, duration: 1.6, drift: 2 },
  { size: 2.4, delay: 1.1, duration: 1.4, drift: 0 },
] as const;

const PUFFS = [
  { size: 3.5, delay: 0.0, duration: 2.0, drift: -5, blur: 1.8, peak: 0.28 },
  { size: 4.2, delay: 0.4, duration: 2.3, drift: 4, blur: 2.2, peak: 0.32 },
  { size: 3.8, delay: 0.7, duration: 2.1, drift: -3, blur: 1.6, peak: 0.24 },
  { size: 5.0, delay: 1.0, duration: 2.5, drift: 6, blur: 2.6, peak: 0.36 },
  { size: 3.2, delay: 1.3, duration: 1.9, drift: -2, blur: 1.5, peak: 0.22 },
  { size: 4.6, delay: 1.6, duration: 2.4, drift: 5, blur: 2.4, peak: 0.3 },
  { size: 3.6, delay: 1.9, duration: 2.0, drift: -4, blur: 1.7, peak: 0.26 },
] as const;

export function FuelDroplets({ className }: { className?: string }) {
  return (
    <>
      {DROPLETS.map((d, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: static deterministic list
          key={i}
          aria-hidden="true"
          className={`absolute motion-safe:animate-marketing-droplet ${className ?? ''}`}
          style={
            {
              width: d.size,
              height: d.size + 1,
              left: -d.size / 2,
              top: '50%',
              borderRadius: '40% 40% 50% 50%',
              opacity: 0,
              '--p-duration': `${d.duration}s`,
              '--p-delay': `${d.delay}s`,
              '--p-drift': `${d.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}

export function SmokePuffs({ color }: { color: string }) {
  return (
    <>
      {PUFFS.map((p, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: static deterministic list
          key={i}
          aria-hidden="true"
          className="absolute rounded-full motion-safe:animate-marketing-smoke"
          style={
            {
              width: p.size,
              height: p.size,
              left: -p.size / 2,
              top: '50%',
              filter: `blur(${p.blur}px)`,
              background: color,
              opacity: 0,
              '--p-duration': `${p.duration}s`,
              '--p-delay': `${p.delay}s`,
              '--p-drift': `${p.drift}px`,
              '--p-peak': p.peak,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}
