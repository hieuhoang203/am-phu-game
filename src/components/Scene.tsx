import React, { useRef } from "react";
import { WORLD, type Floor, type Player } from "../../shared/world";
import { Motif } from "./Motif";
import { CharacterSprite } from "./CharacterSprite";
import { PunishmentStage } from "./PunishmentStage";
import { punishments } from "../../shared/mythology";
import {
  MISCHIEF,
  teams,
  stateNames,
  type SocialSnapshot,
} from "../../shared/mischief";
export function Scene({
  floor,
  players,
  me,
  lamps,
  onGo,
  onAction,
  full = false,
  onInspect,
  selectedId = "",
  onSelect,
  social,
}: {
  floor: Floor;
  players: Player[];
  me?: Player;
  lamps: boolean[];
  onGo: (x: number, y: number) => void;
  onAction: (target: string) => void;
  full?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
  social?: SocialSnapshot;
  onInspect?: (
    tab: "characters" | "punishments" | "rebirth",
    character?: string,
  ) => void;
}) {
  const punishment = punishments[floor.id - 1];
  const sceneRef = useRef<SVGSVGElement>(null);
  return (
    <svg
      ref={sceneRef}
      className={`scene ${full ? "full" : ""}`}
      viewBox="0 0 1000 680"
      role="img"
      aria-label={`Bản đồ khám phá tầng ${floor.id}: ${floor.name}. Nhấp để di chuyển.`}
      onPointerDown={(e) => {
        if (!me || !sceneRef.current) return;
        const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(
          sceneRef.current.getScreenCTM()!.inverse(),
        );
        onGo(point.x, point.y);
      }}
    >
      <defs>
        <radialGradient id="mist">
          <stop stopColor={floor.color} stopOpacity=".22" />
          <stop offset="1" stopColor="#101a1b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="stone" x2="0" y2="1">
          <stop stopColor="#384847" />
          <stop offset="1" stopColor="#1e2c2d" />
        </linearGradient>
        <linearGradient id="cliff" x2="0" y2="1">
          <stop stopColor="#263737" />
          <stop offset="1" stopColor="#101b1e" />
        </linearGradient>
        <linearGradient id="roof" x2="0" y2="1">
          <stop stopColor="#4b6660" />
          <stop offset="1" stopColor="#172d2c" />
        </linearGradient>
        <radialGradient id="glow">
          <stop stopColor="#e2bd76" stopOpacity=".5" />
          <stop offset="1" stopColor="#e2bd76" stopOpacity="0" />
        </radialGradient>
        <filter id="blur">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <pattern
          id="tiles"
          width="60"
          height="34"
          patternUnits="userSpaceOnUse"
          patternTransform="skewX(-25)"
        >
          <path
            d="M0 0H60V34H0Z"
            fill="none"
            stroke="#788b7e"
            strokeOpacity=".12"
          />
        </pattern>
      </defs>
      <rect width="1000" height="680" fill={punishment.palette[0]} />
      <ellipse cx="500" cy="330" rx="540" ry="310" fill="url(#mist)" />
      <g fill="#1a2b2d" opacity=".8">
        <path d="M0 270L70 180L100 216L170 85L220 180L285 120L310 300ZM720 280L770 117L820 184L865 70L920 176L1000 120V330Z" />
        <path d="M0 560L90 410L140 480L200 450L290 680H0ZM760 680L830 450L880 470L930 365L1000 430V680Z" />
      </g>
      <g stroke="#5b7e75" strokeWidth="1" opacity=".15" fill="none">
        <path d="M0 400Q150 360 280 420T600 420T1000 350M0 500Q150 460 280 520T600 520T1000 450M0 600Q150 560 280 620T600 620T1000 550" />
      </g>
      <ellipse
        cx="500"
        cy="590"
        rx="340"
        ry="65"
        fill="#050e10"
        opacity=".5"
        filter="url(#blur)"
      />
      <path
        d="M150 375L500 178L850 375L820 510L510 666L180 515Z"
        fill="url(#cliff)"
      />
      <g stroke="#45605b" opacity=".2">
        <path d="M220 430L230 535M280 460L290 570M350 500L365 610M650 505L635 605M730 460L715 570M790 430L770 535" />
      </g>
      <path
        d="M150 370L500 175L850 370L510 585Z"
        fill="url(#stone)"
        stroke="#52645b"
        strokeWidth="2"
      />
      <path d="M150 370L500 175L850 370L510 585Z" fill="url(#tiles)" />
      <path d="M430 540L510 586L580 540V564L510 610L430 563Z" fill="#4b5850" />
      <path
        d="M430 553L510 598L580 552M446 573L510 610L564 575"
        stroke="#182b2c"
        strokeWidth="3"
        fill="none"
      />
      <g fill="none" stroke="#a3ad88" opacity=".16">
        <ellipse cx="500" cy="401" rx="145" ry="78" />
        <ellipse cx="500" cy="401" rx="131" ry="69" />
        <path d="M368 401H632M500 333V470M405 350L595 450M405 450L595 350" />
      </g>
      <Motif
        symbol={floor.symbol}
        x={500}
        y={401}
        color={floor.color}
        scale={1.1}
      />
      {/* The gate and pavilion are original stylised game illustrations. */}
      <g>
        <path
          d="M369 231L500 165L631 231L500 301Z"
          fill="#182a29"
          stroke="#566254"
        />
        <path
          d="M389 228V140H416V244M584 244V140H611V228"
          fill="#34413a"
          stroke="#6e7160"
        />
        <path d="M398 161H602V187H398Z" fill="#574e39" />
        <path d="M392 162H608V167H392" stroke="#ae9460" />
        <path
          d="M350 142Q380 146 399 120L500 89L601 120Q620 146 650 142L616 165L500 138L384 165Z"
          fill="url(#roof)"
          stroke="#718174"
        />
        <path
          d="M375 145L500 113L625 145M397 124L500 97L604 124"
          fill="none"
          stroke="#8b9b82"
          strokeOpacity=".4"
        />
        <path d="M420 178H580V204H420Z" fill="#1b2b28" stroke="#8e7a4f" />
        <text
          x="500"
          y="196"
          textAnchor="middle"
          fill="#cfb87f"
          fontSize="16"
          letterSpacing="1"
        >
          {floor.name}
        </text>
        <path
          d="M435 242L500 206L565 242L500 277Z"
          fill="#395044"
          stroke="#8f9877"
          opacity=".6"
        />
        <ellipse cx="500" cy="224" rx="47" ry="36" fill="url(#glow)" />
        <path
          d="M465 230Q500 166 535 230"
          fill="none"
          stroke="#bda76a"
          strokeWidth="1.5"
          opacity=".6"
        />
      </g>
      <g fill="#192b2b" stroke="#4a5f54">
        <path d="M194 364V273L222 259L251 277V366L222 383Z" />
        <path d="M190 274L221 247L255 274L222 289Z" />
        <path d="M751 366V277L780 259L808 273V364L780 383Z" />
        <path d="M747 274L780 247L812 274L780 289Z" />
      </g>
      <Motif
        symbol={floor.symbol}
        x={221}
        y={323}
        scale={0.45}
        color={floor.color}
      />
      <Motif
        symbol={floor.symbol}
        x={780}
        y={323}
        scale={0.45}
        color={floor.color}
      />
      <g opacity=".16" fill={floor.color}>
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={
              floor.id === 8
                ? `M${i * 210 - 40} 350L${i * 210 + 40} 110L${i * 210 + 105} 350Z`
                : [7, 16].includes(floor.id)
                  ? `M${i * 210 - 80} 350L${i * 210 + 50} ${80 + (i % 2) * 70}L${i * 210 + 155} 350Z`
                  : `M${i * 210} 330V190H${i * 210 + 28}V330Z`
            }
          />
        ))}
      </g>
      <g
        className="scene-theatre"
        role="button"
        tabIndex={0}
        aria-label={`Xem mô hình hình phạt: ${punishment.title}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onInspect?.("punishments");
          }
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onInspect?.("punishments");
        }}
      >
        <PunishmentStage floor={floor.id} x={320} y={285} scale={1} />
        <g className="scene-caption">
          <rect
            x="385"
            y="564"
            width="230"
            height="28"
            rx="4"
            fill="#111e20"
            stroke={floor.color}
            strokeOpacity=".35"
          />
          <text
            x="500"
            y="582"
            textAnchor="middle"
            fill="#d1bf93"
            fontSize="12"
          >
            {punishment.title} · Xem chi tiết ↗
          </text>
        </g>
      </g>
      <g
        className="map-target"
        onPointerDown={(e) => {
          e.stopPropagation();
          onInspect?.("characters", "nguu-dau");
        }}
      >
        <CharacterSprite id="nguu-dau" x={350} y={265} scale={0.65} />
        <text x="350" y="281" textAnchor="middle" fill="#c0b590" fontSize="10">
          NGƯU ĐẦU
        </text>
      </g>
      <g
        className="map-target"
        onPointerDown={(e) => {
          e.stopPropagation();
          onInspect?.("characters", "ma-dien");
        }}
      >
        <CharacterSprite id="ma-dien" x={650} y={265} scale={0.65} />
        <text x="650" y="281" textAnchor="middle" fill="#c0b590" fontSize="10">
          MÃ DIỆN
        </text>
      </g>
      {WORLD.lanterns.map((p, i) => (
        <g
          key={i}
          className="map-target"
          onPointerDown={(e) => {
            e.stopPropagation();
            onAction(`lamp${i}`);
          }}
        >
          <circle
            cx={p.x}
            cy={p.y - 30}
            r="60"
            fill={lamps[i] ? "url(#glow)" : "transparent"}
          />
          <path
            d={`M${p.x - 12} ${p.y + 8}L${p.x + 12} ${p.y + 8}L${p.x + 9} ${p.y - 1}H${p.x - 9}Z`}
            fill="#697563"
          />
          <path
            d={`M${p.x} ${p.y}V${p.y - 67}`}
            stroke="#78816c"
            strokeWidth="4"
          />
          <rect
            x={p.x - 13}
            y={p.y - 67}
            width="26"
            height="34"
            rx="8"
            fill={lamps[i] ? "#d1af68" : "#425149"}
            stroke="#ae9c6d"
          />
          <path
            d={`M${p.x - 18} ${p.y - 67}H${p.x + 18}M${p.x} ${p.y - 74}V${p.y - 68}`}
            stroke="#b7a26c"
            strokeWidth="3"
          />
          <text
            x={p.x}
            y={p.y + 31}
            textAnchor="middle"
            fill={lamps[i] ? "#d3bc86" : "#8ca094"}
            fontSize="13"
          >
            {lamps[i] ? "Đã thắp sáng" : `Đèn dẫn hồn ${i + 1}`}
          </text>
        </g>
      ))}
      {me && (
        <g className="prank-zone">
          {MISCHIEF.safeZones.map((z) => (
            <g key={z.name}>
              <circle
                cx={z.x}
                cy={z.y}
                r={z.radius}
                fill="#97c9ad"
                fillOpacity=".045"
                stroke="#a2c7a3"
                strokeOpacity=".25"
                strokeDasharray="3 6"
              />
              <text
                x={z.x}
                y={z.y + z.radius + 13}
                fontSize="9"
                textAnchor="middle"
                fill="#9dbaa1"
              >
                VÙNG NGHỈ · {z.name}
              </text>
            </g>
          ))}
          <circle
            cx={MISCHIEF.trap.x}
            cy={MISCHIEF.trap.y}
            r={MISCHIEF.trap.radius}
            fill="#d9ab65"
            fillOpacity=".02"
            stroke="#deb36c"
            strokeOpacity={me.soul?.dragging ? ".85" : ".22"}
            strokeWidth="2"
            strokeDasharray="8 7"
          />
          <text x={500} y={555} fontSize="9" textAnchor="middle" fill="#d2b77d">
            VÒNG NÉM · KÉO VONG TỚI ĐÂY
          </text>
        </g>
      )}
      {social?.bananas.map((b) => (
        <g
          key={b.id}
          transform={`translate(${b.x} ${b.y})`}
          className="prank-banana"
        >
          <title>Vỏ chuối · đến gần rồi X để dọn</title>
          <ellipse cy="5" rx="17" ry="7" fill="#0c1c1a" opacity=".6" />
          <path
            d="M0-11Q-10 5-22 0Q-17 16-1 7Q6 17 20 8Q6 6 3-10Z"
            fill="#dfc16b"
            stroke="#8d784c"
            strokeWidth="2"
          />
          <path d="M1-12L3-17" stroke="#9b8752" strokeWidth="4" />
        </g>
      ))}
      <g
        className="map-target"
        onPointerDown={(e) => {
          e.stopPropagation();
          onAction("npc");
        }}
      >
        <CharacterSprite id="phan-quan" x={500} y={295} scale={0.48} />
        <text x="500" y="221" textAnchor="middle" fontSize="11" fill="#d7c08b">
          DẪN HỒN SỨ · PHÁN QUAN
        </text>
      </g>
      {Array.from({ length: 28 }, (_, i) => (
        <circle
          key={i}
          className="firefly"
          cx={(i * 137 + 41) % 980}
          cy={(i * 79 + 80) % 620}
          r={i % 3 === 0 ? 2 : 1}
          fill={floor.color}
          style={{ animationDelay: `${i * 0.27}s` }}
        />
      ))}
      {players.map((p) => (
        <g
          key={p.id}
          style={{ transition: "transform 90ms linear" }}
          transform={`translate(${p.x} ${p.y})`}
          className={`soul-actor state-${p.soul?.state || "free"} ${p.id === me?.id ? "is-local" : ""} ${selectedId === p.id ? "is-selected" : ""}`}
          data-player-name={p.name}
          data-player-id={p.id}
          data-x={p.x}
          data-y={p.y}
          data-soul-state={p.soul?.state || "free"}
          onPointerDown={(e) => {
            e.stopPropagation();
            if (p.id !== me?.id) onSelect?.(p.id);
          }}
          role="button"
          tabIndex={0}
          aria-label={`Chọn vong ${p.name}`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.stopPropagation();
              onSelect?.(p.id);
            }
          }}
        >
          <title>{`${p.name} · Phe ${p.team || "A"} · ${stateNames[p.soul?.state || "free"]}`}</title>
          <ellipse cy="9" rx="17" ry="6" fill="#091517" opacity=".7" />
          <ellipse
            cy="10"
            rx="21"
            ry="10"
            fill="none"
            stroke={teams[p.team || "A"].color}
            strokeWidth="2"
            opacity=".65"
          />
          {selectedId === p.id && (
            <ellipse
              className="selected-soul-ring"
              cy="10"
              rx="28"
              ry="14"
              fill="none"
              stroke="#f0cf77"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
          )}
          {p.soul &&
            (p.soul.immuneUntil > (social?.serverTime || Date.now()) ||
              p.soul.guardUntil > (social?.serverTime || Date.now())) && (
              <ellipse
                cx="0"
                cy="-16"
                rx="25"
                ry="34"
                fill="#bcd9ba"
                fillOpacity=".06"
                stroke={
                  p.soul.guardUntil > (social?.serverTime || Date.now())
                    ? "#eed29a"
                    : "#a0d1c8"
                }
                strokeOpacity=".65"
                strokeDasharray="4 5"
              />
            )}
          {p.id === me?.id && (
            <ellipse
              cy="9"
              rx="23"
              ry="10"
              stroke="#d4b575"
              fill="none"
              strokeDasharray="3 4"
            />
          )}
          <g className="soul-body-state">
            <CharacterSprite
              id="vong-hon"
              appearance={p.appearance}
              scale={0.44}
              pose={
                p.soul?.state === "free"
                  ? p.soul.actionUntil &&
                    p.soul.actionUntil > (social?.serverTime || Date.now())
                    ? "work"
                    : "idle"
                  : "surprised"
              }
              animate={p.soul?.state === "free" || !p.soul}
            />
          </g>
          {(p.soul?.state === "stunned" ||
            p.soul?.state === "dragged" ||
            p.soul?.combo === 1) && (
            <g transform="translate(0 -53)">
              <g className="soul-star-ring">
                <text x="-23" y="0" fill="#f0cc72" fontSize="13">
                  ✦
                </text>
                <text x="17" y="0" fill="#f0cc72" fontSize="13">
                  ✦
                </text>
              </g>
            </g>
          )}
          <g
            className="soul-nameplate"
            transform={`translate(0 ${selectedId === p.id ? -18 : 0})`}
          >
            <text
              y="-68"
              textAnchor="middle"
              fill={p.id === me?.id ? "#ead6a6" : "#a5c5ba"}
              fontSize="13"
              stroke="#132225"
              strokeWidth="3"
              paintOrder="stroke"
            >
              {p.name}
              {p.id === me?.id ? " · Bạn" : ""}
            </text>
            <text
              y="-54"
              textAnchor="middle"
              fill={teams[p.team || "A"].color}
              fontSize="9"
            >
              {p.team || "A"} · {stateNames[p.soul?.state || "free"]}
            </text>
          </g>
        </g>
      ))}
      {players
        .filter((p) => p.soul?.dragging)
        .map((p) => {
          const t = players.find((t) => t.id === p.soul!.dragging);
          return (
            t && (
              <path
                key={`rope-${p.id}`}
                className="soul-rope"
                d={`M${p.x} ${p.y - 13}Q${(p.x + t.x) / 2} ${(p.y + t.y) / 2 + 3} ${t.x} ${t.y - 10}`}
                stroke="#c9ac72"
                strokeWidth="3"
                fill="none"
              />
            )
          );
        })}
      {!me && <CharacterSprite id="vong-hon" x={500} y={550} scale={0.48} />}
    </svg>
  );
}
