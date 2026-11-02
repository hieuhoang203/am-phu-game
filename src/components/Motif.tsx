import React from "react";
export function Motif({
  symbol,
  x,
  y,
  color = "#aebcb2",
  scale = 1,
}: {
  symbol: string;
  x: number;
  y: number;
  color?: string;
  scale?: number;
}) {
  const shapes: Record<string, React.ReactNode> = {
    tongue: (
      <>
        <path d="M-25 -8Q0 -38 25 -8Q16 10 0 8Q-17 10-25-8Z" />
        <path d="M-7 0V30Q0 45 7 30V0M-18-8H18" />
      </>
    ),
    scissors: (
      <>
        <circle cx="-14" cy="20" r="9" />
        <circle cx="14" cy="20" r="9" />
        <path d="M-10 12L20-30M10 12L-20-30" />
      </>
    ),
    tree: (
      <>
        <path d="M0 35V-35M0 5L-25-15M0-5L24-28M0 20L30 2M0-20L-15-32M-25-15V-30M24-28V-40" />
        <path d="M-12 37L0 27L12 37" />
      </>
    ),
    mirror: (
      <>
        <ellipse cy="-8" rx="24" ry="31" />
        <ellipse cy="-8" rx="18" ry="25" />
        <path d="M0 24V38M-15 38H15M-10-8L8-22" />
      </>
    ),
    steam: (
      <>
        <path d="M-30 0H30V30H-30ZM-35 0L0-14L35 0M-25 13H25M-10-18Q-22-30-10-42M10-18Q-2-30 10-42" />
      </>
    ),
    pillar: (
      <>
        <path d="M-16-35H16V35H-16ZM-22-35H22M-22 35H22M-6-27V26M6-27V26" />
      </>
    ),
    mountain: (
      <>
        <path d="M-40 30L-15-32L3 4L18-20L42 30ZM-23-12L-15-5L-8-15M10 0L18 7L24-4" />
      </>
    ),
    ice: (
      <>
        <path d="M0-40V40M-35-20L35 20M-35 20L35-20M-10-32L0-23L10-32M-10 32L0 23L10 32M-30-7L-20-12L-20-23M20 23V12L30 7" />
      </>
    ),
    cauldron: (
      <>
        <path d="M-30-10H30L22 24Q0 40-22 24ZM-35-15H35M-25 27L-30 38M25 27L30 38M-10-22Q-22-34-10-43M10-22Q-2-34 10-43" />
      </>
    ),
    ox: (
      <>
        <path d="M-20-12Q0-28 20-12L14 20L0 30L-14 20ZM-20-12Q-38-10-30-35M20-12Q38-10 30-35M-12 0H-5M5 0H12M-6 18H6" />
      </>
    ),
    rock: (
      <>
        <path d="M-35 25L-25-20L5-32L32-8L36 25ZM-25-20L-3 0L32-8M-3 0L-12 25" />
      </>
    ),
    mortar: (
      <>
        <path d="M-30 0H30L23 32H-23ZM-8-5L12-40L23-35L5 2M-36 0H36" />
      </>
    ),
    lotus: (
      <>
        <path d="M0 30Q-25 2 0-30Q25 2 0 30ZM0 30Q-40 20-35-10Q-5-10 0 30ZM0 30Q40 20 35-10Q5-10 0 30ZM-38 33H38" />
      </>
    ),
    ghost: (
      <>
        <path
          d="M-24 30V-8A24 24 0 0148 0V30L12 20L0 30L-12 20Z"
          transform="translate(-12)"
        />
        <circle cx="-12" cy="-5" r="2" />
        <circle cx="8" cy="-5" r="2" />
      </>
    ),
    shards: (
      <>
        <path d="M-25-30L-3-20L-9 5L-32 13ZM8-32L30-15L14 5L1-8ZM-7 16L11 12L29 33L-15 35Z" />
      </>
    ),
    fire: (
      <>
        <path d="M0 36Q-45 20-15-15Q-10 5 0-38Q40 5 28 23Q20 40 0 36ZM0 30Q-15 15 4 2Q20 23 0 30Z" />
      </>
    ),
    wheel: (
      <>
        <ellipse cy="10" rx="34" ry="20" />
        <path d="M-34 10V24Q0 52 34 24V10M0 9V-23H19M-25 5L25 17M-22 20L22 0" />
      </>
    ),
    saw: (
      <>
        <path d="M-35-18L-25-28L35 22L25 32ZM-20-10L-20 1L-9 0L-9 11L2 10L2 21L13 20M-35-18L-45-10M35 22L43 14" />
      </>
    ),
  };
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shapes[symbol] || shapes.mirror}
    </g>
  );
}
