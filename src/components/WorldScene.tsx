import React, { useRef, useState, useEffect } from "react";
import { MAP, regionFor, pointKey, type Point } from "../../shared/exploration";
import type { Floor, Player, Snapshot } from "../../shared/world";
import { CharacterSprite } from "./CharacterSprite";
import { PunishmentStage } from "./PunishmentStage";
import { Motif } from "./Motif";
import { teams, stateNames } from "../../shared/mischief";
import type { GameSettings } from "../settings";
export function WorldScene({
  floor,
  me,
  world,
  settings,
  zoom,
  onZoom,
  onGo,
  onSelect,
  path,
  selected,
}: {
  floor: Floor;
  me?: Player;
  world: Snapshot;
  settings: GameSettings;
  zoom: number;
  onZoom: (n: number) => void;
  onGo: (p: Point) => void;
  onSelect: (id: string) => void;
  path: Point[];
  selected: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [aspect, setAspect] = useState(window.innerWidth / window.innerHeight);
  useEffect(() => {
    const el = ref.current!;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (height) setAspect(width / height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const region = regionFor(floor.id),
    h = Math.min(740 / zoom, MAP.height),
    w = Math.min(h * aspect, MAP.width);
  const cx = Math.max(w / 2, Math.min(MAP.width - w / 2, me?.x || 500)),
    cy = Math.max(h / 2, Math.min(MAP.height - h / 2, me?.y || 550));
  const ground =
    region.biome === "frost"
      ? "#273e4b"
      : region.biome === "ember"
        ? "#342b32"
        : region.biome === "blood"
          ? "#322d3c"
          : region.biome === "grove"
            ? "#253c37"
            : "#293735";
  return (
    <svg
      ref={ref}
      className="ow-scene"
      role="img"
      aria-label={`Thế giới mở ${floor.name}`}
      data-camera={`${Math.round(cx)},${Math.round(cy)}`}
      viewBox={`${cx - w / 2} ${cy - h / 2} ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      onWheel={(e) =>
        onZoom(Math.max(0.75, Math.min(1.6, zoom - e.deltaY * 0.001)))
      }
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        const svg = ref.current!,
          p = svg.createSVGPoint();
        p.x = e.clientX;
        p.y = e.clientY;
        const t = p.matrixTransform(svg.getScreenCTM()!.inverse());
        onGo({ x: t.x, y: t.y });
      }}
    >
      <defs>
        <pattern
          id="terrain"
          width="150"
          height="150"
          patternUnits="userSpaceOnUse"
        >
          <rect width="150" height="150" fill={ground} />
          <path
            d="M12 44l6-3m44 81 9-3m38-96 4 7m-9 89 6 2"
            stroke="#769188"
            opacity=".14"
            strokeWidth="2"
          />
          <circle cx="34" cy="78" r="2" fill="#a7c7ac" opacity=".12" />
        </pattern>
        <pattern
          id="path-stones"
          width="80"
          height="55"
          patternUnits="userSpaceOnUse"
        >
          <rect width="80" height="55" fill="#6c7061" />
          <path
            d="M0 25l40 3 40-8M40 0v28L26 55"
            stroke="#454f48"
            strokeWidth="3"
            opacity=".65"
          />
        </pattern>
        <radialGradient id="pool">
          <stop stopColor={floor.color} stopOpacity=".55" />
          <stop offset="1" stopColor={floor.color} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="water">
          <stop stopColor="#193e48" />
          <stop offset="1" stopColor="#172e39" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <rect width={MAP.width} height={MAP.height} fill="url(#terrain)" />
      <path
        d="M950-100C800 200 1200 420 1120 750S700 1100 980 1500 1240 1800 1020 2050"
        stroke="#162d32"
        strokeWidth="240"
        fill="none"
      />
      <path
        d="M950-100C800 200 1200 420 1120 750S700 1100 980 1500 1240 1800 1020 2050"
        stroke="url(#water)"
        strokeWidth="190"
        fill="none"
      />
      {Array.from({ length: 23 }, (_, i) => (
        <path
          key={i}
          d={`M${875 + (i % 3) * 35} ${i * 90}q25-8 53 0`}
          fill="none"
          stroke="#8ab6b5"
          opacity=".17"
          strokeWidth="2"
        />
      ))}
      <g
        stroke="#202d29"
        strokeWidth="92"
        fill="none"
        strokeLinecap="round"
        opacity=".65"
      >
        <path d="M500 140V670Q500 900 900 900L1490 900Q1800 900 1830 1120L2450 1450" />
        <path d="M900 900Q700 1310 240 1550M1490 900V1530M1490 900Q1800 630 2220 590" />
      </g>
      <g
        stroke="url(#path-stones)"
        strokeWidth="69"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M500 140V670Q500 900 900 900L1490 900Q1800 900 1830 1120L2450 1450" />
        <path d="M900 900Q700 1310 240 1550M1490 900V1530M1490 900Q1800 630 2220 590" />
      </g>
      <g transform="translate(1080 900) rotate(10)">
        <rect
          x="-145"
          y="-65"
          width="290"
          height="130"
          rx="6"
          fill="#706753"
          stroke="#383b32"
          strokeWidth="8"
        />
        {Array.from({ length: 14 }, (_, i) => (
          <path
            key={i}
            d={`M${-140 + i * 21}-63v126`}
            stroke="#383b32"
            strokeWidth="4"
          />
        ))}
        <path d="M-145-72H145M-145 72H145" stroke="#a99871" strokeWidth="10" />
      </g>
      <g opacity=".14" fill={floor.color}>
        {Array.from({ length: 35 }, (_, i) => (
          <ellipse
            key={i}
            cx={100 + ((i * 437) % 2600)}
            cy={80 + ((i * 311) % 1740)}
            rx={38 + (i % 4) * 20}
            ry={18 + (i % 3) * 10}
          />
        ))}
      </g>
      {Array.from({ length: 95 }, (_, i) => {
        const x = 90 + ((i * 347 + floor.id * 47) % 2600),
          y = 130 + ((i * 229) % 1620);
        if (region.landmarks.some((l) => Math.hypot(l.x - x, l.y - y) < 140))
          return null;
        return (
          <g
            key={i}
            transform={`translate(${x} ${y})`}
            opacity={i % 4 === 0 ? 0.8 : 0.5}
          >
            {i % 4 === 0 ? (
              <>
                <ellipse cy="7" rx="20" ry="8" fill="#142c2a" />
                <path
                  d="M-12 5V-23Q0-40 12-23V5"
                  fill="#687466"
                  stroke="#263e35"
                  strokeWidth="3"
                />
                <path d="M0-23V-3m-5-13H5" stroke="#b0b59b" strokeWidth="2" />
              </>
            ) : (
              <path
                d="M-15 5l4-14 10 15 4-24 9 20 10-11-5 15"
                stroke="#638273"
                strokeWidth="3"
                fill="none"
              />
            )}
          </g>
        );
      })}
      {[
        { x: 280, y: 390 },
        { x: 720, y: 390 },
        { x: 680, y: 760 },
        { x: 1250, y: 935 },
        { x: 1930, y: 1080 },
        { x: 2300, y: 1380 },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <ellipse rx="52" ry="38" fill="url(#pool)" />
          <path d="M0 0V-76" stroke="#424d40" strokeWidth="9" />
          <path d="M-18-66 0-88 18-66Z" fill="#5d6e50" />
          <rect x="-13" y="-65" width="26" height="29" rx="6" fill="#ddc37d" />
          <path d="M-13-57H13M0-65v29" stroke="#9c7f4e" strokeWidth="2" />
          <circle cy="-50" r="22" fill="#e7cf8b" opacity=".12" />
        </g>
      ))}
      <g transform="translate(730 220)">
        <path
          d="M-60 0V-105H60V0"
          stroke="#4d5e50"
          strokeWidth="14"
          fill="#223d37"
        />
        <path d="M-78-105H78" stroke="#9c9971" strokeWidth="9" />
        <Motif
          symbol={floor.symbol}
          x={0}
          y={-54}
          scale={0.8}
          color={floor.color}
        />
        <text y="25" textAnchor="middle" fill="#bfc6a5" fontSize="11">
          {floor.motif}
        </text>
      </g>
      {region.obstacles.map((o, i) => (
        <g key={i} transform={`translate(${o.x} ${o.y})`}>
          <ellipse cy="9" rx={o.r + 15} ry="15" fill="#101f20" opacity=".55" />
          {i % 3 === 0 ? (
            <>
              <path
                d={`M-${o.r} 2l10-${o.r} 28-15 23 35-9 15Z`}
                fill="#536260"
                stroke="#263c3a"
                strokeWidth="3"
              />
              <path d="M-15-20 10-9 25-18" stroke="#8b9b8d" fill="none" />
            </>
          ) : (
            <>
              <path
                d="M0 5V-60m0 20-24-25M0-30l25-25"
                stroke="#4d5248"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d={`M-${o.r + 13}-39Q-65-92-10-107Q19-145 40-104Q80-92 ${o.r + 9}-40Z`}
                fill={
                  region.biome === "frost"
                    ? "#678691"
                    : region.biome === "ember"
                      ? "#66534b"
                      : "#3f6254"
                }
                stroke="#233b34"
                strokeWidth="3"
              />
              <path
                d="M-35-66q35-30 68-12"
                fill="none"
                stroke="#799477"
                opacity=".35"
                strokeWidth="5"
              />
            </>
          )}
        </g>
      ))}
      {region.landmarks.map((l) => (
        <g key={l.id} transform={`translate(${l.x} ${l.y})`}>
          <ellipse
            rx={l.kind === "arena" ? 150 : 100}
            ry={l.kind === "arena" ? 95 : 65}
            fill="url(#pool)"
          />
          {l.kind === "portal" ? (
            <>
              <ellipse
                cy="6"
                rx="65"
                ry="23"
                fill="#18292a"
                stroke={floor.color}
                strokeWidth="2"
              />
              <path
                d="M-52 0V-90Q0-160 52-90V0"
                stroke="#314443"
                strokeWidth="24"
                fill="#1a343c"
              />
              <path
                d="M-49 0V-89Q0-150 49-89V0"
                stroke={floor.color}
                strokeWidth="5"
                fill="none"
              />
              <path
                d="M-24-12Q-43-70 0-109Q43-70 24-12"
                fill={floor.color}
                opacity=".28"
              />
              <circle
                cy="-60"
                r="19"
                fill="none"
                stroke="#e9d9a5"
                strokeDasharray="3 7"
                strokeWidth="2"
              />
              <text y="-53" textAnchor="middle" fill="#f6e5b5" fontSize="19">
                {l.target}
              </text>
            </>
          ) : l.kind === "arena" ? (
            <>
              <ellipse
                rx="130"
                ry="75"
                fill="#34403b"
                stroke="#95805c"
                strokeDasharray="5 8"
                strokeWidth="2"
              />
              <PunishmentStage
                floor={floor.id}
                x={-86}
                y={-108}
                scale={0.48}
                animate={!settings.display.reduceMotion}
              />
            </>
          ) : l.kind === "npc" || l.kind === "rest" ? (
            <>
              <path
                d="M-73 8V-62L0-102 73-62V8"
                fill="#3b4a40"
                stroke="#1a2e2c"
                strokeWidth="5"
              />
              <path
                d="M-91-60 0-119 91-60 80-49H-80Z"
                fill="#556951"
                stroke="#1d3430"
                strokeWidth="4"
              />
              <path d="M-62-52V20M62-52V20" stroke="#968263" strokeWidth="9" />
              <circle cx="-63" cy="-28" r="13" fill="#f2c777" />
              <CharacterSprite
                id={l.character}
                y={12}
                scale={0.64}
                animate={!settings.display.reduceMotion}
              />
            </>
          ) : l.kind === "cache" ? (
            <>
              <rect
                x="-28"
                y="-32"
                width="56"
                height="36"
                rx="5"
                fill={
                  me?.discoveries?.includes(pointKey(floor.id, l.id))
                    ? "#4d6054"
                    : "#ab8351"
                }
                stroke="#292f28"
                strokeWidth="4"
              />
              <path
                d="M-29-18H29M-15-31V2M16-31V2"
                stroke="#d9b96d"
                strokeWidth="3"
              />
              <rect
                x="-5"
                y="-20"
                width="10"
                height="13"
                rx="2"
                fill="#f4d889"
              />
            </>
          ) : (
            <>
              <path
                d="M-30 8V-61l30-19 30 19V8Z"
                fill="#61786c"
                stroke="#233c34"
                strokeWidth="4"
              />
              <path
                d="M0-62V-5m-14-43 28 0m-28 17h28"
                stroke={floor.color}
                strokeWidth="4"
              />
              <circle
                cy="-38"
                r="41"
                stroke={floor.color}
                strokeDasharray="2 14"
                fill="none"
              />
            </>
          )}
          <g
            transform={`translate(0 ${l.kind === "portal" ? 37 : l.kind === "arena" ? 87 : 47})`}
          >
            <rect
              x="-105"
              y="-15"
              width="210"
              height="24"
              rx="12"
              fill="#152a2b"
              opacity=".85"
            />
            <text
              textAnchor="middle"
              fill="#e2e4ce"
              fontSize="13"
              fontFamily="Be Vietnam Pro, sans-serif"
            >
              {l.kind === "portal"
                ? `${l.name} · ${floorsName(l.target!)}`
                : l.name}
            </text>
          </g>
        </g>
      ))}
      {world.social?.bananas.map((b) => (
        <text key={b.id} x={b.x} y={b.y} fontSize="30">
          🍌
        </text>
      ))}
      {path.length > 0 && me && (
        <>
          <path
            d={`M${me.x} ${me.y} ${path.map((p) => `L${p.x} ${p.y}`).join(" ")}`}
            stroke="#dac995"
            strokeWidth="2"
            strokeDasharray="4 9"
            fill="none"
            opacity=".65"
          />
          <circle
            cx={path.at(-1)!.x}
            cy={path.at(-1)!.y}
            r="12"
            fill="none"
            stroke="#e8d49a"
            strokeWidth="2"
          />
        </>
      )}
      {world.players
        .filter((p) => p.soul?.dragging)
        .map((p) => {
          const victim = world.players.find((v) => v.id === p.soul?.dragging);
          return victim ? (
            <path
              key={p.id}
              d={`M${p.x} ${p.y - 18} L${victim.x} ${victim.y - 15}`}
              stroke="#cfb67b"
              strokeWidth="3"
              strokeDasharray="5 4"
            />
          ) : null;
        })}
      {[...world.players]
        .sort((a, b) => a.y - b.y)
        .map((p) => (
          <g
            key={p.id}
            className={`soul-actor state-${p.soul?.state || "free"}`}
            data-player={p.id}
            transform={`translate(${p.x} ${p.y})`}
            onPointerDown={(e) => {
              if (p.id !== me?.id) {
                e.stopPropagation();
                onSelect(p.id);
              }
            }}
            style={{ cursor: p.id === me?.id ? "default" : "pointer" }}
          >
            <ellipse rx="24" ry="11" fill="#0f2425" opacity=".55" />
            {p.id === me?.id && (
              <ellipse
                rx="26"
                ry="12"
                stroke="#f8d387"
                strokeWidth="2"
                fill="none"
              />
            )}
            {selected === p.id && (
              <ellipse
                rx="32"
                ry="17"
                stroke="#f19c8c"
                strokeWidth="2"
                fill="none"
              />
            )}
            <g className="soul-body-state">
              <CharacterSprite
                id="vong-hon"
                y={0}
                scale={0.48}
                appearance={p.appearance}
                animate={!settings.display.reduceMotion}
              />
            </g>
            {p.soul && p.soul.guardUntil > (world.social?.serverTime || 0) && (
              <circle
                cy="-28"
                r="40"
                stroke="#a8daf3"
                strokeWidth="3"
                fill="#94d4e91a"
              />
            )}
            {p.soul?.combo === 1 && (
              <text x="20" y="-60" fontSize="20" fill="#f5cd85">
                ✦
              </text>
            )}
            {settings.display.showNames && (
              <>
                <rect
                  x="-58"
                  y="-83"
                  width="116"
                  height="23"
                  rx="11"
                  fill="#162c2e"
                  opacity=".9"
                />
                <text
                  y="-67"
                  textAnchor="middle"
                  fill={
                    p.id === me?.id ? "#f3d895" : teams[p.team || "A"].color
                  }
                  fontSize="12"
                >
                  {p.name}
                  {p.id === me?.id ? " · bạn" : ""}
                </text>
              </>
            )}
            {p.soul?.state !== "free" && (
              <text y="-94" textAnchor="middle" fill="#ffcf8b" fontSize="12">
                {stateNames[p.soul?.state || "free"]}
              </text>
            )}
          </g>
        ))}
      {settings.display.particles &&
        Array.from({ length: 30 }, (_, i) => (
          <circle
            key={i}
            className="ow-firefly"
            cx={150 + ((i * 397) % 2500)}
            cy={100 + ((i * 281) % 1700)}
            r={2 + (i % 2)}
            fill="#d6dca8"
            opacity=".5"
            style={{ animationDelay: `${i % 7}s` }}
          />
        ))}
      <rect
        x="25"
        y="25"
        width={MAP.width - 50}
        height={MAP.height - 50}
        rx="90"
        stroke="#132a2a"
        strokeWidth="50"
        fill="none"
      />
    </svg>
  );
}
function floorsName(id: number) {
  return `Vùng ${id}`;
}
