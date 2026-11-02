import React, { useId } from "react";
import { characterById, type CharacterModel } from "../../shared/mythology";
import {
  normalizeAppearance,
  soulPalettes,
  type SoulAppearance,
} from "../../shared/customization";
export type SpritePose = "idle" | "work" | "surprised";
/** Editable 2D rig. Origin at the feet; head, hands and props animate independently. */
export function CharacterSprite({
  id = "quy-su",
  model,
  x = 0,
  y = 0,
  scale = 1,
  pose = "idle",
  animate = true,
  flip = false,
  appearance,
}: {
  id?: string;
  model?: CharacterModel;
  x?: number;
  y?: number;
  scale?: number;
  pose?: SpritePose;
  animate?: boolean;
  flip?: boolean;
  appearance?: SoulAppearance;
}) {
  const base = model || characterById(id),
    look = normalizeAppearance(appearance),
    palette = soulPalettes[look.palette];
  const c =
      base.kind === "soul"
        ? { ...base, color: palette.body, skin: palette.face }
        : base,
    kind = c.kind,
    uid = useId().replace(/:/g, "");
  const royal = kind === "king",
    official = royal || kind === "judge",
    ghost = kind === "soul",
    beast = kind === "ox" || kind === "horse",
    white = kind === "white",
    dark = kind === "black",
    old = kind === "mengpo",
    holy = kind === "dizang";
  const stroke = "#1a2930",
    cloth = `cloth-${uid}`,
    face = `face-${uid}`;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale * (white ? 1.12 : dark ? 0.9 : 1)})`}
      className={`character-sprite kind-${kind} pose-${pose} ${animate ? "animated" : ""}`}
      data-character={c.id}
    >
      <title>{`${c.name} · ${c.features}`}</title>
      <defs>
        <linearGradient id={cloth} x2="1" y2="1">
          <stop stopColor={c.color} />
          <stop offset="1" stopColor={c.color} stopOpacity=".58" />
        </linearGradient>
        <radialGradient id={face} cx=".35" cy=".25">
          <stop stopColor={c.skin} />
          <stop offset="1" stopColor={c.skin} stopOpacity=".78" />
        </radialGradient>
      </defs>
      <ellipse
        cy="4"
        rx={ghost ? 22 : 31}
        ry="8"
        fill="#091316"
        opacity=".35"
      />
      {ghost && look.aura !== "none" && (
        <g
          className={`cosmetic-aura aura-${look.aura}`}
          stroke={palette.body}
          fill="none"
          opacity=".7"
        >
          {look.aura === "orbit" ? (
            <>
              <ellipse cy="-42" rx="47" ry="13" transform="rotate(-18 0 -42)" />
              <circle
                className="cosmetic-particle"
                cx="-42"
                cy="-28"
                r="4"
                fill={palette.face}
              />
            </>
          ) : look.aura === "mist" ? (
            <>
              <path
                d="M-41-12Q-52-29-36-39M35-17Q53-32 37-49M-25 10Q0 23 27 10"
                strokeWidth="4"
                opacity=".5"
              />
            </>
          ) : (
            <>
              {[-1, 1].map((n, i) => (
                <g className="cosmetic-particle" key={n}>
                  <path
                    d={`M${n * 38} ${-50 - i * 26}l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z`}
                    fill={palette.face}
                    strokeWidth="1"
                  />
                </g>
              ))}
            </>
          )}
        </g>
      )}
      {holy && (
        <>
          <circle cy="-79" r="43" fill="#dec078" opacity=".12" />
          <circle
            cy="-79"
            r="37"
            fill="none"
            stroke="#ddc88a"
            strokeWidth="1.5"
            strokeDasharray="3 5"
          />
        </>
      )}
      <g
        className="sprite-body"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {!ghost && (
          <g className="sprite-feet">
            <path
              d="M-19-16L-23 0Q-13 8-4 0L-6-15"
              fill={beast ? "#403c3a" : "#25333b"}
            />
            <path
              d="M6-15L4 0Q15 8 24 0L20-16"
              fill={beast ? "#403c3a" : "#25333b"}
            />
            {beast && <path d="M-13-2V4M14-2V4" stroke="#a69879" />}
          </g>
        )}
        <path
          d={
            ghost
              ? "M-28-36Q-34-63 0-66Q35-64 28-33L20-11L9-17L0-2L-10-15L-23-8Z"
              : old
                ? "M-26-10Q-32-35-19-60L15-64Q34-37 28-10Q0 1-26-10Z"
                : "M-27-11L-22-61Q0-74 23-61L29-11Q0 1-27-11Z"
          }
          fill={`url(#${cloth})`}
        />
        {!ghost && (
          <>
            <path
              d="M-19-60L0-32L20-61M0-31V-9"
              fill="none"
              stroke={royal || holy ? "#e1bc74" : "#d0b388"}
              strokeWidth="3"
            />
            <path d="M-25-27Q0-20 26-27L26-17Q0-10-26-17Z" fill="#423b39" />
            <rect x="-7" y="-27" width="14" height="12" rx="3" fill="#cba361" />
            {beast || kind === "demon" ? (
              <>
                <path d="M-22-55Q0-38 22-55L18-32Q0-21-19-32Z" fill="#445860" />
                <path d="M-14-45H14M-10-36H10" stroke="#9aab9c" />
              </>
            ) : (
              <path
                d="M-12-8L-15-31M12-8L15-31"
                fill="none"
                stroke="#ffffff"
                opacity=".12"
              />
            )}
          </>
        )}
        <g className="sprite-hand-left">
          <path
            d="M-22-58Q-47-50-39-28L-25-32L-15-51"
            fill={`url(#${cloth})`}
          />
          <circle cx="-33" cy="-31" r="8" fill={c.skin} />
        </g>
        <g className="sprite-hand-right">
          <path d="M22-58Q44-52 38-29L25-32L15-50" fill={`url(#${cloth})`} />
          <circle cx="32" cy="-31" r="8" fill={c.skin} />
          {(kind === "demon" || kind === "ox" || kind === "horse") && (
            <g>
              <path d="M43 1V-101" stroke="#b2b7a2" strokeWidth="4" />
              <path
                d={
                  kind === "horse"
                    ? "M43-119L52-98L43-91L34-98Z"
                    : "M29-111V-96Q43-80 57-96V-111M43-120V-90"
                }
                stroke="#b8c5b4"
                fill={kind === "horse" ? "#aab8ad" : "none"}
              />
              <path d="M39-64L49-58M39-57L49-51" stroke="#b78b56" />
            </g>
          )}
          {(dark || white) && (
            <g stroke="#b8c5b3" fill="none">
              <path d="M38-32Q56-7 29 8Q10 16-4 6" strokeWidth="2" />
              {[0, 1, 2, 3, 4].map((i) => (
                <ellipse
                  key={i}
                  cx={40 - i * 7}
                  cy={-11 + i * 5}
                  rx="5"
                  ry="7"
                  strokeWidth="2"
                />
              ))}
            </g>
          )}
          {holy && (
            <g stroke="#d8b45e" fill="none">
              <path d="M42 0V-108" strokeWidth="4" />
              <circle cx="42" cy="-110" r="12" />
              {[-1, 0, 1].map((i) => (
                <circle
                  key={i}
                  cx={42 + i * 9}
                  cy={-98 + Math.abs(i) * 3}
                  r="5"
                  strokeWidth="1.5"
                />
              ))}
            </g>
          )}
        </g>
        {official && (
          <>
            <rect
              x="-29"
              y="-48"
              width="41"
              height="24"
              rx="3"
              fill="#e5cea0"
              transform="rotate(10)"
            />
            <path
              d="M-23-39L3-35M-22-32L0-29"
              stroke="#7e745c"
              strokeWidth="1.5"
            />
            {kind === "judge" ? (
              <path d="M20-30L45-66L49-61L27-26Z" fill="#bd9863" />
            ) : (
              <path d="M23-60L38-63L42-30L27-28Z" fill="#c6a660" />
            )}
          </>
        )}
        {old && (
          <>
            <path d="M-34-28Q0-8 34-28L26-5Q0 5-26-5Z" fill="#6f7771" />
            <ellipse cy="-27" rx="34" ry="10" fill="#d5bc80" />
            <path d="M31-37L44-61" stroke="#a4af9f" strokeWidth="4" />
            <ellipse cx="30" cy="-34" rx="12" ry="5" fill="#d9b977" />
            <path
              className="sprite-steam"
              d="M-11-35Q-20-46-10-55M8-36Q0-49 11-59"
              fill="none"
              stroke="#d8ded1"
              strokeWidth="2"
              opacity=".6"
            />
          </>
        )}
        <g className="sprite-head">
          {beast && (
            <>
              {kind === "ox" ? (
                <>
                  <path
                    d="M-21-85Q-48-94-34-114Q-36-97-16-103M21-85Q48-94 34-114Q36-97 16-103"
                    fill="#d5bd83"
                  />
                  <path
                    d="M-24-85L-41-89L-37-75L-20-72M24-85L41-89L37-75L20-72"
                    fill={c.skin}
                  />
                </>
              ) : (
                <>
                  <path
                    d="M-17-96Q-29-127-17-127L-5-99M10-99Q8-130 21-126L23-92"
                    fill={c.skin}
                  />
                  <path d="M-15-111L-11-100M18-114L17-102" stroke="#805c56" />
                </>
              )}
            </>
          )}
          {old && (
            <>
              <circle cx="-13" cy="-101" r="16" fill="#c4c9c2" />
              <circle cx="6" cy="-108" r="12" fill="#d4d6cb" />
            </>
          )}
          <path
            d={
              kind === "horse"
                ? "M-23-92Q0-115 24-93L28-65Q21-43 0-43Q-24-44-27-66Z"
                : ghost
                  ? "M-29-77Q-31-107 0-109Q32-107 29-77L25-56Q0-44-25-57Z"
                  : "M-28-80Q-29-107 0-108Q30-107 29-79Q25-54 0-53Q-25-54-28-80Z"
            }
            fill={`url(#${face})`}
          />
          {(kind === "ox" || kind === "horse") && (
            <ellipse
              cy={kind === "horse" ? -61 : -65}
              rx="23"
              ry={kind === "horse" ? 18 : 14}
              fill={kind === "horse" ? "#ddbe96" : "#b3aa94"}
            />
          )}
          {kind === "demon" && (
            <>
              <path
                d="M-21-100L-21-119L-8-105M10-105L24-119L22-98"
                fill="#e0c085"
              />
              <path
                d="M-26-83L-39-90L-35-74L-25-72M26-83L39-90L35-74L25-72"
                fill={c.skin}
              />
            </>
          )}
          {royal ? (
            <>
              <path d="M-24-99L-20-119H20L24-99" fill="#253941" />
              <path
                d="M-39-119L0-129L40-119L0-108Z"
                fill="#3c4342"
                stroke="#c4a365"
              />
              {[-25, -13, 0, 13, 25].map((n, i) => (
                <g key={n}>
                  <path
                    d={`M${n}-116V${-98 + (i % 2) * 4}`}
                    stroke="#c5a568"
                    strokeWidth="1"
                  />
                  <circle cx={n} cy={-97 + (i % 2) * 4} r="2" fill="#e1c987" />
                </g>
              ))}
            </>
          ) : kind === "judge" ? (
            <>
              <path d="M-26-100L-20-119H20L26-100Z" fill="#263c3d" />
              <path
                d="M-23-108L-52-115L-50-106L-24-99M23-108L52-115L50-106L24-99"
                fill="#354d49"
              />
            </>
          ) : dark || white ? (
            <>
              <path
                d="M-22-101L-17-143H17L22-101Z"
                fill={white ? "#e7e2cd" : "#303947"}
              />
              <rect
                x="-10"
                y="-137"
                width="20"
                height="29"
                rx="2"
                fill={white ? "#c6b995" : "#c7b58b"}
              />
              <text
                x="0"
                y="-117"
                textAnchor="middle"
                fontSize="15"
                fill="#514f45"
                stroke="none"
              >
                {white ? "B" : "H"}
              </text>
            </>
          ) : holy ? (
            <>
              <path
                d="M-27-99L-29-117L-14-110L0-125L14-110L29-117L27-99Z"
                fill="#d2ad63"
              />
              <circle cy="-108" r="4" fill="#9d6b52" />
            </>
          ) : old ? (
            <path
              d="M-27-82Q-39-113-5-113Q30-113 28-85Q18-104 5-95Q-12-105-27-82Z"
              fill="#d4d6ca"
            />
          ) : ghost ? null : kind === "demon" ? (
            <path d="M-8-105L0-116L10-105" fill="#334b48" />
          ) : beast ? (
            <path d="M-9-105L0-114L12-104L8-96Z" fill="#3e4241" />
          ) : null}
          {ghost && look.hat !== "none" && (
            <g className="soul-accessory">
              {look.hat === "leaf" ? (
                <>
                  <path
                    d="M-5-106Q-23-139 15-143Q24-116-5-106Z"
                    fill="#82b58e"
                  />
                  <path d="M-5-109L12-138" stroke="#d1ddb0" strokeWidth="1.5" />
                </>
              ) : look.hat === "lantern" ? (
                <>
                  <path d="M-18-108Q0-128 18-108" fill="#6f6c59" />
                  <path d="M0-113V-130" stroke="#d6be80" />
                  <rect
                    x="-12"
                    y="-151"
                    width="24"
                    height="23"
                    rx="7"
                    fill="#d7af6d"
                  />
                  <path
                    d="M-15-151H15M-7-145V-133M7-145V-133"
                    stroke="#ab784e"
                    strokeWidth="2"
                  />
                </>
              ) : look.hat === "lotus" ? (
                <>
                  <path
                    d="M0-107Q-33-105-31-127Q-13-133 0-107Q-18-131 0-144Q18-131 0-107Q13-133 31-127Q33-105 0-107Z"
                    fill="#cf9db9"
                    stroke="#f0c7d7"
                    strokeWidth="1.5"
                  />
                </>
              ) : (
                <>
                  <path
                    d="M-20-99Q-39-124-22-139L-12-107M12-107L22-139Q39-124 20-99"
                    fill="#dac494"
                  />
                </>
              )}
            </g>
          )}
          <g className="sprite-eyes" strokeWidth="2">
            {ghost && look.eyes === "sleepy" && pose !== "surprised" ? (
              <path
                d="M-18-82Q-11-76-4-82M4-82Q11-76 18-82"
                stroke="#344f50"
                strokeWidth="3"
                fill="none"
              />
            ) : (
              <>
                <ellipse cx="-11" cy="-81" rx="7" ry="8" fill="#f2e9d2" />
                <ellipse cx="11" cy="-81" rx="7" ry="8" fill="#f2e9d2" />
                <circle cx="-9" cy="-80" r="3" fill="#27323a" stroke="none" />
                <circle cx="13" cy="-80" r="3" fill="#27323a" stroke="none" />
                {ghost && look.eyes === "cheeky" && pose !== "surprised" && (
                  <>
                    <ellipse
                      cx="-11"
                      cy="-81"
                      rx="8"
                      ry="9"
                      fill={palette.face}
                      stroke="none"
                    />
                    <path
                      d="M-18-81L-9-84L-4-79"
                      fill="none"
                      stroke="#344f50"
                      strokeWidth="2"
                    />
                  </>
                )}
              </>
            )}
          </g>
          <path
            d={
              holy
                ? "M-17-91Q-11-95-5-91M5-91Q11-95 17-91"
                : official
                  ? "M-19-94L-6-91M6-91L19-96"
                  : "M-19-94Q-12-99-5-94M5-94Q12-96 19-91"
            }
            stroke={official ? "#53463b" : "#2e4546"}
            strokeWidth="3"
            fill="none"
          />
          <ellipse
            cx="-21"
            cy="-69"
            rx="5"
            ry="3"
            fill="#d58b7d"
            opacity=".5"
            stroke="none"
          />
          <ellipse
            cx="21"
            cy="-69"
            rx="5"
            ry="3"
            fill="#d58b7d"
            opacity=".5"
            stroke="none"
          />
          {pose === "surprised" ? (
            <ellipse cy="-63" rx="5" ry="7" fill="#334144" />
          ) : (
            <path
              d={
                holy
                  ? "M-6-65Q0-60 6-65"
                  : beast
                    ? "M-9-57Q0-51 9-57"
                    : "M-11-66Q0-55 11-66"
              }
              fill="none"
              stroke="#3d4240"
              strokeWidth="2"
            />
          )}
          {beast && (
            <>
              <ellipse
                cx="-9"
                cy="-65"
                rx="2"
                ry="3"
                fill="#574f46"
                stroke="none"
              />
              <ellipse
                cx="9"
                cy="-65"
                rx="2"
                ry="3"
                fill="#574f46"
                stroke="none"
              />
            </>
          )}
          {kind === "demon" && (
            <>
              <path
                d="M-9-65L-5-57L-2-63M9-65L5-57L2-63"
                fill="#efe4c8"
                strokeWidth="1"
              />
            </>
          )}
          {white && (
            <path
              d="M-5-61V-40Q0-33 5-40V-61"
              fill="#c88d85"
              strokeWidth="1.5"
            />
          )}
          {official && (
            <>
              <path
                d="M-14-64Q-9-56 0-61Q9-56 14-64M-10-56L0-30L12-56"
                fill="#4b433d"
              />
              <path d="M0-52V-35" stroke="#89725a" strokeWidth="1" />
            </>
          )}
          {old && (
            <>
              <g stroke="#756b5f" fill="none" strokeWidth="1.4">
                <circle cx="-11" cy="-80" r="10" />
                <circle cx="11" cy="-80" r="10" />
                <path d="M-1-81H1" />
              </g>
              <path
                d="M-18-69L-12-68M12-68L18-69"
                stroke="#a88f79"
                strokeWidth="1"
              />
            </>
          )}
          {pose === "surprised" && (
            <path
              d="M31-93Q42-108 43-94Q42-82 33-85Z"
              fill="#8acbd9"
              strokeWidth="1"
            />
          )}
        </g>
        {royal && (
          <>
            <rect
              x="-11"
              y="-49"
              width="22"
              height="18"
              rx="4"
              fill="#d3af67"
            />
            <text
              x="0"
              y="-35"
              textAnchor="middle"
              fontSize="12"
              fill="#57432f"
              stroke="none"
            >
              {c.court}
            </text>
          </>
        )}
        {holy && (
          <circle cx="-29" cy="-31" r="9" fill="#f0d991" stroke="#ddc774" />
        )}
      </g>
    </g>
  );
}
