import Image from 'next/image';

export function EmberFloat() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-0 -m-12 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(230,0,118,0.2) 0%, rgba(167,139,250,0.08) 50%, transparent 70%)',
        }}
      />

      <div className="motion-safe:animate-marketing-float">
        <Image
          src="/ember.png"
          alt="Ember — Hibana's AI flame-sprite companion"
          width={180}
          height={270}
          className="relative select-none drop-shadow-[0_0_60px_rgba(230,0,118,0.35)]"
          draggable={false}
          priority={false}
        />
      </div>
    </div>
  );
}
