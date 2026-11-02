import React, { useId } from "react";
import { punishments } from "../../shared/mythology";
import { CharacterSprite } from "./CharacterSprite";

function Wisp({
  x = 0,
  y = 0,
  scale = 1,
  split = false,
}: {
  x?: number;
  y?: number;
  scale?: number;
  split?: boolean;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      className={split ? "split-wisp" : "stage-wisp"}
    >
      <path
        d="M-16 12L-18-10Q-18-33 0-34Q19-33 18-10L16 12L7 7L0 16L-8 7Z"
        fill="#b6ddd1"
        stroke="#527f78"
        strokeWidth="2"
      />
      <ellipse cx="-6" cy="-13" rx="3" ry="5" fill="#294e53" />
      <ellipse cx="6" cy="-13" rx="3" ry="5" fill="#294e53" />
      <ellipse cy="-1" rx="3" ry="4" fill="#567477" />
    </g>
  );
}
function FragmentedWisp({
  x,
  y,
  vertical = false,
}: {
  x: number;
  y: number;
  vertical?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const parts = vertical
    ? [
        [-22, -40, 22, 65],
        [0, -40, 22, 65],
      ]
    : [
        [-22, -40, 44, 25],
        [-22, -15, 44, 17],
        [-22, 2, 44, 22],
      ];
  return (
    <g transform={`translate(${x} ${y}) scale(1.8)`} opacity=".85">
      <defs>
        {parts.map(([rx, ry, width, height], i) => (
          <clipPath id={`${id}-${i}`} key={i}>
            <rect x={rx} y={ry} width={width} height={height} />
          </clipPath>
        ))}
      </defs>
      {parts.map((_, i) => (
        <g
          key={i}
          className={`soul-fragment ${vertical ? "split-vertical" : "split-horizontal"} fragment-${i}`}
        >
          <g clipPath={`url(#${id}-${i})`}>
            <Wisp />
          </g>
        </g>
      ))}
    </g>
  );
}
const flame = (
  <path
    d="M-14 11Q-27-3-11-25Q-10-10 0-39Q28-8 15 10Q0 23-14 11Z"
    fill="#de8050"
    stroke="#8b4d3d"
    strokeWidth="2"
  />
);
const smoke = (
  <g
    fill="none"
    stroke="#cdd8c7"
    opacity=".45"
    strokeWidth="5"
    strokeLinecap="round"
    className="stage-steam"
  >
    <path d="M-24 10Q-44-13-23-34Q-5-53-22-69M4 5Q-13-15 7-38Q22-55 5-77M30 14Q11-8 30-30Q47-49 29-65" />
  </g>
);
export function PunishmentStage({
  floor,
  x = 0,
  y = 0,
  scale = 1,
  animate = true,
  withGuard = true,
}: {
  floor: number;
  x?: number;
  y?: number;
  scale?: number;
  animate?: boolean;
  withGuard?: boolean;
}) {
  const p = punishments[floor - 1];
  const metal = "#728681",
    edge = "#334c4c",
    gold = "#c1a16a",
    wood = "#785d49";
  let art: React.ReactNode;
  switch (floor) {
    case 1:
      art = (
        <>
          <path
            d="M126 203V111H176V205M116 166H187M119 204H185"
            fill="none"
            stroke={wood}
            strokeWidth="12"
          />
          <Wisp x={153} y={151} scale={1.15} />
          <g className="tongue-stretch">
            <path
              d="M154 141Q201 162 247 137"
              fill="none"
              stroke="#ca8e8d"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M243 133L265 119M243 143L267 157M242 132L246 144"
              stroke={metal}
              strokeWidth="5"
              fill="none"
            />
            <circle cx="252" cy="139" r="4" fill={gold} />
          </g>
        </>
      );
      break;
    case 2:
      art = (
        <>
          <path
            d="M91 174L184 133L272 175L181 218Z"
            fill={wood}
            stroke={edge}
            strokeWidth="3"
          />
          <path d="M111 182V222M246 185V222" stroke={wood} strokeWidth="10" />
          <path
            d="M133 169L132 131Q134 123 139 131L146 149L146 121Q150 113 154 122L158 148L160 119Q166 114 168 124L168 149L176 130Q181 126 182 136L176 169Z"
            fill="#b9d9cc"
            stroke="#679289"
            strokeWidth="2"
          />
          <g
            className="stage-scissors"
            stroke={metal}
            strokeWidth="7"
            fill="none"
          >
            <path d="M212 186L158 108M224 185L262 102" />
            <ellipse cx="205" cy="193" rx="15" ry="20" />
            <ellipse cx="229" cy="193" rx="15" ry="20" />
            <circle cx="213" cy="160" r="3" fill={gold} />
          </g>
          <Wisp x={98} y={151} scale={0.65} />
        </>
      );
      break;
    case 3:
      art = (
        <>
          <path
            d="M161 218L179 71L194 218"
            fill="#596e64"
            stroke={edge}
            strokeWidth="3"
          />
          <g stroke="#8faba0" strokeWidth="8" fill="none">
            <path d="M178 154L119 113L103 75M181 120L231 85L249 52M175 181L111 158M187 175L248 132L259 100" />
          </g>
          <g fill="#b4c2b8" stroke={edge}>
            <path d="M109 91L89 80L101 107ZM136 123L131 102L150 132ZM223 94L224 70L240 82ZM229 145L223 123L246 130Z" />
          </g>
          <path d="M226 91V130" stroke={gold} strokeWidth="2" />
          <g className="hanging-wisp">
            <Wisp x={226} y={157} />
          </g>
        </>
      );
      break;
    case 4:
      art = (
        <>
          <path
            d="M116 214L181 181L247 213L180 241Z"
            fill="#6e7560"
            stroke={edge}
            strokeWidth="3"
          />
          <path d="M180 185V120M153 189H209" stroke={gold} strokeWidth="9" />
          <ellipse
            cx="180"
            cy="105"
            rx="64"
            ry="76"
            fill="#a18c57"
            stroke="#d3b87b"
            strokeWidth="5"
          />
          <ellipse
            cx="180"
            cy="105"
            rx="53"
            ry="65"
            fill="#548b96"
            stroke={edge}
            strokeWidth="2"
          />
          <path
            d="M145 110L195 57M154 134L212 76"
            stroke="#c7e4dd"
            opacity=".25"
            strokeWidth="7"
          />
          <g className="mirror-memory">
            <Wisp x={180} y={129} scale={1.3} />
          </g>
          <path
            d="M147 47L149 40M180 36V27M213 47L218 40"
            stroke={gold}
            strokeWidth="3"
          />
        </>
      );
      break;
    case 5:
      art = (
        <>
          <g transform="translate(180 212) scale(1.2 .55)">{flame}</g>
          <path
            d="M114 209L126 112H235L247 209Q180 237 114 209Z"
            fill="#ac9562"
            stroke={edge}
            strokeWidth="4"
          />
          {[134, 159, 183, 207].map((v) => (
            <path
              key={v}
              d={`M120 ${v}Q180 ${v + 21} 241 ${v}`}
              stroke="#655a41"
              strokeWidth="4"
              fill="none"
            />
          ))}
          {[135, 156, 180, 204, 226].map((v) => (
            <path
              key={v}
              d={`M${v} 120V210`}
              stroke="#dac38a"
              strokeWidth="2"
            />
          ))}
          <Wisp x={179} y={129} scale={0.7} />
          <g className="bouncing-lid">
            <ellipse
              cx="180"
              cy="108"
              rx="58"
              ry="19"
              fill="#c2aa73"
              stroke={edge}
              strokeWidth="3"
            />
            <path
              d="M118 106L180 74L243 106"
              fill="#bba06b"
              stroke={edge}
              strokeWidth="3"
            />
            <path
              d="M171 79Q180 61 189 79"
              fill="none"
              stroke={gold}
              strokeWidth="4"
            />
          </g>
          <g transform="translate(178 66) scale(.6)">{smoke}</g>
        </>
      );
      break;
    case 6:
      art = (
        <>
          <ellipse
            cx="180"
            cy="215"
            rx="66"
            ry="20"
            fill="#4c3c33"
            stroke={edge}
            strokeWidth="3"
          />
          {[135, 165, 195, 225].map((v, i) => (
            <g key={v} transform={`translate(${v} 214) scale(.5)`}>
              {flame}
            </g>
          ))}
          <path
            d="M154 194V64H207V194Q181 213 154 194Z"
            fill="#be7855"
            stroke="#e2aa64"
            strokeWidth="3"
          />
          <ellipse cx="180" cy="64" rx="27" ry="10" fill="#e9b277" />
          <path
            d="M167 77V182M193 79V181"
            stroke="#f2b36c"
            strokeWidth="4"
            opacity=".55"
          />
          <g className="heat-wisp">
            <Wisp x={205} y={143} />
            <path
              d="M189 129Q167 142 159 120"
              fill="none"
              stroke="#b6ddd1"
              strokeWidth="9"
            />
          </g>
          <g transform="translate(179 48) scale(.5)">{smoke}</g>
        </>
      );
      break;
    case 7:
      art = (
        <>
          <path
            d="M64 219L128 67L165 132L206 37L291 218Z"
            fill="#50666a"
            stroke={edge}
            strokeWidth="3"
          />
          {[
            [103, 171],
            [127, 128],
            [161, 185],
            [199, 104],
            [220, 158],
            [244, 191],
          ].map(([v, w]) => (
            <g key={v} transform={`translate(${v} ${w}) rotate(-15)`}>
              <path
                d="M-5 20V-37L0-49L5-37V20Z"
                fill="#bac4b9"
                stroke={edge}
                strokeWidth="2"
              />
              <path d="M-13 12H13" stroke={gold} strokeWidth="4" />
            </g>
          ))}
          <g className="climbing-wisp">
            <Wisp x={177} y={155} />
          </g>
        </>
      );
      break;
    case 8:
      art = (
        <>
          <path
            d="M62 217L115 99L144 169L183 43L219 135L251 82L295 217Z"
            fill="#7eafb9"
            stroke="#b1d8d4"
            strokeWidth="2"
          />
          <path
            d="M183 43L165 200L219 135M115 99L103 212L144 169M251 82L243 207L284 190"
            fill="#c3e5df"
            opacity=".5"
          />
          <g className="shivering-wisp">
            <Wisp x={192} y={203} scale={1.2} />
          </g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <text
              key={i}
              x={86 + i * 37}
              y={50 + (i % 3) * 30}
              fill="#daeee5"
              fontSize="24"
              className="snowflake"
            >
              ✦
            </text>
          ))}
        </>
      );
      break;
    case 9:
      art = (
        <>
          <g transform="translate(180 225) scale(1.6 .9)">{flame}</g>
          <path
            d="M95 123Q100 219 180 221Q261 220 267 123Z"
            fill="#4e6264"
            stroke={edge}
            strokeWidth="5"
          />
          <path
            d="M112 186L99 226M247 188L259 226"
            stroke="#7e8c81"
            strokeWidth="11"
          />
          <path
            d="M99 146Q54 124 76 172L109 180M261 146Q304 124 285 172L253 181"
            fill="none"
            stroke="#a5ac92"
            strokeWidth="7"
          />
          <ellipse
            cx="180"
            cy="123"
            rx="86"
            ry="25"
            fill="#c8a153"
            stroke="#95a18a"
            strokeWidth="6"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              className="oil-bubble"
              cx={123 + i * 29}
              cy={123 - (i % 2) * 9}
              r={5 + (i % 3)}
              fill="#e9cd83"
              stroke="#a58143"
              strokeWidth="1"
            />
          ))}
          <g className="bobbing-wisp">
            <Wisp x={184} y={117} />
            <ellipse
              cx="184"
              cy="80"
              rx="29"
              ry="8"
              fill="#81918b"
              stroke={edge}
              strokeWidth="2"
            />
            <path
              d="M177 75Q184 63 191 75"
              stroke={gold}
              fill="none"
              strokeWidth="3"
            />
          </g>
          <g transform="translate(179 75) scale(.55)">{smoke}</g>
        </>
      );
      break;
    case 10:
      art = (
        <>
          <ellipse
            cx="180"
            cy="183"
            rx="128"
            ry="51"
            fill="#172a2c"
            stroke="#75634e"
            strokeWidth="10"
          />
          <path
            d="M60 184V221Q180 277 301 220V184"
            fill="#4d4538"
            stroke={edge}
            strokeWidth="3"
          />
          <g className="charging-ox" transform="translate(105 165)">
            <ellipse
              cy="-10"
              rx="43"
              ry="24"
              fill="#8c7962"
              stroke={edge}
              strokeWidth="3"
            />
            <path d="M-28 0V30M22 0V30" stroke="#5f5d4f" strokeWidth="12" />
            <path
              d="M30-15Q44-52 60-18L61 6L37 10Z"
              fill="#a09073"
              stroke={edge}
              strokeWidth="3"
            />
            <path
              d="M39-31Q29-54 30-62M56-31Q74-49 72-58"
              fill="none"
              stroke="#d2ba88"
              strokeWidth="6"
            />
            <circle cx="46" cy="-13" r="3" fill="#243b3b" />
          </g>
          <g className="spinning-wisp">
            <Wisp x={236} y={174} />
          </g>
        </>
      );
      break;
    case 11:
      art = (
        <>
          <path
            d="M89 214V50H269V214"
            fill="none"
            stroke={wood}
            strokeWidth="14"
          />
          <path
            d="M88 62H268M100 80L128 50M228 50L259 80"
            stroke="#b29968"
            strokeWidth="5"
          />
          <g className="falling-rock">
            <path d="M135 61V106M225 61V106" stroke={gold} strokeWidth="3" />
            <path
              d="M114 138L136 95L213 88L251 132L230 174L140 180Z"
              fill="#899185"
              stroke={edge}
              strokeWidth="4"
            />
            <path
              d="M136 95L169 130L213 88M169 130L151 174"
              fill="none"
              stroke="#b6bba1"
              strokeWidth="3"
            />
          </g>
          <g className="squashed-wisp">
            <Wisp x={180} y={208} />
          </g>
        </>
      );
      break;
    case 12:
      art = (
        <>
          <path
            d="M110 161Q110 228 180 234Q251 229 253 161Z"
            fill="#79857d"
            stroke={edge}
            strokeWidth="4"
          />
          <ellipse
            cx="182"
            cy="162"
            rx="72"
            ry="22"
            fill="#3e5551"
            stroke="#a4ac95"
            strokeWidth="5"
          />
          <Wisp x={178} y={164} scale={0.85} />
          <g className="pounding-pestle">
            <path
              d="M170 142L160 46L192 39L208 138Z"
              fill="#a1916f"
              stroke={edge}
              strokeWidth="4"
            />
            <ellipse cx="176" cy="45" rx="16" ry="7" fill="#c3b68e" />
            <path d="M174 61L183 122" stroke="#d3c59a" strokeWidth="3" />
          </g>
          {[0, 1, 2].map((i) => (
            <text
              key={i}
              className="soul-spark"
              x={125 + i * 56}
              y={131 - (i % 2) * 29}
              fill="#c5dcc7"
              fontSize="16"
            >
              ✧
            </text>
          ))}
        </>
      );
      break;
    case 13:
      art = (
        <>
          <path
            d="M54 171Q171 99 304 169V204Q180 270 54 204Z"
            fill="#5e3545"
            stroke="#995966"
            strokeWidth="4"
          />
          <ellipse
            cx="179"
            cy="170"
            rx="124"
            ry="46"
            fill="#a35164"
            stroke="#b5757c"
            strokeWidth="3"
          />
          <g stroke="#e4a5a5" fill="none" opacity=".5">
            <ellipse cx="185" cy="171" rx="52" ry="17" />
            <ellipse cx="185" cy="171" rx="82" ry="28" />
          </g>
          <g className="bobbing-wisp">
            <Wisp x={187} y={165} />
          </g>
          <path
            d="M47 165L116 131L137 142L68 178Z"
            fill={wood}
            stroke={edge}
            strokeWidth="3"
          />
          <path
            d="M54 157L119 123M65 178V196M121 143V161"
            stroke="#a99a78"
            strokeWidth="3"
          />
        </>
      );
      break;
    case 14:
      art = (
        <>
          <path
            d="M91 216V82L124 61L155 80V216M207 216V80L238 61L269 82V216"
            fill="#5c6272"
            stroke={edge}
            strokeWidth="4"
          />
          <path
            d="M88 82V60H105V75H121V60H138V75H157V91M205 91V60H222V75H238V60H255V75H272V83"
            fill="#74818b"
            stroke={edge}
            strokeWidth="3"
          />
          <path
            d="M153 211V125Q181 86 208 125V211"
            fill="#253241"
            stroke="#9fa5ab"
            strokeWidth="4"
          />
          {[164, 180, 196].map((v) => (
            <path
              key={v}
              d={`M${v} 121V211`}
              stroke="#8d9c9e"
              strokeWidth="4"
            />
          ))}
          <Wisp x={183} y={198} scale={0.8} />
          <path d="M151 113H209V135H151Z" fill="#424959" stroke={gold} />
          <text
            x="180"
            y="128"
            textAnchor="middle"
            fill="#c2c4b2"
            fontSize="12"
          >
            枉死城
          </text>
          <rect x="75" y="196" width="17" height="23" rx="4" fill="#d8bd85" />
        </>
      );
      break;
    case 15:
      art = (
        <>
          <path
            d="M103 220V62H260V220"
            fill="none"
            stroke={wood}
            strokeWidth="13"
          />
          <path
            d="M108 72L140 61M225 61L255 77"
            stroke={gold}
            strokeWidth="4"
          />
          <path
            d="M117 74L161 113M249 74L204 113M116 211L164 174M246 211L203 174"
            stroke={gold}
            strokeWidth="2"
          />
          <FragmentedWisp x={182} y={156} />
          <path
            d="M268 154L296 119L308 132L285 163Z"
            fill="#bec3b3"
            stroke={edge}
            strokeWidth="3"
          />
          <path d="M284 164L275 180" stroke={wood} strokeWidth="8" />
          <text
            x="181"
            y="242"
            textAnchor="middle"
            fill="#cfb7ca"
            fontSize="11"
          >
            BÓNG HỒN TÁCH · RỒI TỤ LẠI
          </text>
        </>
      );
      break;
    case 16:
      art = (
        <>
          <path
            d="M61 224L136 91L203 81L296 224Z"
            fill="#61504b"
            stroke={edge}
            strokeWidth="4"
          />
          <ellipse
            cx="169"
            cy="91"
            rx="35"
            ry="13"
            fill="#e99c58"
            stroke="#a0674b"
            strokeWidth="4"
          />
          <path
            d="M155 100L164 130L144 153L170 186L152 221M194 112L204 142L190 166L219 192L211 225"
            stroke="#efaa60"
            fill="none"
            strokeWidth="11"
          />
          {[105, 170, 251].map((v, i) => (
            <g
              className="stage-flame"
              key={v}
              transform={`translate(${v} ${200 - (i % 2) * 84}) scale(.8)`}
            >
              {flame}
            </g>
          ))}
          <g className="heat-wisp">
            <Wisp x={246} y={202} />
          </g>
        </>
      );
      break;
    case 17:
      art = (
        <>
          <path
            d="M96 145V189Q179 241 269 189V145Z"
            fill="#73817b"
            stroke={edge}
            strokeWidth="4"
          />
          <ellipse
            cx="182"
            cy="145"
            rx="86"
            ry="34"
            fill="#abb39b"
            stroke={edge}
            strokeWidth="4"
          />
          <g className="mill-rotation">
            <ellipse
              cx="182"
              cy="141"
              rx="79"
              ry="28"
              fill="none"
              stroke="#748677"
              strokeWidth="3"
            />
            <path
              d="M109 133L253 148M151 116L215 167"
              stroke="#667e71"
              strokeWidth="4"
            />
          </g>
          <path
            d="M182 140V69H252"
            fill="none"
            stroke={wood}
            strokeWidth="10"
          />
          <ellipse cx="182" cy="139" rx="12" ry="6" fill="#586e61" />
          <path d="M251 64V100" stroke={gold} strokeWidth="7" />
          <Wisp x={138} y={132} scale={0.65} />
          <path
            d="M230 201L249 217H287V232H244L214 211"
            fill="#a7a88b"
            stroke={edge}
            strokeWidth="3"
          />
          {[0, 1, 2].map((i) => (
            <text
              className="soul-spark"
              key={i}
              x={248 + i * 15}
              y={213 - (i % 2) * 13}
              fill="#c4dfc9"
              fontSize="18"
            >
              ✧
            </text>
          ))}
        </>
      );
      break;
    default:
      art = (
        <>
          <path
            d="M105 222V56M255 222V56M100 64H260M102 210H259"
            stroke={wood}
            strokeWidth="12"
          />
          <path
            d="M112 71L163 103M248 71L203 103M112 202L164 169M248 202L202 169"
            stroke={gold}
            strokeWidth="3"
          />
          <g className="saw-soul">
            <FragmentedWisp x={182} y={156} vertical />
          </g>
          <g transform="rotate(90 180 145)">
            <g className="saw-motion">
              <path
                d="M91 140L260 131L261 147L252 150L247 144L240 151L234 145L226 153L220 146L212 154L205 147L197 156L190 149L182 157L175 150L167 158L160 152L152 160L145 153L136 162L129 155L121 163L114 156L105 164L96 159Z"
                fill="#b4beb0"
                stroke={edge}
                strokeWidth="2"
              />
              <path d="M90 127V170M265 121V166" stroke={wood} strokeWidth="8" />
            </g>
          </g>
          <g transform="translate(182 175) scale(.65)">{smoke}</g>
        </>
      );
  }
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      className={`punishment-stage floor-stage-${floor} ${animate ? "animated" : ""}`}
      data-punishment={floor}
    >
      <title>{`${p.title} · ${p.description}`}</title>
      <ellipse cx="180" cy="225" rx="149" ry="30" fill="#0a171b" opacity=".5" />
      <path
        d="M28 221L179 149L333 221L182 281Z"
        fill={p.palette[0]}
        stroke={p.palette[1]}
        strokeOpacity=".4"
        strokeWidth="2"
      />
      {art}
      {withGuard && (
        <CharacterSprite
          id={p.guardian}
          x={300}
          y={236}
          scale={0.65}
          pose="work"
          animate={animate}
        />
      )}
    </g>
  );
}
