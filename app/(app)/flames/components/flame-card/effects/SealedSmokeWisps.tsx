'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { generateHash } from './particles';

interface SealedSmokeWispsProps {
  /** Y coordinate of the wick / emission point in the 0-100 SVG viewBox */
  wickY: number;
  /** X coordinate of the emission origin (default: 50 = center) */
  wickX?: number;
}

interface ChildClump {
  id: number;
  strandA: string;
  strandB: string;
  fillPath: string;
  duration: number;
  strokeWidth: number;
  startY: number;
  endY: number;
}

const SMOKE_COLOR = '#94a3b8';
const FILL_COLOR = '#94a3b8';
const PARENT_RISE = 12;
const CHILD_DURATION = 3.5;
const SPAWN_INTERVAL_MS = 2800;
const MAX_CLUMPS = 3;

// ---------------------------------------------------------------------------
// Parent wisp — continuous snaking motion from the wick
// ---------------------------------------------------------------------------

function getParentTip(wickX: number, wickY: number, t: number) {
  const x = wickX + Math.sin(t * 1.3) * 4 + Math.sin(t * 0.7) * 2.5;
  const y = wickY - PARENT_RISE - Math.sin(t * 0.9) * 1.5;
  return { x, y };
}

function buildParentPath(
  wickX: number,
  wickY: number,
  tipX: number,
  tipY: number,
) {
  const cp1x = wickX + (tipX - wickX) * 0.3;
  const cp1y = wickY - (wickY - tipY) * 0.4;
  const cp2x = tipX - (tipX - wickX) * 0.2;
  const cp2y = tipY + (wickY - tipY) * 0.2;
  return `M ${wickX} ${wickY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tipX} ${tipY}`;
}

// ---------------------------------------------------------------------------
// Child clumps — paired strands that offshoot from the parent tip
// ---------------------------------------------------------------------------

function createChildClump(
  spawnX: number,
  spawnY: number,
  id: number,
): ChildClump {
  const h1 = generateHash(id, 193);
  const h2 = generateHash(id, 311);
  const h3 = generateHash(id, 457);

  const driftDir = id % 2 === 0 ? 1 : -1;
  const driftMag = 5 + (h1 % 6);
  const riseHeight = 25 + (h2 % 12);

  const startX = spawnX;
  const startY = spawnY;

  const midDrift = driftDir * (driftMag * 0.3);
  const cp1x = startX + midDrift;
  const cp1y = startY - riseHeight * 0.3;
  const cp2x = startX - driftDir * (driftMag * 0.15);
  const cp2y = startY - riseHeight * 0.6;

  const spread = 6 + (h3 % 5);
  const endY = startY - riseHeight;
  const endBaseX = startX + driftDir * driftMag;
  const endXa = endBaseX - spread * 0.5;
  const endXb = endBaseX + spread * 0.5;

  const cp2xB = cp2x + driftDir * (spread * 0.3);

  const strandA = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endXa} ${endY}`;
  const strandB = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2xB} ${cp2y}, ${endXb} ${endY}`;

  const fillPath = [
    `M ${startX} ${startY}`,
    `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endXa} ${endY}`,
    `L ${endXb} ${endY}`,
    `C ${cp2xB} ${cp2y}, ${cp1x} ${cp1y}, ${startX} ${startY}`,
    'Z',
  ].join(' ');

  return {
    id,
    strandA,
    strandB,
    fillPath,
    duration: CHILD_DURATION,
    strokeWidth: 1.2 + ((h2 % 100) / 100) * 0.4,
    startY,
    endY,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SealedSmokeWisps({ wickY, wickX = 50 }: SealedSmokeWispsProps) {
  const shouldReduceMotion = useReducedMotion();
  const parentPathRef = useRef<SVGPathElement>(null);
  const parentTipRef = useRef(getParentTip(wickX, wickY, 0));
  const [childClumps, setChildClumps] = useState<ChildClump[]>([]);
  const clumpIdRef = useRef(0);

  // Drive parent wisp snaking via rAF (no React re-renders)
  useEffect(() => {
    if (shouldReduceMotion) return;

    let rafId: number;
    const startTime = performance.now();

    const tick = () => {
      const t = (performance.now() - startTime) / 1000;
      const tip = getParentTip(wickX, wickY, t);
      parentTipRef.current = tip;

      if (parentPathRef.current) {
        parentPathRef.current.setAttribute(
          'd',
          buildParentPath(wickX, wickY, tip.x, tip.y),
        );
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [wickX, wickY, shouldReduceMotion]);

  // Spawn child clumps from the parent tip at regular intervals
  useEffect(() => {
    if (shouldReduceMotion) return;

    const spawnClump = () => {
      const tip = parentTipRef.current;
      const id = clumpIdRef.current++;
      const clump = createChildClump(tip.x, tip.y, id);
      setChildClumps((prev) => [...prev.slice(-(MAX_CLUMPS - 1)), clump]);
    };

    // First clump spawns immediately
    spawnClump();
    const interval = setInterval(spawnClump, SPAWN_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  // Deterministic initial path for SSR hydration
  const initialTip = useMemo(
    () => getParentTip(wickX, wickY, 0),
    [wickX, wickY],
  );
  const initialParentPath = useMemo(
    () => buildParentPath(wickX, wickY, initialTip.x, initialTip.y),
    [wickX, wickY, initialTip],
  );

  if (shouldReduceMotion) {
    return (
      <g>
        <path
          d={initialParentPath}
          stroke={SMOKE_COLOR}
          strokeWidth={1.2}
          fill="none"
          opacity={0.3}
          strokeLinecap="round"
        />
      </g>
    );
  }

  const childTransition = { duration: CHILD_DURATION, ease: 'linear' as const };

  return (
    <g>
      {/* Parent wisp — always visible, snaking from wick */}
      <path
        ref={parentPathRef}
        d={initialParentPath}
        stroke={SMOKE_COLOR}
        strokeWidth={1.2}
        fill="none"
        opacity={0.4}
        strokeLinecap="round"
      />

      {/* Child clumps — offshoot from parent tip, animate once then replaced */}
      {childClumps.map((clump) => {
        const clipId = `smoke-clip-${clump.id}`;
        const riseHeight = clump.startY - clump.endY;

        return (
          <g key={clump.id}>
            <defs>
              <clipPath id={clipId}>
                <motion.rect
                  x={0}
                  width={100}
                  initial={{ y: clump.startY, height: 0 }}
                  animate={{
                    y: [
                      clump.startY,
                      clump.startY - riseHeight * 0.6,
                      clump.endY,
                    ],
                    height: [0, riseHeight * 0.6, riseHeight],
                  }}
                  transition={childTransition}
                />
              </clipPath>
            </defs>

            {/* Grey fill between strands, clipped to reveal bottom-to-top */}
            <motion.path
              d={clump.fillPath}
              fill={FILL_COLOR}
              stroke="none"
              clipPath={`url(#${clipId})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.1, 0.06, 0] }}
              transition={childTransition}
            />

            {/* Both strands — identical timing */}
            <motion.path
              d={clump.strandA}
              stroke={SMOKE_COLOR}
              strokeWidth={clump.strokeWidth}
              fill="none"
              strokeLinecap="round"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{
                opacity: [0, 0.45, 0.3, 0],
                pathLength: [0, 0.6, 0.9, 1],
              }}
              transition={childTransition}
            />
            <motion.path
              d={clump.strandB}
              stroke={SMOKE_COLOR}
              strokeWidth={clump.strokeWidth * 0.8}
              fill="none"
              strokeLinecap="round"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{
                opacity: [0, 0.35, 0.2, 0],
                pathLength: [0, 0.6, 0.9, 1],
              }}
              transition={childTransition}
            />
          </g>
        );
      })}
    </g>
  );
}
