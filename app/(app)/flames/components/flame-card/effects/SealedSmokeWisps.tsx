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
const RISE_HEIGHT = 70; // total height of smoke column in SVG units
const REVEAL_DURATION = 3; // seconds for initial bottom-to-top reveal

// Strand appearance
const STRAND_A_WIDTH = 2;
const STRAND_B_WIDTH = 1.2;
const STRAND_A_OPACITY = 0.4;
const STRAND_B_OPACITY = 0.35;
const FILL_OPACITY = 0.08;

// Opacity taper gradient stops
const TAPER_MID_OFFSET = '65%'; // where opacity starts fading faster
const TAPER_MID_OPACITY = 0.5; // opacity at mid-taper point
const TAPER_END_OPACITY = 0.1; // opacity at the very top

// Wind gust — damped spring: impulse pushes smoke sideways, spring pulls it back
const PHASE_SPEED = 2; // constant phase accumulation speed
const GUST_CHANCE_PER_FRAME = 0.003; // probability per frame (~every 5.5s at 60fps)
const GUST_IMPULSE = 30; // velocity kick in SVG units/sec
const GUST_SPRING = 8; // restoring force (higher = snappier return)
const GUST_DAMPING = 4; // friction (higher = less oscillation after settling)

// Phase offset between strand A and B for crossover drift
const DRIFT_PHASE_B = 2.2;

// ---------------------------------------------------------------------------
// Anchor points — define the smoke path skeleton
// Points are denser toward the top for realistic dispersal detail.
// Each anchor specifies oscillation and spread parameters at that height.
// ---------------------------------------------------------------------------

const ANCHORS = [
  //           frac   snakeFreq  snakeAmp  snakePhase  driftFreq  driftAmp  spread  yOscAmp  yOscFreq
  { frac: 0, sf: 1.3, sa: 0, sp: 0, df: 0, da: 0, spread: 0.3, ya: 0, yf: 0 },
  {
    frac: 0.18,
    sf: 1.3,
    sa: 1.8,
    sp: 0.2,
    df: 0.3,
    da: 0,
    spread: 0.4,
    ya: 0,
    yf: 0,
  },
  {
    frac: 0.38,
    sf: 1.1,
    sa: 3.5,
    sp: 0.5,
    df: 0.4,
    da: 1.5,
    spread: 0.6,
    ya: 0,
    yf: 0,
  },
  {
    frac: 0.58,
    sf: 0.9,
    sa: 4.5,
    sp: 0.9,
    df: 0.5,
    da: 3,
    spread: 1.0,
    ya: 0.5,
    yf: 0.4,
  },
  {
    frac: 0.72,
    sf: 0.8,
    sa: 5,
    sp: 1.3,
    df: 0.8,
    da: 6,
    spread: 2.5,
    ya: 1.5,
    yf: 0.6,
  },
  {
    frac: 0.83,
    sf: 0.7,
    sa: 5,
    sp: 1.6,
    df: 1.1,
    da: 8,
    spread: 4,
    ya: 2.5,
    yf: 0.8,
  },
  {
    frac: 0.92,
    sf: 0.65,
    sa: 4.5,
    sp: 2.0,
    df: 1.4,
    da: 10,
    spread: 4.5,
    ya: 3,
    yf: 1.0,
  },
  {
    frac: 1.0,
    sf: 0.6,
    sa: 3.5,
    sp: 2.4,
    df: 1.7,
    da: 11,
    spread: 4,
    ya: 3.5,
    yf: 1.2,
  },
];

// ---------------------------------------------------------------------------
// Catmull-Rom spline → cubic Bézier conversion
// ---------------------------------------------------------------------------

type Pt = [number, number];

interface BezSeg {
  cp1: Pt;
  cp2: Pt;
  end: Pt;
}

function catmullRomSegments(points: Pt[]): BezSeg[] {
  const segs: BezSeg[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    segs.push({
      cp1: [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
      cp2: [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
      end: [p2[0], p2[1]],
    });
  }
  return segs;
}

function segsToPathStr(start: Pt, segs: BezSeg[]): string {
  let d = `M ${start[0]} ${start[1]}`;
  for (const s of segs) {
    d += ` C ${s.cp1[0]} ${s.cp1[1]}, ${s.cp2[0]} ${s.cp2[1]}, ${s.end[0]} ${s.end[1]}`;
  }
  return d;
}

function reverseSegs(start: Pt, segs: BezSeg[]): BezSeg[] {
  const starts: Pt[] = [start, ...segs.slice(0, -1).map((s) => s.end)];
  const rev: BezSeg[] = [];
  for (let i = segs.length - 1; i >= 0; i--) {
    rev.push({ cp1: segs[i].cp2, cp2: segs[i].cp1, end: starts[i] });
  }
  return rev;
}

// ---------------------------------------------------------------------------
// Path builder — two multi-segment strands + fill, snaking over time
// ---------------------------------------------------------------------------

function buildPaths(
  wickX: number,
  wickY: number,
  t: number,
  gustOffset: number,
) {
  const pointsA: Pt[] = [];
  const pointsB: Pt[] = [];

  for (const a of ANCHORS) {
    // Vertical position with subtle Y oscillation at upper points
    const y =
      wickY -
      RISE_HEIGHT * a.frac +
      (a.ya > 0 ? Math.sin(t * a.yf + a.frac * 3) * a.ya : 0);

    // Shared column sway (moves both strands together)
    const snake = Math.sin(t * a.sf + a.sp) * a.sa;

    // Wind gust lateral push — scales with height (base stays planted, top drifts most)
    const gust = gustOffset * a.frac;

    // Per-strand independent drift — creates crossovers
    const driftA = a.da > 0 ? Math.sin(t * a.df + a.frac * 1.5) * a.da : 0;
    const driftB =
      a.da > 0 ? Math.sin(t * a.df + a.frac * 1.5 + DRIFT_PHASE_B) * a.da : 0;

    pointsA.push([wickX + snake + gust + driftA - a.spread, y]);
    pointsB.push([wickX + snake + gust + driftB + a.spread, y]);
  }

  // Build strand paths via Catmull-Rom interpolation
  const segA = catmullRomSegments(pointsA);
  const segB = catmullRomSegments(pointsB);

  const strandA = segsToPathStr(pointsA[0], segA);
  const strandB = segsToPathStr(pointsB[0], segB);

  // Fill: forward along A → line to B end → reverse along B → close
  const revB = reverseSegs(pointsB[0], segB);
  let fillPath = segsToPathStr(pointsA[0], segA);
  const bEnd = pointsB[pointsB.length - 1];
  fillPath += ` L ${bEnd[0]} ${bEnd[1]}`;
  for (const s of revB) {
    fillPath += ` C ${s.cp1[0]} ${s.cp1[1]}, ${s.cp2[0]} ${s.cp2[1]}, ${s.end[0]} ${s.end[1]}`;
  }
  fillPath += ' Z';

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

  // Wind gust state — damped spring (position + velocity)
  const phaseRef = useRef(0);
  const gustPosRef = useRef(0);
  const gustVelRef = useRef(0);
  const lastTimeRef = useRef(0);

  const initial = useMemo(() => buildPaths(wickX, wickY, 0, 0), [wickX, wickY]);
  const endY = wickY - RISE_HEIGHT;

  const gradientId = `smoke-grad-${id}`;
  const maskId = `smoke-mask-${id}`;

  // Animate snaking via rAF with variable-speed phase accumulation
  useEffect(() => {
    if (shouldReduceMotion) return;

    let rafId: number;
    lastTimeRef.current = performance.now();
    phaseRef.current = 0;
    gustPosRef.current = 0;
    gustVelRef.current = 0;

    const tick = () => {
      const now = performance.now();
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Random gust trigger — apply impulse (always rightward)
      if (Math.random() < GUST_CHANCE_PER_FRAME) {
        gustVelRef.current += GUST_IMPULSE;
      }

      // Damped spring: acceleration = -spring * pos - damping * vel
      const acc =
        -GUST_SPRING * gustPosRef.current - GUST_DAMPING * gustVelRef.current;
      gustVelRef.current += acc * dt;
      gustPosRef.current += gustVelRef.current * dt;

      phaseRef.current += dt * PHASE_SPEED;

      const paths = buildPaths(
        wickX,
        wickY,
        phaseRef.current,
        gustPosRef.current,
      );

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
