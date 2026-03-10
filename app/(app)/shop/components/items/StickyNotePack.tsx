/**
 * Sticky Note Pack SVG — 3D stack of 5 colorful post-it pads.
 * Right face + top face show pad edges using flame colors.
 * ClipPath rounds outer silhouette. Inner pad corners are sharp
 * so each layer connects flush — the pad behind fills the visual gap.
 *
 * Geometry: front face (18,25) 50×50, depth dx=+15 dy=-10.
 * Each pad strip: dx=3 dy=2. Pads front→back: teal→indigo→fuchsia→rose→orange.
 */
export function StickyNotePack({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="Sticky Note Pack"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="snp-clip">
          <path d="M21 75 L65 75 Q68 75 70.5 73.3 L80.5 66.7 Q83 65 83 62 L83 18 Q83 15 80 15 L36 15 Q33 15 30.5 16.7 L20.5 23.3 Q18 25 18 28 L18 72 Q18 75 21 75 Z" />
        </clipPath>
      </defs>

      <g clipPath="url(#snp-clip)">
        {/* Right face — 5 vertical strips, back→front (dark shades) */}
        <path d="M80 17 L83 15 L83 65 L80 67 Z" fill="#ea580c" />
        <path d="M77 19 L80 17 L80 67 L77 69 Z" fill="#e11d48" />
        <path d="M74 21 L77 19 L77 69 L74 71 Z" fill="#c026d3" />
        <path d="M71 23 L74 21 L74 71 L71 73 Z" fill="#4f46e5" />
        <path d="M68 25 L71 23 L71 73 L68 75 Z" fill="#0d9488" />

        {/* Top face — 5 horizontal strips, back→front (light shades) */}
        <path d="M30 17 L80 17 L83 15 L33 15 Z" fill="#fdba74" />
        <path d="M27 19 L77 19 L80 17 L30 17 Z" fill="#fda4af" />
        <path d="M24 21 L74 21 L77 19 L27 19 Z" fill="#f0abfc" />
        <path d="M21 23 L71 23 L74 21 L24 21 Z" fill="#a5b4fc" />
        <path d="M18 25 L68 25 L71 23 L21 23 Z" fill="#5eead4" />

        {/* Front face — top pad surface */}
        <rect x={18} y={25} width={50} height={50} fill="#14b8a6" />
      </g>
    </svg>
  );
}
