'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

// ─── Types ───────────────────────────────────────────────────────────
interface FlyoverRequest {
  id: number;
  from: DOMRect;
  sparkCount: number;
  particleCount: number;
}

/** Exposed to badge for incremental count-up and per-landing pulse */
export interface LandingState {
  /** Total sparks being delivered */
  totalSparks: number;
  /** How many particles have landed so far */
  landedCount: number;
  /** Total particles in flight */
  totalParticles: number;
}

interface SparkFlyoverContextValue {
  registerTarget: (el: HTMLElement | null) => void;
  triggerFlyover: (from: DOMRect, sparkCount: number) => void;
  /** Live landing state — null when no flyover is active */
  landingState: LandingState | null;
}

// ─── Context ─────────────────────────────────────────────────────────
const SparkFlyoverContext = createContext<SparkFlyoverContextValue | null>(
  null,
);

export function useSparkFlyover() {
  const ctx = use(SparkFlyoverContext);
  if (!ctx) {
    throw new Error('useSparkFlyover must be used within SparkFlyoverProvider');
  }
  return ctx;
}

// ─── Particle config ─────────────────────────────────────────────────
const MIN_PARTICLES = 5;
const MAX_PARTICLES = 14;
const FLIGHT_DURATION = 0.65;
const SPARK_PINK = '#E60076';
const SPARK_GOLD = '#fbbf24';

/** Scale particle count proportionally: 5 for small rewards, up to 14 for big */
function getParticleCount(sparks: number): number {
  return Math.min(
    MAX_PARTICLES,
    Math.max(MIN_PARTICLES, Math.floor(sparks / 8)),
  );
}

interface FlyParticle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  color: string;
  delay: number;
  arcX: number;
  arcY: number;
}

function generateParticles(
  from: DOMRect,
  to: DOMRect,
  particleCount: number,
): FlyParticle[] {
  const startCX = from.left + from.width / 2;
  const startCY = from.top + from.height / 2;
  const endCX = to.left + to.width / 2;
  const endCY = to.top + to.height / 2;

  return Array.from({ length: particleCount }, (_, i) => {
    const angle = ((Math.PI * 2) / particleCount) * i;
    const spreadRadius = 12;
    const sx = startCX + Math.cos(angle) * spreadRadius;
    const sy = startCY + Math.sin(angle) * spreadRadius;

    const jitterX = (Math.random() - 0.5) * 8;
    const jitterY = (Math.random() - 0.5) * 4;

    const midX = (sx + endCX) / 2;
    const midY = (sy + endCY) / 2;
    const arcOffset = -40 + Math.random() * -60;
    const sideOffset = (Math.random() - 0.5) * 80;

    return {
      id: i,
      startX: sx,
      startY: sy,
      endX: endCX + jitterX,
      endY: endCY + jitterY,
      size: 3 + Math.random() * 3,
      color: i % 3 === 0 ? SPARK_GOLD : SPARK_PINK,
      delay: i * 0.07,
      arcX: midX + sideOffset,
      arcY: midY + arcOffset,
    };
  });
}

// ─── Overlay ─────────────────────────────────────────────────────────
function FlyoverOverlay({
  request,
  targetRef,
  onParticleLand,
  onComplete,
}: {
  request: FlyoverRequest;
  targetRef: React.RefObject<HTMLElement | null>;
  onParticleLand: () => void;
  onComplete: (id: number) => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [particles, setParticles] = useState<FlyParticle[]>([]);
  const [landed, setLanded] = useState(false);
  const completedRef = useRef(0);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) {
      onComplete(request.id);
      return;
    }

    const targetRect = target.getBoundingClientRect();
    setParticles(
      generateParticles(request.from, targetRect, request.particleCount),
    );
  }, [request, targetRef, onComplete]);

  const handleParticleLand = useCallback(() => {
    completedRef.current += 1;
    onParticleLand();
    if (completedRef.current >= particles.length && !landed) {
      setLanded(true);
      onComplete(request.id);
    }
  }, [particles.length, landed, onComplete, onParticleLand, request.id]);

  // For reduced motion, complete immediately
  useEffect(() => {
    if (shouldReduceMotion && particles.length > 0) {
      onComplete(request.id);
    }
  }, [shouldReduceMotion, particles.length, onComplete, request.id]);

  if (shouldReduceMotion || particles.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 6px ${p.color}, 0 0 12px ${p.color}80`,
            left: 0,
            top: 0,
          }}
          initial={{
            x: p.startX,
            y: p.startY,
            scale: 1.2,
            opacity: 1,
          }}
          animate={{
            x: [p.startX, p.arcX, p.endX],
            y: [p.startY, p.arcY, p.endY],
            scale: [1.2, 0.9, 0.4],
            opacity: [1, 1, 0.8],
          }}
          transition={{
            duration: FLIGHT_DURATION,
            delay: p.delay,
            ease: [0.32, 0, 0.24, 1],
          }}
          onAnimationComplete={handleParticleLand}
        />
      ))}
    </div>
  );
}

// ─── Provider ────────────────────────────────────────────────────────
let flyoverId = 0;

export function SparkFlyoverProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const targetsRef = useRef<Set<HTMLElement>>(new Set());
  const targetRef = useRef<HTMLElement | null>(null);
  const [requests, setRequests] = useState<FlyoverRequest[]>([]);
  const [landingState, setLandingState] = useState<LandingState | null>(null);

  const registerTarget = useCallback((el: HTMLElement | null) => {
    if (el) {
      targetsRef.current.add(el);
    }
  }, []);

  const triggerFlyover = useCallback((from: DOMRect, sparkCount: number) => {
    // Resolve the visible target
    let visible: HTMLElement | null = null;
    for (const el of targetsRef.current) {
      if (!el.isConnected) {
        targetsRef.current.delete(el);
        continue;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        visible = el;
        break;
      }
    }
    targetRef.current = visible;

    const particleCount = getParticleCount(sparkCount);
    setLandingState({
      totalSparks: sparkCount,
      landedCount: 0,
      totalParticles: particleCount,
    });

    flyoverId += 1;
    setRequests((prev) => [
      ...prev,
      { id: flyoverId, from, sparkCount, particleCount },
    ]);
  }, []);

  const handleParticleLand = useCallback(() => {
    setLandingState((prev) => {
      if (!prev) return prev;
      return { ...prev, landedCount: prev.landedCount + 1 };
    });
  }, []);

  const handleComplete = useCallback((id: number) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    // Clear landing state after a brief delay (let badge finish its pulse)
    setTimeout(() => setLandingState(null), 400);
  }, []);

  return (
    <SparkFlyoverContext
      value={{ registerTarget, triggerFlyover, landingState }}
    >
      {children}
      {requests.map((req) => (
        <FlyoverOverlay
          key={req.id}
          request={req}
          targetRef={targetRef}
          onParticleLand={handleParticleLand}
          onComplete={handleComplete}
        />
      ))}
    </SparkFlyoverContext>
  );
}
