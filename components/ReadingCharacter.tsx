"use client";

import { Press_Start_2P } from "next/font/google";
import { getCharacterProgress } from "@/lib/character";

const pixelFont = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
});

type Props = {
  count: number;
};

const BAR_SEGMENTS = 16;

export default function ReadingCharacter({ count }: Props) {
  const { level, title, progress, remaining, isMaxLevel } =
    getCharacterProgress(count);
  const filledSegments = Math.round(progress * BAR_SEGMENTS);

  return (
    <div className="mb-8 flex flex-col items-center gap-3 rounded-2xl border border-white/60 bg-white/50 px-6 py-7 text-center shadow-sm shadow-ink/5 backdrop-blur-sm">
      <div className="rounded-md border-[3px] border-[#EDEFF5] bg-gradient-to-b from-[#26346E] to-[#0C1330] p-3 shadow-[inset_0_0_0_2px_#0A0E22]">
        <CharacterAvatar level={level} />
      </div>

      <div>
        <p
          className={`${pixelFont.className} text-[11px] tracking-tight text-accent`}
        >
          Lv.{level}
          <span className="text-ink/30"> / 99</span>
        </p>
        <p className="mt-1 font-serif text-lg font-medium text-ink">
          {title}
        </p>
      </div>

      <div className="w-full max-w-[220px]">
        <div className="flex gap-[2px] rounded-sm border border-ink/15 bg-ink/[0.06] p-[3px]">
          {Array.from({ length: BAR_SEGMENTS }).map((_, i) => (
            <span
              key={i}
              className={`h-2.5 flex-1 transition-colors duration-300 ${
                i < filledSegments ? "bg-accent" : "bg-ink/10"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-ink/40">
          {isMaxLevel
            ? "最高レベルに到達しました"
            : `次のレベルまであと${remaining.toLocaleString()}冊`}
        </p>
      </div>
    </div>
  );
}

const PX = 4;
const GRID_W = 28;
const GRID_H = 34;
const MAX_LEVEL = 99;

const OUTLINE = "#241F1A";

const BASE = {
  hair: "#4A3223",
  skin: "#FBD1A8",
  eye: "#241F1A",
  pants: "#3B342C",
  boot: "#241F1A",
  bookCover: "#9C5A28",
  bookPage: "#F6E9C8",
  steel: "#D8DEE2",
} as const;

// レベル1〜99で滑らかに色が移り変わるグラデーションの基準点。
// レトロRPGらしく、彩度・明度の高い原色寄りの配色にしている。
type ColorStop = [level: number, hex: string];

const TUNIC_STOPS: ColorStop[] = [
  [1, "#3FA65C"],
  [20, "#2E9AAE"],
  [40, "#D6423F"],
  [60, "#3457B2"],
  [80, "#8B3FC9"],
  [99, "#F0B429"],
];

const CAPE_STOPS: ColorStop[] = [
  [60, "#1F2B57"],
  [80, "#3B1F63"],
  [99, "#201A16"],
];

const ACCENT_STOPS: ColorStop[] = [
  [1, "#E8DA3F"],
  [20, "#F0812E"],
  [40, "#F0B429"],
  [60, "#D8DEE2"],
  [99, "#FCE188"],
];

// 武器（剣）専用のグラデーション。装備した瞬間から99まで、刀身の色が
// 素の鋼色→魔力を帯びた青→紫の輝き→伝説の黄金と大きく変化し続ける。
const WEAPON_STOPS: ColorStop[] = [
  [40, "#D8DEE2"],
  [55, "#7FD1E8"],
  [70, "#4FA8F0"],
  [85, "#B98CF2"],
  [99, "#FCE188"],
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount
  );
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

function lerpColor(stops: ColorStop[], level: number): string {
  if (level <= stops[0][0]) return stops[0][1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (level <= t1) {
      const ratio = t1 === t0 ? 0 : (level - t0) / (t1 - t0);
      const [r0, g0, b0] = hexToRgb(c0);
      const [r1, g1, b1] = hexToRgb(c1);
      return rgbToHex(
        r0 + (r1 - r0) * ratio,
        g0 + (g1 - g0) * ratio,
        b0 + (b1 - b0) * ratio
      );
    }
  }
  return stops[stops.length - 1][1];
}

// 装備の解禁レベル。ここを境に段階的に見た目が強化されていく。
const UNLOCK = {
  bandana: 15,
  book: 25,
  sword: 40,
  shoulderAccent: 50,
  cape: 60,
  helm: 70,
  swordGlow: 80,
  crown: 90,
  sparkle: 95,
};

type Block = { x: number; y: number; w?: number; h?: number; fill: string };

function buildSprite(level: number): Block[] {
  const tunic = lerpColor(TUNIC_STOPS, level);
  const accent = lerpColor(ACCENT_STOPS, level);
  const cape = lerpColor(CAPE_STOPS, level);
  const blocks: Block[] = [];

  if (level >= UNLOCK.cape) {
    const capeHeight =
      10 +
      Math.round(6 * Math.min(1, (level - UNLOCK.cape) / (MAX_LEVEL - UNLOCK.cape)));
    blocks.push(
      { x: 2, y: 16, w: 2, h: capeHeight, fill: cape },
      { x: 24, y: 16, w: 2, h: capeHeight, fill: cape }
    );
  }

  // 体の基本パーツ（髪・顔・胴・脚）
  blocks.push(
    { x: 8, y: 2, w: 2, h: 2, fill: BASE.hair },
    { x: 12, y: 0, w: 4, h: 2, fill: BASE.hair },
    { x: 18, y: 2, w: 2, h: 2, fill: BASE.hair },
    { x: 6, y: 4, w: 16, h: 4, fill: BASE.hair },
    { x: 8, y: 8, w: 12, h: 6, fill: BASE.skin },
    { x: 10, y: 8, w: 2, h: 2, fill: BASE.hair },
    { x: 16, y: 8, w: 2, h: 2, fill: BASE.hair },
    { x: 10, y: 10, w: 2, h: 2, fill: BASE.eye },
    { x: 16, y: 10, w: 2, h: 2, fill: BASE.eye },
    { x: 12, y: 14, w: 4, h: 2, fill: BASE.skin },
    { x: 6, y: 16, w: 2, h: 6, fill: tunic },
    { x: 20, y: 16, w: 2, h: 6, fill: tunic },
    { x: 8, y: 16, w: 12, h: 8, fill: tunic },
    { x: 6, y: 22, w: 2, h: 2, fill: BASE.skin },
    { x: 20, y: 22, w: 2, h: 2, fill: BASE.skin },
    { x: 10, y: 24, w: 2, h: 4, fill: BASE.pants },
    { x: 16, y: 24, w: 2, h: 4, fill: BASE.pants },
    { x: 8, y: 28, w: 4, h: 4, fill: BASE.boot },
    { x: 16, y: 28, w: 4, h: 4, fill: BASE.boot }
  );

  if (level >= UNLOCK.bandana) {
    blocks.push({ x: 6, y: 4, w: 16, h: 2, fill: accent });
  }

  if (level >= UNLOCK.shoulderAccent) {
    blocks.push(
      { x: 6, y: 16, w: 2, h: 2, fill: accent },
      { x: 20, y: 16, w: 2, h: 2, fill: accent }
    );
  }

  if (level >= UNLOCK.book) {
    // 表紙・背表紙・ページを分けて描き、一目で本と分かるようにする。
    blocks.push(
      { x: 20, y: 18, w: 4, h: 4, fill: BASE.bookCover },
      { x: 20, y: 18, w: 1, h: 4, fill: darken(BASE.bookCover, 0.35) },
      { x: 22, y: 18, w: 2, h: 4, fill: BASE.bookPage },
      { x: 22, y: 19, w: 2, h: 1, fill: darken(BASE.bookPage, 0.12) }
    );
  }

  if (level >= UNLOCK.sword) {
    // 刀身は装備直後(Lv.40)から最大(Lv.99)まで少しずつ伸び、
    // 色も鋼色→魔力の輝きへと連続的に変化していく。
    const bladeColor = lerpColor(WEAPON_STOPS, level);
    const bladeLength =
      10 +
      Math.round(
        8 * Math.min(1, (level - UNLOCK.sword) / (MAX_LEVEL - UNLOCK.sword))
      );
    const bladeTop = 20 - bladeLength;
    const guardWide = level >= UNLOCK.helm; // Lv.70〜で鍔が大きく広がる

    // 刀身は2マス幅にし、左半分をハイライトにして金属らしい光沢を出す。
    blocks.push({ x: 4, y: bladeTop, w: 2, h: bladeLength, fill: bladeColor });
    blocks.push({
      x: 4,
      y: bladeTop,
      w: 1,
      h: bladeLength,
      fill: lighten(bladeColor, 0.45),
    });
    // 鍔（つば）は刀身より左右に張り出させ、剣らしいシルエットにする。
    blocks.push({
      x: guardWide ? 0 : 2,
      y: 20,
      w: guardWide ? 8 : 6,
      h: 2,
      fill: bladeColor,
    });
    blocks.push({ x: 4, y: 22, w: 2, h: 4, fill: BASE.hair });
    blocks.push({ x: 4, y: 26, w: 2, h: 2, fill: bladeColor });

    if (level >= UNLOCK.swordGlow) {
      blocks.push({
        x: 4,
        y: bladeTop - 2,
        w: 2,
        h: 2,
        fill: lighten(bladeColor, 0.3),
      });
    }
  }

  if (level >= UNLOCK.helm) {
    // 兜は本体とふち（縁）を分け、頭とのシルエットの境目をはっきりさせる。
    blocks.push(
      { x: 6, y: 2, w: 16, h: 3, fill: cape },
      { x: 6, y: 5, w: 16, h: 1, fill: accent },
      { x: 12, y: 0, w: 4, h: 2, fill: accent }
    );
  }

  if (level >= UNLOCK.crown) {
    const gold = "#FCE188";
    blocks.push(
      { x: 8, y: 0, w: 12, h: 1, fill: lighten(gold, 0.4) },
      { x: 8, y: 1, w: 12, h: 1, fill: gold }
    );
  }

  if (level >= UNLOCK.sparkle) {
    const gold = "#FCE188";
    const sparklePositions: [number, number][] = [
      [0, 8],
      [26, 6],
      [0, 22],
      [26, 24],
    ];
    const sparkleCount = Math.min(
      sparklePositions.length,
      1 + Math.floor((level - UNLOCK.sparkle) / 1.5)
    );
    sparklePositions.slice(0, sparkleCount).forEach(([x, y]) => {
      blocks.push({ x, y, w: 2, h: 2, fill: gold });
    });
  }

  return blocks;
}

// シルエットを1マス分ラスタライズし、外周の空きマスに輪郭線を描く。
// レトロ8bit RPGスプライトを特徴づける「黒い縁取り」を、手作業の座標指定なしで
// どのレベル・装備の組み合わせでも正しく生成するための処理。
function outlineFor(blocks: Block[]): Block[] {
  const grid: boolean[][] = Array.from({ length: GRID_H }, () =>
    Array(GRID_W).fill(false)
  );
  for (const b of blocks) {
    const w = b.w ?? 1;
    const h = b.h ?? 1;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const gx = b.x + dx;
        const gy = b.y + dy;
        if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
          grid[gy][gx] = true;
        }
      }
    }
  }

  const neighbors = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
  ];
  const outline: Block[] = [];
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      if (grid[y][x]) continue;
      const touchesSprite = neighbors.some(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        return nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H && grid[ny][nx];
      });
      if (touchesSprite) outline.push({ x, y, w: 1, h: 1, fill: OUTLINE });
    }
  }
  return outline;
}

function CharacterAvatar({ level }: { level: number }) {
  const blocks = buildSprite(level);
  const outline = outlineFor(blocks);
  const shadow: Block[] = [{ x: 8, y: 32, w: 12, h: 2, fill: "#141B3D" }];

  return (
    <svg
      viewBox={`0 0 ${GRID_W * PX} ${GRID_H * PX}`}
      className="h-40 w-36"
      shapeRendering="crispEdges"
    >
      {shadow.map((b, i) => (
        <rect
          key={`shadow-${i}`}
          x={b.x * PX}
          y={b.y * PX}
          width={(b.w ?? 1) * PX}
          height={(b.h ?? 1) * PX}
          fill={b.fill}
        />
      ))}
      {[...outline, ...blocks].map((b, i) => (
        <rect
          key={i}
          x={b.x * PX}
          y={b.y * PX}
          width={(b.w ?? 1) * PX}
          height={(b.h ?? 1) * PX}
          fill={b.fill}
        />
      ))}
    </svg>
  );
}
