'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useId, useMemo, useRef } from 'react';

interface SealedSmokeWispsProps {
  /** Y coordinate of the wick / emission point in the 0-100 SVG viewBox */
  wickY: number;
  /** X coordinate of the emission origin (default: 50 = center) */
  wickX?: number;
}

// ---------------------------------------------------------------------------
// Tuning constants — adjust these to dial in the look
// ---------------------------------------------------------------------------

// General
const SMOKE_COLOR = '#94a3b8';
const RISE_HEIGHT = 120; // total height of smoke column in SVG units
const REVEAL_DURATION = 3; // seconds for initial bottom-to-top reveal

// Strand appearance
const STRAND_A_WIDTH = 2;
const STRAND_B_WIDTH = 1.2;
const STRAND_A_OPACITY = 0.4;
const STRAND_B_OPACITY = 0.35;
const FILL_OPACITY = 0.08;

// Shared snake motion — lateral sway that moves both strands as a column
const SNAKE_LOW_FREQ = 1.3; // oscillation speed near the base
const SNAKE_LOW_AMP = 2; // lateral amplitude near the base
const SNAKE_MID_FREQ = 0.9; // oscillation speed at midpoint
const SNAKE_MID_AMP = 4; // lateral amplitude at midpoint
const SNAKE_MID_PHASE = 0.5; // phase offset for mid oscillation
const SNAKE_HIGH_FREQ = 0.7; // oscillation speed near the top
const SNAKE_HIGH_AMP = 5; // lateral amplitude near the top
const SNAKE_HIGH_PHASE = 1.2; // phase offset for top oscillation

// Per-strand crossover drift — independent lateral motion at the midpoint
const CROSSOVER_FREQ = 0.45; // how fast strands drift apart / cross
const CROSSOVER_AMP = 6; // max lateral offset per strand at midpoint
const CROSSOVER_PHASE_B = 2.2; // phase offset between strand A and B

// Strand spread — static spacing between strands at base and top
const SPREAD_BASE = 0.5; // spacing at the wick (near 0 = start together)
const SPREAD_TOP = 0.2; // spacing at the top endpoint

// Control point Y positions (as fraction of RISE_HEIGHT from wick)
const CP1_Y_FRAC = 0.4; // first control point height
const CP2_Y_FRAC = 0.7; // second control point height

// Opacity taper gradient stops
const TAPER_MID_OFFSET = '65%'; // where opacity starts fading faster
const TAPER_MID_OPACITY = 0.5; // opacity at mid-taper point
const TAPER_END_OPACITY = 0; // opacity at the very top

// Wind gust
const BASE_STRAND_SPEED = 2; // normal phase accumulation speed
const GUST_CHANCE_PER_FRAME = 0.003; // probability per frame (~every 5.5s at 60fps)
const GUST_STRENGTH = 10; // how much faster snaking gets during a gust
const GUST_DECAY = 0.985; // exponential decay per frame (lower = faster fade)

// ---------------------------------------------------------------------------
// Path builder — two strands + fill, snaking over time
// ---------------------------------------------------------------------------

function buildPaths(wickX: number, wickY: number, t: number) {
  const endY = wickY - RISE_HEIGHT;

  // Shared snake motion — both strands move together as a column
  const snakeLow = Math.sin(t * SNAKE_LOW_FREQ) * SNAKE_LOW_AMP;
  const snakeMid =
    Math.sin(t * SNAKE_MID_FREQ + SNAKE_MID_PHASE) * SNAKE_MID_AMP;
  const snakeHigh =
    Math.sin(t * SNAKE_HIGH_FREQ + SNAKE_HIGH_PHASE) * SNAKE_HIGH_AMP;

  // Per-strand lateral oscillation at midpoint — enables crossover
  const strandADrift = Math.sin(t * CROSSOVER_FREQ) * CROSSOVER_AMP;
  const strandBDrift =
    Math.sin(t * CROSSOVER_FREQ + CROSSOVER_PHASE_B) * CROSSOVER_AMP;

  const cpY1 = wickY - RISE_HEIGHT * CP1_Y_FRAC;
  const cpY2 = wickY - RISE_HEIGHT * CP2_Y_FRAC;

  // Left strand — shared snake + its own drift
  const aCP1x = wickX + snakeLow - SPREAD_BASE;
  const aCP2x = wickX + snakeMid + strandADrift;
  const aEndX = wickX + snakeHigh - SPREAD_TOP;

  // Right strand — shared snake + its own drift
  const bCP1x = wickX + snakeLow + SPREAD_BASE;
  const bCP2x = wickX + snakeMid + strandBDrift;
  const bEndX = wickX + snakeHigh + SPREAD_TOP;

  const strandA = `M ${wickX} ${wickY} C ${aCP1x} ${cpY1}, ${aCP2x} ${cpY2}, ${aEndX} ${endY}`;
  const strandB = `M ${wickX} ${wickY} C ${bCP1x} ${cpY1}, ${bCP2x} ${cpY2}, ${bEndX} ${endY}`;

  const fillPath = [
    `M ${wickX} ${wickY}`,
    `C ${aCP1x} ${cpY1}, ${aCP2x} ${cpY2}, ${aEndX} ${endY}`,
    `L ${bEndX} ${endY}`,
    `C ${bCP2x} ${cpY2}, ${bCP1x} ${cpY1}, ${wickX} ${wickY}`,
    'Z',
  ].join(' ');

  return { strandA, strandB, fillPath };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SealedSmokeWisps({ wickY, wickX = 50 }: SealedSmokeWispsProps) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  const id = rawId.replace(/:/g, '');

  const strandARef = useRef<SVGPathElement>(null);
  const strandBRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<SVGPathElement>(null);

  // Wind gust state — accumulated phase + gust multiplier
  const phaseRef = useRef(0);
  const gustRef = useRef(0);
  const lastTimeRef = useRef(0);

  const initial = useMemo(() => buildPaths(wickX, wickY, 0), [wickX, wickY]);
  const endY = wickY - RISE_HEIGHT;

  const gradientId = `smoke-grad-${id}`;
  const maskId = `smoke-mask-${id}`;

  // Animate snaking via rAF with variable-speed phase accumulation
  useEffect(() => {
    if (shouldReduceMotion) return;

    let rafId: number;
    lastTimeRef.current = performance.now();
    phaseRef.current = 0;
    gustRef.current = 0;

    const tick = () => {
      const now = performance.now();
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Decay gust strength exponentially
      gustRef.current *= GUST_DECAY;

      // Random gust trigger
      if (Math.random() < GUST_CHANCE_PER_FRAME) {
        gustRef.current = GUST_STRENGTH;
      }

      // Accumulate phase at variable speed (higher during gusts)
      const speed = BASE_STRAND_SPEED + gustRef.current;
      phaseRef.current += dt * speed;

      const paths = buildPaths(wickX, wickY, phaseRef.current);

      strandARef.current?.setAttribute('d', paths.strandA);
      strandBRef.current?.setAttribute('d', paths.strandB);
      fillRef.current?.setAttribute('d', paths.fillPath);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [wickX, wickY, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <g>
        <path
          d={initial.strandA}
          stroke={SMOKE_COLOR}
          strokeWidth={STRAND_A_WIDTH}
          fill="none"
          opacity={0.3}
          strokeLinecap="round"
        />
      </g>
    );
  }

  return (
    <g>
      <defs>
        {/* Gradient for position-based opacity taper: opaque at base → transparent at top */}
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={wickX}
          y1={wickY}
          x2={wickX}
          y2={endY}
        >
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop
            offset={TAPER_MID_OFFSET}
            stopColor="white"
            stopOpacity={TAPER_MID_OPACITY}
          />
          <stop
            offset="100%"
            stopColor="white"
            stopOpacity={TAPER_END_OPACITY}
          />
        </linearGradient>

        {/* Mask combines the taper gradient with an initial bottom-to-top reveal */}
        <mask id={maskId}>
          <motion.rect
            x={-20}
            width={140}
            fill={`url(#${gradientId})`}
            initial={{ y: wickY, height: 0 }}
            animate={{ y: endY, height: RISE_HEIGHT }}
            transition={{ duration: REVEAL_DURATION, ease: 'easeOut' }}
          />
        </mask>
      </defs>

      <g mask={`url(#${maskId})`}>
        {/* Grey fill between strands */}
        <path
          ref={fillRef}
          d={initial.fillPath}
          fill={SMOKE_COLOR}
          opacity={FILL_OPACITY}
        />

        {/* Left strand */}
        <path
          ref={strandARef}
          d={initial.strandA}
          stroke={SMOKE_COLOR}
          strokeWidth={STRAND_A_WIDTH}
          fill="none"
          opacity={STRAND_A_OPACITY}
          strokeLinecap="round"
        />

        {/* Right strand */}
        <path
          ref={strandBRef}
          d={initial.strandB}
          stroke={SMOKE_COLOR}
          strokeWidth={STRAND_B_WIDTH}
          fill="none"
          opacity={STRAND_B_OPACITY}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}
