/**
 * Flat product illustrations, drawn as inline SVG until real photos are added
 * (`product.photos`). Colours are fixed artwork colours, not theme tokens.
 */
import type { ReactNode } from "react";

const C = {
  red: "#b8322a",
  redDark: "#8e241e",
  gold: "#e0a526",
  goldDark: "#b9861a",
  blue: "#3d7cc9",
  blueLight: "#79a9e2",
  navy: "#2f4aa0",
  green: "#5a7d3a",
  cream: "#efe2bf",
  creamDark: "#d9c79c",
  berry: "#d98f8f",
  dough: "#d9a35b",
  doughDark: "#c08241",
  doughLight: "#ebc283",
  choc: "#5c3a22",
  chocDark: "#3a2418",
  chocLight: "#8a5a3a",
  porcelain: "#f8f6f0",
  porcelainEdge: "#ddd9ce",
  silver: "#c3c7cd",
  felt: "#9b958a",
  feltDark: "#6e695f",
  wool: "#d9cdb8",
  woolDark: "#c2b49b",
  grey: "#9a9aa0",
  tea: "#5d4a2a",
  teaLight: "#7a6236",
  teaDark: "#4a3a20",
  paper: "#fbfaf6",
  paperEdge: "#d8d4c6",
  wood: "#8a6440",
  woodDark: "#6b4a2c",
};

/** A porcelain bowl whose rim sits at `y`. */
function Bowl({ cx, y, r, band = C.navy }: { cx: number; y: number; r: number; band?: string }) {
  const h = r * 0.9;
  return (
    <g>
      <rect x={cx - r * 0.35} y={y + h - 3} width={r * 0.7} height={5} rx={1.5} fill={C.silver} />
      <path d={`M${cx - r} ${y} h${2 * r} a${r} ${h} 0 0 1 ${-2 * r} 0z`} fill={C.porcelain} stroke={C.porcelainEdge} />
      {Array.from({ length: 5 }, (_, i) => (
        <circle key={i} cx={cx - r * 0.6 + i * r * 0.3} cy={y + h * 0.38} r={r * 0.07} fill={band} />
      ))}
      <path d={`M${cx - r * 0.82} ${y + h * 0.55} q${r * 0.41} ${r * 0.18} ${r * 0.82} 0 t${r * 0.82} 0`} stroke={band} strokeWidth={1.4} fill="none" />
      <rect x={cx - r - 1} y={y - 2.5} width={2 * r + 2} height={4} rx={2} fill={C.silver} />
    </g>
  );
}

/** One ul boov layer: an oblong biscuit with stamped dots. */
function Layer({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={12} rx={6} fill={C.dough} />
      <rect x={x + 4} y={y + 1} width={w - 8} height={2.5} rx={1.25} fill={C.doughLight} />
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={x + w * 0.15 + i * w * 0.14} cy={y + 7.5} r={1.4} fill={C.doughDark} />
      ))}
    </g>
  );
}

function Sock({ x, color, cuff }: { x: number; color: string; cuff: string }) {
  return (
    <g>
      <path d={`M${x} 8h18v62c0 6 4 10 10 12l14 5c6 2 8 8 6 13s-8 8-14 6l-26-8c-6-2-8-6-8-12z`} fill={color} />
      <rect x={x} y={8} width={18} height={12} fill={cuff} />
      {[4, 9, 14].map((d) => (
        <rect key={d} x={x + d} y={8} width={1} height={12} fill="#000" opacity={0.12} />
      ))}
    </g>
  );
}

const ART: Record<string, { vb: string; body: ReactNode }> = {
  p1: {
    vb: "0 0 160 100",
    body: (
      <g>
        <rect x="4" y="8" width="152" height="84" rx="6" fill={C.red} />
        <rect x="4" y="8" width="152" height="5" rx="2.5" fill={C.gold} />
        <rect x="9" y="15" width="142" height="72" rx="3" fill="#f4ecd8" />
        {[0, 1, 2].map((row) =>
          Array.from({ length: 6 }, (_, i) => (
            <rect key={`${row}-${i}`} x={17 + i * 22.5} y={21 + row * 21.5} width="17" height="14" rx="3.5" fill={[C.cream, "#f3d9a0", C.berry][row]} stroke={C.creamDark} strokeWidth="0.6" />
          )),
        )}
      </g>
    ),
  },
  p2: {
    vb: "0 0 160 120",
    body: (
      <g>
        <ellipse cx="80" cy="108" rx="74" ry="8" fill="#e9e4d8" />
        <ellipse cx="80" cy="106" rx="66" ry="5" fill="#f5f2ea" />
        {[88, 76, 64, 52, 40].map((y) => (
          <Layer key={y} x={22} y={y} w={116} />
        ))}
        {[32, 50, 92, 110].map((x) => (
          <rect key={x} x={x} y="28" width="13" height="12" rx="2.5" fill={C.cream} stroke={C.creamDark} strokeWidth="0.6" />
        ))}
        {[
          [70, 33, C.red],
          [80, 29, C.gold],
          [90, 33, C.green],
          [80, 36, C.blue],
        ].map(([cx, cy, fill]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill={fill as string} />
        ))}
      </g>
    ),
  },
  p3: {
    vb: "0 0 160 110",
    body: (
      <g>
        <rect x="4" y="4" width="152" height="102" rx="4" fill={C.gold} />
        <rect x="10" y="10" width="140" height="90" rx="2" fill={C.chocDark} />
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3].map((col) => {
            const cx = 27.5 + col * 35;
            const cy = 21.5 + row * 22.5;
            const fill = [C.choc, C.chocLight, "#4a2a1a"][(row + col) % 3];
            return (
              <g key={`${row}-${col}`}>
                <rect x={cx - 10.5} y={cy - 10} width="21" height="20" rx="3" fill="#2a1a10" />
                <circle cx={cx} cy={cy} r="8.5" fill={fill} />
                {(row + col) % 2 === 0 && <path d={`M${cx - 5} ${cy - 1} q2.5 -3 5 0 t5 0`} stroke={C.doughLight} strokeWidth="1.2" fill="none" />}
              </g>
            );
          }),
        )}
      </g>
    ),
  },
  p4: {
    vb: "0 0 120 140",
    body: (
      <g>
        <path d="M22 16h76l7 108a6 6 0 0 1-6 6H21a6 6 0 0 1-6-6z" fill="#f1e6cf" />
        <rect x="22" y="8" width="76" height="12" rx="2" fill={C.creamDark} />
        <rect x="22" y="22" width="76" height="2" fill="#e2d4b4" />
        <rect x="24" y="52" width="72" height="50" rx="4" fill={C.navy} />
        <path d="M44 66h32v6a16 16 0 0 1-32 0z" fill="#fff" />
        <path d="M76 69h4a4 4 0 0 1 0 8h-5" stroke="#fff" strokeWidth="2" fill="none" />
        <rect x="40" y="92" width="40" height="3" rx="1.5" fill="#fff" opacity="0.8" />
      </g>
    ),
  },
  p5: {
    vb: "0 0 160 100",
    body: (
      <g>
        <rect x="2" y="74" width="156" height="18" rx="4" fill={C.wood} />
        <rect x="2" y="74" width="156" height="4" rx="2" fill={C.woodDark} />
        <path d="M30 46c-10-2-18 4-22 10" stroke={C.porcelainEdge} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M86 44c10 0 12 18 0 22" stroke={C.porcelainEdge} strokeWidth="4" fill="none" />
        <ellipse cx="58" cy="54" rx="30" ry="22" fill={C.porcelain} stroke={C.porcelainEdge} />
        <path d="M30 54h56" stroke={C.navy} strokeWidth="3" />
        <path d="M34 62q6 4 12 0t12 0 12 0 12 0" stroke={C.navy} strokeWidth="1.4" fill="none" />
        <ellipse cx="58" cy="33" rx="16" ry="4" fill={C.silver} />
        <circle cx="58" cy="28" r="4" fill={C.silver} />
        <Bowl cx={114} y={58} r={14} />
        <Bowl cx={144} y={58} r={12} />
      </g>
    ),
  },
  p6: {
    vb: "0 0 170 70",
    body: (
      <g>
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i}>
            <rect x="2" y={17 + i * 3.8} width="7" height="1.4" fill={C.blue} />
            <rect x="161" y={17 + i * 3.8} width="7" height="1.4" fill={C.blue} />
          </g>
        ))}
        <rect x="8" y="14" width="154" height="42" rx="1" fill={C.blue} />
        <path d="M60 14h22l-12 42H48z" fill="#000" opacity="0.1" />
        <rect x="8" y="19" width="154" height="1.4" fill={C.blueLight} />
        <rect x="8" y="50" width="154" height="1.4" fill={C.blueLight} />
        {[96, 116, 136].map((x) => (
          <g key={x} transform={`rotate(45 ${x} 35)`}>
            <rect x={x - 6} y="29" width="12" height="12" fill="none" stroke={C.blueLight} strokeWidth="1.6" />
            <rect x={x - 2} y="33" width="4" height="4" fill={C.blueLight} />
          </g>
        ))}
        {[22, 34].map((x) => (
          <circle key={x} cx={x} cy="35" r="4" fill="none" stroke={C.blueLight} strokeWidth="1.4" />
        ))}
      </g>
    ),
  },
  p7: {
    vb: "0 0 120 100",
    body: (
      <g>
        <ellipse cx="60" cy="88" rx="50" ry="8" fill="#e6e3dc" />
        <ellipse cx="60" cy="86" rx="40" ry="5" fill="#f0eee8" />
        <Bowl cx={60} y={34} r={46} />
      </g>
    ),
  },
  p8: {
    vb: "0 0 140 100",
    body: (
      <g>
        {[
          [42, -6],
          [98, 6],
        ].map(([cx, rot]) => (
          <g key={cx} transform={`rotate(${rot} ${cx} 50)`}>
            <ellipse cx={cx} cy="50" rx="24" ry="44" fill={C.felt} />
            <ellipse cx={cx} cy="64" rx="15" ry="24" fill={C.feltDark} />
            <path d={`M${cx - 18} 30q18-10 36 0`} stroke={C.red} strokeWidth="3" fill="none" />
            {[-8, 0, 8].map((d) => (
              <rect key={d} x={cx + d - 3} y="15" width="6" height="6" transform={`rotate(45 ${cx + d} 18)`} fill={C.red} />
            ))}
          </g>
        ))}
      </g>
    ),
  },
  p9: {
    vb: "0 0 150 120",
    body: (
      <g>
        {Array.from({ length: 22 }, (_, i) => (
          <rect key={i} x={16 + i * 5.6} y="100" width="1.6" height="14" rx="0.8" fill={C.woolDark} />
        ))}
        <rect x="14" y="74" width="122" height="28" rx="3" fill={C.wool} />
        <rect x="14" y="44" width="122" height="32" rx="3" fill={C.woolDark} />
        <rect x="14" y="14" width="122" height="32" rx="3" fill={C.wool} />
        {[22, 54, 84].map((y) => (
          <rect key={y} x="14" y={y} width="122" height="1" fill="#000" opacity="0.06" />
        ))}
        <rect x="14" y="14" width="122" height="4" rx="2" fill="#fff" opacity="0.35" />
      </g>
    ),
  },
  p10: {
    vb: "0 0 140 120",
    body: (
      <g>
        <Sock x={6} color="#e4d9c4" cuff={C.woolDark} />
        <Sock x={46} color={C.grey} cuff="#7d7d84" />
        <Sock x={86} color={C.red} cuff={C.redDark} />
      </g>
    ),
  },
  p11: {
    vb: "0 0 150 100",
    body: (
      <g>
        <path d="M10 30l18-16h118l-18 16z" fill={C.teaLight} />
        <path d="M128 30l18-16v58l-18 16z" fill={C.teaDark} />
        <rect x="10" y="30" width="118" height="58" fill={C.tea} />
        <rect x="58" y="36" width="64" height="46" fill="none" stroke={C.teaLight} strokeWidth="2" />
        <circle cx="90" cy="59" r="12" fill="none" stroke={C.teaLight} strokeWidth="2" />
        <circle cx="90" cy="59" r="4" fill={C.teaLight} />
        <rect x="10" y="30" width="42" height="58" fill="#efe6d2" />
        <rect x="18" y="40" width="18" height="18" fill={C.red} />
        <rect x="18" y="66" width="26" height="3" rx="1.5" fill={C.creamDark} />
        <rect x="18" y="73" width="18" height="3" rx="1.5" fill={C.creamDark} />
      </g>
    ),
  },
  p12: {
    vb: "0 0 180 120",
    body: (
      <g>
        <rect x="10" y="38" width="160" height="20" fill={C.redDark} />
        <rect x="18" y="22" width="22" height="36" rx="11" fill={C.blue} />
        <path d="M18 34h22" stroke={C.blueLight} strokeWidth="1.4" />
        {[46, 38, 30].map((y) => (
          <rect key={y} x="48" y={y} width="50" height="9" rx="4.5" fill={C.dough} stroke={C.doughDark} strokeWidth="0.6" />
        ))}
        <rect x="64" y="22" width="9" height="8" rx="2" fill={C.cream} />
        <circle cx="80" cy="26" r="4" fill={C.red} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={104 + i * 11} y={34 - (i % 2) * 4} width="10" height="9" rx="2.5" fill={C.cream} stroke={C.creamDark} strokeWidth="0.6" />
        ))}
        <rect x="140" y="26" width="26" height="32" fill={C.tea} />
        <rect x="140" y="26" width="26" height="8" fill="#efe6d2" />
        <rect x="6" y="54" width="168" height="62" rx="4" fill={C.red} />
        <rect x="6" y="78" width="168" height="8" fill={C.gold} />
        <rect x="86" y="54" width="8" height="62" fill={C.gold} />
        <rect x="83" y="75" width="14" height="14" transform="rotate(45 90 82)" fill={C.gold} stroke={C.redDark} strokeWidth="1.5" />
      </g>
    ),
  },
};

/** Close-up crop (viewBox) per product; falls back to a centered 60% crop. */
const DETAIL: Record<string, string> = {
  p1: "9 15 80 50",
  p2: "20 18 90 60",
  p3: "10 10 72 50",
  p6: "86 12 76 48",
  p7: "10 26 100 66",
  p12: "10 16 100 66",
};

/** Wrapping paper colour per product. */
const WRAP: Record<string, string> = {
  p3: C.navy,
  p7: C.navy,
  p8: C.green,
  p9: C.navy,
  p10: C.green,
};

/** The gift-wrapped look every order ships in. */
function GiftWrap({ id }: { id: string }) {
  const wrap = WRAP[id] ?? C.red;
  return (
    <g>
      <rect x="0" y="0" width="160" height="120" rx="2" fill={C.paper} />
      <rect x="0.5" y="0.5" width="159" height="119" rx="2" fill="none" stroke={C.paperEdge} />
      <ellipse cx="80" cy="104" rx="50" ry="4" fill="#000" opacity="0.08" />
      <rect x="40" y="46" width="80" height="58" rx="3" fill={wrap} />
      <rect x="36" y="36" width="88" height="16" rx="2" fill={wrap} />
      <rect x="36" y="48" width="88" height="4" fill="#000" opacity="0.15" />
      <rect x="76" y="36" width="8" height="68" fill={C.gold} />
      <rect x="40" y="70" width="80" height="7" fill={C.gold} />
      <ellipse cx="70" cy="30" rx="11" ry="6" transform="rotate(-25 70 30)" fill={C.gold} />
      <ellipse cx="90" cy="30" rx="11" ry="6" transform="rotate(25 90 30)" fill={C.gold} />
      <circle cx="80" cy="34" r="4.5" fill={C.goldDark} />
      <path d="M120 76l14 10" stroke={C.goldDark} strokeWidth="1" />
      <rect x="128" y="84" width="16" height="11" rx="1.5" transform="rotate(35 136 89)" fill="#fff" stroke={C.paperEdge} />
    </g>
  );
}

export type ArtView = "main" | "detail" | "swatch";

export function ProductArt({ id, view = "main", className }: { id: string; view?: ArtView; className?: string }) {
  const art = ART[id];
  if (!art) return null;
  let vb = art.vb;
  if (view === "detail") {
    const [, , w, h] = art.vb.split(" ").map(Number);
    vb = DETAIL[id] ?? `${w * 0.2} ${h * 0.2} ${w * 0.6} ${h * 0.6}`;
  }
  if (view === "swatch") vb = "0 0 160 120";
  return (
    <svg className={className} viewBox={vb} role="presentation" aria-hidden="true" focusable="false">
      {view === "swatch" ? <GiftWrap id={id} /> : art.body}
    </svg>
  );
}
