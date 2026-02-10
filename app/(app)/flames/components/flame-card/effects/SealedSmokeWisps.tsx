'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useId, useMemo, useRef } from 'react';

interface SealedSmokeWispsProps {
  /** Y coordinate of the wick / emission point in the 0-100 SVG viewBox */
  wickY: number;
  /** X coordinate of the emission origin (default: 50 = center) */
  wickX?: number;
}

const SMOKE_COLOR = '#94a3b8';
const RISE_HEIGHT = 80;
const REVEAL_DURATION = 3;

// ---------------------------------------------------------------------------
// Path builder — two strands + fill, snaking over time
// ---------------------------------------------------------------------------

function buildPaths(wickX: number, wickY: number, t: number) {
  const endY = wickY - RISE_HEIGHT;

  // Shared snake motion at different heights along the column
  const snakeLow = Math.sin(t * 1.3) * 2;
  const snakeMid = Math.sin(t * 0.9 + 0.5) * 4;
  const snakeHigh = Math.sin(t * 0.7 + 1.2) * 5;

  // Spread between strands: tight at base, widens at mid, narrows toward top
  const spreadMid = 7;
  const spreadTop = 0.2;

  const cpY1 = wickY - RISE_HEIGHT * 0.4;
  const cpY2 = wickY - RISE_HEIGHT * 0.7;

  // Left strand
  const aCP1x = wickX + snakeLow - 0.5;
  const aCP2x = wickX + snakeMid - spreadMid;
  const aEndX = wickX + snakeHigh - spreadTop;

  // Right strand
  const bCP1x = wickX + snakeLow + 0.5;
  const bCP2x = wickX + snakeMid + spreadMid;
  const bEndX = wickX + snakeHigh + spreadTop;

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

  const initial = useMemo(() => buildPaths(wickX, wickY, 0), [wickX, wickY]);
  const endY = wickY - RISE_HEIGHT;

  const gradientId = `smoke-grad-${id}`;
  const maskId = `smoke-mask-${id}`;

  // Animate snaking via rAF (no React re-renders)
  useEffect(() => {
    if (shouldReduceMotion) return;

    let rafId: number;
    const startTime = performance.now();

    const tick = () => {
      const t = (performance.now() - startTime) / 1000;
      const paths = buildPaths(wickX, wickY, t);

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
          strokeWidth={1.5}
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
          <stop offset="65%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
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
          opacity={0.08}
        />

        {/* Left strand */}
        <path
          ref={strandARef}
          d={initial.strandA}
          stroke={SMOKE_COLOR}
          strokeWidth={1.5}
          fill="none"
          opacity={0.4}
          strokeLinecap="round"
        />

        {/* Right strand */}
        <path
          ref={strandBRef}
          d={initial.strandB}
          stroke={SMOKE_COLOR}
          strokeWidth={1.2}
          fill="none"
          opacity={0.35}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}
