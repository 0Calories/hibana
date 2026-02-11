'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useId, useMemo, useRef } from 'react';

interface SealedSmokeWispsProps {
  /** Y coordinate of the wick / emission point in the 0-100 SVG viewBox */
  wickY: number;
  /** X coordinate of the emission origin (default: 50 = center) */
  wickX?: number;
  /** Flame color for the tendril — defaults to grey smoke when omitted */
  color?: string;
  /** Height of smoke column in SVG units (default: 70) */
  riseHeight?: number;
  /** When true, renders only strand A — no strand B, fill, or dispersal wisps */
  simple?: boolean;
}

// ---------------------------------------------------------------------------
// Tuning constants — adjust these to dial in the look
// ---------------------------------------------------------------------------

// General
const SMOKE_COLOR_COOL = '#94a3b8'; // cool grey for upper smoke
const RISE_HEIGHT = 70; // total height of smoke column in SVG units
const REVEAL_DURATION = 3; // seconds for initial bottom-to-top reveal
const PHASE_SPEED = 2;

// Strand appearance
const STRAND_A_WIDTH = 2;
const STRAND_B_WIDTH = 1.2;
const STRAND_A_OPACITY = 0.4;
const STRAND_B_OPACITY = 0.35;
const FILL_OPACITY = 0.08;

// Opacity taper gradient stops — gradual fade so the top doesn't cut off abruptly
const TAPER_MID_OFFSET = '50%';
const TAPER_MID_OPACITY = 0.6;
const TAPER_UPPER_OFFSET = '80%';
const TAPER_UPPER_OPACITY = 0.15;
const TAPER_END_OPACITY = 0;

// Wind gust — damped spring: impulse pushes smoke sideways, spring pulls it back
const GUST_CHANCE_PER_FRAME = 0; // disabled — gusts feel too jarring
const GUST_IMPULSE = 30;
const GUST_SPRING = 8;
const GUST_DAMPING = 4;

// Phase offset between strand A and B for crossover drift
const DRIFT_PHASE_B = 2.2;

// Dispersal wisp fade — the opacity sweeps upward then reforms
const WISP_FADE_SPEED = 0.12; // cycles per second (~8s per full dissolve/reform)
const WISP_FADE_BAND = 0.15; // width of the opacity transition edge (0–1)

// Dispersal wisps — extra tendrils that peel off the main column in the upper region.
// Each wisp follows the column below divergeFrac, then smoothly diverges with unique drift.
// Above collapseFrac the wisp curls back inward (X converges) and downward (Y drops),
// creating a natural fold-over before fading out.
const DISPERSAL_WISPS = [
  {
    id: 'wisp-a',
    phaseOffset: 1.0,
    divergeFrac: 0.45,
    collapseFrac: 0.78,
    collapseDrop: 8,
    ampScale: 1.3,
    width: 0.8,
    opacity: 0.2,
  },
  {
    id: 'wisp-b',
    phaseOffset: 3.8,
    divergeFrac: 0.5,
    collapseFrac: 0.82,
    collapseDrop: 10,
    ampScale: 1.0,
    width: 0.6,
    opacity: 0.15,
  },
  {
    id: 'wisp-c',
    phaseOffset: 5.5,
    divergeFrac: 0.4,
    collapseFrac: 0.75,
    collapseDrop: 12,
    ampScale: 1.5,
    width: 0.7,
    opacity: 0.18,
  },
];

// ---------------------------------------------------------------------------
// Anchor points — define the smoke path skeleton.
// Points are denser toward the top for realistic dispersal detail.
// Each anchor specifies oscillation and spread parameters at that height.
// ---------------------------------------------------------------------------

interface Anchor {
  frac: number; // 0 = wick, 1 = top of column
  snakeFreq: number; // shared column sway frequency
  snakeAmp: number; // shared column sway amplitude
  snakePhase: number; // phase offset for snake oscillation
  driftFreq: number; // per-strand independent drift frequency
  driftAmp: number; // per-strand independent drift amplitude
  spread: number; // horizontal separation between strands A and B
  yOscAmp: number; // vertical oscillation amplitude
  yOscFreq: number; // vertical oscillation frequency
  turbAmp: number; // fine turbulence amplitude (high-freq jitter)
  turbFreq: number; // fine turbulence frequency
}

const ANCHORS: Anchor[] = [
  {
    frac: 0,
    snakeFreq: 1.3,
    snakeAmp: 0,
    snakePhase: 0,
    driftFreq: 0,
    driftAmp: 0,
    spread: 0.3,
    yOscAmp: 0,
    yOscFreq: 0,
    turbAmp: 0,
    turbFreq: 0,
  },
  {
    frac: 0.18,
    snakeFreq: 1.3,
    snakeAmp: 1.8,
    snakePhase: 0.2,
    driftFreq: 0.3,
    driftAmp: 0,
    spread: 0.4,
    yOscAmp: 0,
    yOscFreq: 0,
    turbAmp: 0,
    turbFreq: 0,
  },
  {
    frac: 0.38,
    snakeFreq: 1.1,
    snakeAmp: 3.5,
    snakePhase: 0.5,
    driftFreq: 0.4,
    driftAmp: 1.5,
    spread: 0.6,
    yOscAmp: 0,
    yOscFreq: 0,
    turbAmp: 0.3,
    turbFreq: 3.5,
  },
  {
    frac: 0.58,
    snakeFreq: 0.9,
    snakeAmp: 4.5,
    snakePhase: 0.9,
    driftFreq: 0.5,
    driftAmp: 3,
    spread: 1.0,
    yOscAmp: 0.5,
    yOscFreq: 0.4,
    turbAmp: 0.6,
    turbFreq: 4.0,
  },
  {
    frac: 0.72,
    snakeFreq: 0.8,
    snakeAmp: 5,
    snakePhase: 1.3,
    driftFreq: 0.8,
    driftAmp: 6,
    spread: 2.5,
    yOscAmp: 1.5,
    yOscFreq: 0.6,
    turbAmp: 1.0,
    turbFreq: 4.5,
  },
  {
    frac: 0.83,
    snakeFreq: 0.7,
    snakeAmp: 5,
    snakePhase: 1.6,
    driftFreq: 1.1,
    driftAmp: 8,
    spread: 4,
    yOscAmp: 2.5,
    yOscFreq: 0.8,
    turbAmp: 1.4,
    turbFreq: 5.0,
  },
  {
    frac: 0.92,
    snakeFreq: 0.65,
    snakeAmp: 4.5,
    snakePhase: 2.0,
    driftFreq: 1.4,
    driftAmp: 10,
    spread: 4.5,
    yOscAmp: 3,
    yOscFreq: 1.0,
    turbAmp: 1.6,
    turbFreq: 5.5,
  },
  {
    frac: 1.0,
    snakeFreq: 0.6,
    snakeAmp: 3.5,
    snakePhase: 2.4,
    driftFreq: 1.7,
    driftAmp: 11,
    spread: 4,
    yOscAmp: 3.5,
    yOscFreq: 1.2,
    turbAmp: 1.8,
    turbFreq: 6.0,
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
// Shared anchor position computation
// ---------------------------------------------------------------------------

function anchorPosition(
  anchor: Anchor,
  wickX: number,
  wickY: number,
  t: number,
  gustOffset: number,
  riseHeight: number = RISE_HEIGHT,
): { y: number; baseX: number } {
  const y =
    wickY -
    riseHeight * anchor.frac +
    (anchor.yOscAmp > 0
      ? Math.sin(t * anchor.yOscFreq + anchor.frac * 3) * anchor.yOscAmp
      : 0);

  const snake =
    Math.sin(t * anchor.snakeFreq + anchor.snakePhase) * anchor.snakeAmp;
  const gust = gustOffset * anchor.frac;
  const turb =
    anchor.turbAmp > 0
      ? Math.sin(t * anchor.turbFreq + anchor.frac * 7) * anchor.turbAmp
      : 0;

  return { y, baseX: wickX + snake + gust + turb };
}

// ---------------------------------------------------------------------------
// Path builder — two multi-segment strands + fill, snaking over time
// ---------------------------------------------------------------------------

function buildPaths(
  wickX: number,
  wickY: number,
  t: number,
  gustOffset: number,
  riseHeight: number = RISE_HEIGHT,
  simple: boolean = false,
) {
  const pointsA: Pt[] = [];
  const pointsB: Pt[] = [];

  for (const a of ANCHORS) {
    const { y, baseX } = anchorPosition(
      a,
      wickX,
      wickY,
      t,
      gustOffset,
      riseHeight,
    );

    // Per-strand independent drift — creates crossovers
    const driftA =
      a.driftAmp > 0
        ? Math.sin(t * a.driftFreq + a.frac * 1.5) * a.driftAmp
        : 0;
    const driftB =
      a.driftAmp > 0
        ? Math.sin(t * a.driftFreq + a.frac * 1.5 + DRIFT_PHASE_B) * a.driftAmp
        : 0;

    pointsA.push([baseX + driftA - a.spread, y]);
    pointsB.push([baseX + driftB + a.spread, y]);
  }

  // Build strand paths via Catmull-Rom interpolation
  const segA = catmullRomSegments(pointsA);
  const segB = catmullRomSegments(pointsB);

  const strandA = segsToPathStr(pointsA[0], segA);
  const strandB = segsToPathStr(pointsB[0], segB);

  let fillPath = '';
  const wisps: string[] = [];

  if (!simple) {
    // Fill: forward along A → line to B end → reverse along B → close
    const revB = reverseSegs(pointsB[0], segB);
    fillPath = segsToPathStr(pointsA[0], segA);
    const bEnd = pointsB[pointsB.length - 1];
    fillPath += ` L ${bEnd[0]} ${bEnd[1]}`;
    for (const s of revB) {
      fillPath += ` C ${s.cp1[0]} ${s.cp1[1]}, ${s.cp2[0]} ${s.cp2[1]}, ${s.end[0]} ${s.end[1]}`;
    }
    fillPath += ' Z';

    // Dispersal wisps — start near the diverge point (broken off from column),
    // drift outward, then collapse inward and curl downward near the top
    for (const w of DISPERSAL_WISPS) {
      const firstAbove = ANCHORS.findIndex((a) => a.frac >= w.divergeFrac);
      const startIdx = Math.max(0, firstAbove - 1);

      const pts: Pt[] = [];
      for (let ai = startIdx; ai < ANCHORS.length; ai++) {
        const a = ANCHORS[ai];
        let { y, baseX } = anchorPosition(
          a,
          wickX,
          wickY,
          t,
          gustOffset,
          riseHeight,
        );

        if (a.frac <= w.divergeFrac) {
          pts.push([baseX, y]);
        } else {
          // Above diverge: smoothly ramp up unique drift
          const raw = (a.frac - w.divergeFrac) / (1 - w.divergeFrac);
          const blend = raw * raw * (3 - 2 * raw); // smoothstep

          // Collapse phase: above collapseFrac, drift shrinks back toward center
          // and Y curls back downward
          let collapseScale = 1;
          if (a.frac > w.collapseFrac) {
            const cRaw = (a.frac - w.collapseFrac) / (1 - w.collapseFrac);
            const cBlend = cRaw * cRaw;
            collapseScale = 1 - cBlend * 0.85;
            y += cBlend * w.collapseDrop;
          }

          const drift =
            Math.sin(t * a.driftFreq * 1.3 + w.phaseOffset) *
            a.driftAmp *
            w.ampScale *
            blend *
            collapseScale;
          pts.push([baseX + drift, y]);
        }
      }
      wisps.push(segsToPathStr(pts[0], catmullRomSegments(pts)));
    }
  }

  return { strandA, strandB, fillPath, wisps };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SealedSmokeWisps({
  wickY,
  wickX = 50,
  color,
  riseHeight: riseHeightProp,
  simple = false,
}: SealedSmokeWispsProps) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  const id = rawId.replace(/:/g, '');

  const effectiveRiseHeight = riseHeightProp ?? RISE_HEIGHT;

  const strandARef = useRef<SVGPathElement>(null);
  const strandBRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const wispRefsRef = useRef<(SVGPathElement | null)[]>([]);
  const wispGradRefsRef = useRef<(SVGLinearGradientElement | null)[]>([]);

  // Wind gust state — damped spring (position + velocity)
  const phaseRef = useRef(0);
  const gustPosRef = useRef(0);
  const gustVelRef = useRef(0);
  const lastTimeRef = useRef(0);

  const initial = useMemo(
    () => buildPaths(wickX, wickY, 0, 0, effectiveRiseHeight, simple),
    [wickX, wickY, effectiveRiseHeight, simple],
  );
  const endY = wickY - effectiveRiseHeight;

  const gradientId = `smoke-grad-${id}`;
  const colorGradId = `smoke-color-${id}`;
  const maskId = `smoke-mask-${id}`;
  const wispGradIds = DISPERSAL_WISPS.map((w) => `wisp-grad-${w.id}-${id}`);

  const setWispRef = useCallback(
    (i: number) => (el: SVGPathElement | null) => {
      wispRefsRef.current[i] = el;
    },
    [],
  );

  const setWispGradRef = useCallback(
    (i: number) => (el: SVGLinearGradientElement | null) => {
      wispGradRefsRef.current[i] = el;
    },
    [],
  );

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
        effectiveRiseHeight,
        simple,
      );

      strandARef.current?.setAttribute('d', paths.strandA);
      if (!simple) {
        strandBRef.current?.setAttribute('d', paths.strandB);
        fillRef.current?.setAttribute('d', paths.fillPath);
      }

      for (let i = 0; i < paths.wisps.length; i++) {
        wispRefsRef.current[i]?.setAttribute('d', paths.wisps[i]);

        // Animate wisp fade: sweep transparency from bottom to top
        const grad = wispGradRefsRef.current[i];
        if (grad) {
          const w = DISPERSAL_WISPS[i];
          // Sawtooth: -0.3→1.3 range so wisp is fully visible briefly, then fades, then reforms
          const rawPhase =
            (phaseRef.current * WISP_FADE_SPEED + w.phaseOffset * 0.15) % 1;
          const fadePos = rawPhase * 1.6 - 0.3;
          const fadeEdge = Math.max(0, Math.min(1, fadePos));
          const peakEdge = Math.max(0, Math.min(1, fadePos + WISP_FADE_BAND));
          const stops = grad.children;
          (stops[1] as SVGStopElement).setAttribute('offset', String(fadeEdge));
          (stops[2] as SVGStopElement).setAttribute('offset', String(peakEdge));
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [wickX, wickY, shouldReduceMotion, effectiveRiseHeight, simple]);

  if (shouldReduceMotion) {
    return (
      <g>
        <path
          d={initial.strandA}
          stroke={SMOKE_COLOR_COOL}
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
        {/* Opacity taper gradient: opaque at base → transparent at top */}
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
            offset={TAPER_UPPER_OFFSET}
            stopColor="white"
            stopOpacity={TAPER_UPPER_OPACITY}
          />
          <stop
            offset="100%"
            stopColor="white"
            stopOpacity={TAPER_END_OPACITY}
          />
        </linearGradient>

        {/* Color gradient: warm brownish near wick → cool grey higher up (or flame color when provided) */}
        <linearGradient
          id={colorGradId}
          gradientUnits="userSpaceOnUse"
          x1={wickX}
          y1={wickY}
          x2={wickX}
          y2={endY}
        >
          <stop offset="0%" stopColor={color} />
          <stop
            offset="30%"
            stopColor={color ?? SMOKE_COLOR_COOL}
            stopOpacity={color ? 0.6 : 1}
          />
          <stop
            offset="100%"
            stopColor={color ?? SMOKE_COLOR_COOL}
            stopOpacity={color ? 0.2 : 1}
          />
        </linearGradient>

        {/* Per-wisp stroke gradients: 4-stop with animated fade sweep (skipped in simple mode) */}
        {!simple &&
          DISPERSAL_WISPS.map((w, i) => (
            <linearGradient
              key={w.id}
              ref={setWispGradRef(i)}
              id={wispGradIds[i]}
              gradientUnits="objectBoundingBox"
              x1="0.5"
              y1="1"
              x2="0.5"
              y2="0"
            >
              {/* stop 0: anchor at bottom — always transparent (faded zone) */}
              <stop offset="0" stopColor={SMOKE_COLOR_COOL} stopOpacity={0} />
              {/* stop 1: fade edge — animated, sweeps upward */}
              <stop offset="0" stopColor={SMOKE_COLOR_COOL} stopOpacity={0} />
              {/* stop 2: peak edge — animated, just above fade edge */}
              <stop
                offset={WISP_FADE_BAND}
                stopColor={SMOKE_COLOR_COOL}
                stopOpacity={w.opacity}
              />
              {/* stop 3: anchor at tip — always transparent */}
              <stop offset="1" stopColor={SMOKE_COLOR_COOL} stopOpacity={0} />
            </linearGradient>
          ))}

        {/* Mask combines the taper gradient with an initial bottom-to-top reveal */}
        <mask id={maskId}>
          <motion.rect
            x={-20}
            width={140}
            fill={`url(#${gradientId})`}
            initial={{ y: wickY, height: 0 }}
            animate={{ y: endY, height: effectiveRiseHeight }}
            transition={{ duration: REVEAL_DURATION, ease: 'easeOut' }}
          />
        </mask>
      </defs>

      <g mask={`url(#${maskId})`}>
        {/* Fill between strands (skipped in simple mode) */}
        {!simple && (
          <path
            ref={fillRef}
            d={initial.fillPath}
            fill={color ?? SMOKE_COLOR_COOL}
            opacity={FILL_OPACITY}
          />
        )}

        {/* Left strand — warm-to-cool color gradient */}
        <path
          ref={strandARef}
          d={initial.strandA}
          stroke={`url(#${colorGradId})`}
          strokeWidth={simple ? STRAND_B_WIDTH : STRAND_A_WIDTH}
          fill="none"
          opacity={simple ? STRAND_B_OPACITY : STRAND_A_OPACITY}
          strokeLinecap="round"
        />

        {/* Right strand — warm-to-cool color gradient (skipped in simple mode) */}
        {!simple && (
          <path
            ref={strandBRef}
            d={initial.strandB}
            stroke={`url(#${colorGradId})`}
            strokeWidth={STRAND_B_WIDTH}
            fill="none"
            opacity={STRAND_B_OPACITY}
            strokeLinecap="round"
          />
        )}

        {/* Dispersal wisps — thinner tendrils that peel off and fade out (skipped in simple mode) */}
        {!simple &&
          DISPERSAL_WISPS.map((w, i) => (
            <path
              key={w.id}
              ref={setWispRef(i)}
              d={initial.wisps[i]}
              stroke={`url(#${wispGradIds[i]})`}
              strokeWidth={w.width}
              fill="none"
              strokeLinecap="round"
            />
          ))}
      </g>
    </g>
  );
}
