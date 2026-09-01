// components/flyover.tsx
// The 29.08.26 flyover: two jets in formation cross the bowl, fireworks and
// confetti off the rim. Plays once on load, then replays on hover or when the
// scene scrolls back into view. Decorative only (aria-hidden).

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Stadium bowl geometry, shared by the rim launch points below. */
const BOWL = { cx: 600, cy: 322, rx: 400, ry: 142 };

/** Deterministic PRNG so server and client render identical markup. */
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number) => Math.round(value * 100) / 100;

/** A point on the upper rim of the bowl, `t` running 0 (left) to 1 (right). */
function rimPoint(t: number) {
  const angle = Math.PI * (0.82 - 0.64 * t);
  return {
    x: round(BOWL.cx + BOWL.rx * Math.cos(angle)),
    y: round(BOWL.cy - BOWL.ry * Math.sin(angle)),
  };
}

type Confetto = {
  x: number;
  y: number;
  size: number;
  dx: number;
  apex: number;
  fall: number;
  spin: number;
  delay: number;
  gold: boolean;
};

const CONFETTI: Confetto[] = (() => {
  const random = mulberry32(20260829);
  const count = 34;
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;
    const { x, y } = rimPoint(t);
    const outward = (t - 0.5) * 2;
    return {
      x,
      y,
      size: round(3 + random() * 4),
      dx: round(outward * (40 + random() * 90)),
      apex: round(70 + random() * 90),
      fall: round(110 + random() * 70),
      spin: Math.round(180 + random() * 540) * (random() > 0.5 ? 1 : -1),
      delay: round(random() * 0.5),
      gold: random() > 0.55,
    };
  });
})();

function Firework({ at, className, seed }: { at: number; className: string; seed: number }) {
  const { x, y } = rimPoint(at);
  const random = mulberry32(seed);
  const ring = (count: number, radius: number, offset: number) =>
    Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * (i + offset)) / count;
      const length = radius * (0.78 + random() * 0.34);
      return {
        x2: round(Math.cos(angle) * length),
        y2: round(Math.sin(angle) * length),
      };
    });
  const spokes = [...ring(16, 88, 0), ...ring(10, 48, 0.5)];

  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`firework ${className}`}>
        {spokes.map((spoke) => (
          <line key={`${spoke.x2}:${spoke.y2}`} x1="0" y1="0" x2={spoke.x2} y2={spoke.y2} />
        ))}
      </g>
    </g>
  );
}

function Jet({ className }: { className: string }) {
  return (
    <g className={`jet ${className}`}>
      <rect className="trail trail-outer" x="-620" y="-7" width="620" height="1.5" />
      <rect className="trail" x="-680" y="-1" width="680" height="2.5" />
      <rect className="trail trail-outer" x="-620" y="5" width="620" height="1.5" />
      <g className="airframe">
        <path d="M6 12 L30 9 L46 12 L30 15 Z" />
        <path d="M24 11 L12 1 L20 1 L33 10 Z" />
        <path d="M24 13 L12 23 L20 23 L33 14 Z" />
        <path d="M9 11 L3 4 L8 4 L14 10 Z" />
        <path d="M9 13 L3 20 L8 20 L14 14 Z" />
      </g>
    </g>
  );
}

/** Everything that animates — remounting this group restarts the pass from zero. */
function MotionLayer() {
  return (
    <g className="flyover-motion">
      <g className="confetti">
        {CONFETTI.map((piece) => (
          <rect
            key={`${piece.x}:${piece.y}:${piece.spin}`}
            className={piece.gold ? "confetto confetto-gold" : "confetto"}
            x={-piece.size / 2}
            y={-piece.size / 2}
            width={piece.size}
            height={piece.size * 1.6}
            style={
              {
                "--cx": `${piece.x}px`,
                "--cy": `${piece.y}px`,
                "--dx": `${piece.dx}px`,
                "--apex": `${-piece.apex}px`,
                "--fall": `${piece.fall}px`,
                "--spin": `${piece.spin}deg`,
                "--delay": `${piece.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </g>

      <Firework at={0.24} className="firework-a" seed={11} />
      <Firework at={0.76} className="firework-b" seed={29} />
      <Firework at={0.5} className="firework-c" seed={47} />

      <Jet className="jet-lead" />
      <Jet className="jet-wing" />
    </g>
  );
}

const REPLAY_COOLDOWN_MS = 1800;

export function Flyover() {
  const rootRef = useRef<HTMLDivElement>(null);
  const lastReplay = useRef(0);
  const wasInView = useRef(false);
  const reducedMotion = useRef(false);
  const [playId, setPlayId] = useState(1);

  const replay = useCallback(() => {
    if (reducedMotion.current) return;
    const now = Date.now();
    if (now - lastReplay.current < REPLAY_COOLDOWN_MS) return;
    lastReplay.current = now;
    setPlayId((id) => id + 1);
  }, []);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Side effect: replays the pass when the scene re-enters the viewport.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
          if (wasInView.current) replay();
          wasInView.current = true;
        } else if (!entry.isIntersecting) {
          wasInView.current = false;
        }
      },
      { threshold: [0, 0.45] },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [replay]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: decorative replay on hover/touch, not a control
    <div
      ref={rootRef}
      className="flyover relative h-52 w-full cursor-default overflow-hidden sm:h-64 lg:h-72"
      onMouseEnter={replay}
      onTouchStart={replay}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1200 300"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        <g className="stadium">
          <ellipse cx={BOWL.cx} cy={BOWL.cy} rx={BOWL.rx} ry={BOWL.ry} />
          <ellipse cx={BOWL.cx} cy={BOWL.cy} rx={268} ry={94} />
          <line x1="200" y1={BOWL.cy} x2="1000" y2={BOWL.cy} />
        </g>

        <line x1="0" y1="278" x2="1200" y2="278" className="horizon" />

        <MotionLayer key={playId} />
      </svg>
    </div>
  );
}
