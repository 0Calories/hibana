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
  count: number;
}

interface SparkFlyoverContextValue {
  /** Register the badge element as the landing target */
  registerTarget: (el: HTMLElement | null) => void;
  /** Launch spark particles from `from` toward the registered target */
  triggerFlyover: (from: DOMRect, count: number) => void;
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
const PARTICLE_COUNT = 10;
const FLIGHT_DURATION = 0.65;
const SPARK_PINK = '#E60076';
const SPARK_GOLD = '#fbbf24';

interface FlyParticle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  color: string;
  delay: number;
  /** Control point offset for the arc */
  arcX: number;
  arcY: number;
}

function generateParticles(
  from: DOMRect,
  to: DOMRect,
  count: number,
): FlyParticle[] {
  const startCX = from.left + from.width / 2;
  const startCY = from.top + from.height / 2;
  const endCX = to.left + to.width / 2;
  const endCY = to.top + to.height / 2;

  return Array.from({ length: Math.min(count, PARTICLE_COUNT) }, (_, i) => {
    // Spread source positions a bit
    const angle = ((Math.PI * 2) / PARTICLE_COUNT) * i;
    const spreadRadius = 12;
    const sx = startCX + Math.cos(angle) * spreadRadius;
    const sy = startCY + Math.sin(angle) * spreadRadius;

    // Slight jitter on landing
    const jitterX = (Math.random() - 0.5) * 8;
    const jitterY = (Math.random() - 0.5) * 4;

    // Arc control: particles bow outward from the straight line
    const midX = (sx + endCX) / 2;
    const midY = (sy + endCY) / 2;
    const arcOffset = -40 + Math.random() * -60; // bow upward
    const sideOffset = (Math.random() - 0.5) * 80; // spread sideways

    return {
      id: i,
      startX: sx,
      startY: sy,
      endX: endCX + jitterX,
      endY: endCY + jitterY,
      size: 3 + Math.random() * 3,
      color: i % 3 === 0 ? SPARK_GOLD : SPARK_PINK,
      delay: i * 0.03,
      arcX: midX + sideOffset,
      arcY: midY + arcOffset,
    };
  });
}

// ─── Overlay ─────────────────────────────────────────────────────────
function FlyoverOverlay({
  request,
  targetRef,
  onComplete,
}: {
  request: FlyoverRequest;
  targetRef: React.RefObject<HTMLElement | null>;
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
    setParticles(generateParticles(request.from, targetRect, request.count));
  }, [request, targetRef, onComplete]);

  const handleParticleLand = useCallback(() => {
    completedRef.current += 1;
    if (completedRef.current >= particles.length && !landed) {
      setLanded(true);
      onComplete(request.id);
    }
  }, [particles.length, landed, onComplete, request.id]);

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
  // Expose a stable ref object that resolves to the visible target
  const targetRef = useRef<HTMLElement | null>(null);
  const [requests, setRequests] = useState<FlyoverRequest[]>([]);

  const registerTarget = useCallback((el: HTMLElement | null) => {
    if (el) {
      targetsRef.current.add(el);
    }
  }, []);

  const triggerFlyover = useCallback((from: DOMRect, count: number) => {
    // Resolve the visible target (non-zero bounding rect)
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

    flyoverId += 1;
    setRequests((prev) => [...prev, { id: flyoverId, from, count }]);
  }, []);

  const handleComplete = useCallback((id: number) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <SparkFlyoverContext value={{ registerTarget, triggerFlyover }}>
      {children}
      {requests.map((req) => (
        <FlyoverOverlay
          key={req.id}
          request={req}
          targetRef={targetRef}
          onComplete={handleComplete}
        />
      ))}
    </SparkFlyoverContext>
  );
}
