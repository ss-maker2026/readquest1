"use client";

import { Press_Start_2P } from "next/font/google";
import { getCharacterProgress } from "@/lib/character";
import { getXpProgress, getNextEquipmentReward } from "@/lib/levels";
import { calculateTotalXpForBookCount } from "@/lib/xp";
import CharacterIllustration from "@/components/CharacterIllustration";

const pixelFont = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
});

type Props = {
  // 実際の記録数、またはレベルプレビュー中はプレビュー用の冊数。
  count: number;
  onStartQuest: () => void;
  isAtMax: boolean;
  // 記録の追加・編集フォームが開いている間は、クエスト開始ボタンを隠す。
  formOpen: boolean;
};

// ホーム画面の主役となるキャラクターカード。優先順位は上から
// 1.キャラクター 2.レベル 3.キャラクター名 4.XP 5.次のレベルまで
// 6.読書クエスト開始 7.次の報酬、の順。
export default function ReadingCharacter({
  count,
  onStartQuest,
  isAtMax,
  formOpen,
}: Props) {
  const { level, title, isMaxLevel } = getCharacterProgress(count);
  const xpProgress = getXpProgress(calculateTotalXpForBookCount(count));
  const nextReward = getNextEquipmentReward(level);

  const xpBarPercent =
    xpProgress.isMaxLevel || xpProgress.xpToNextLevel === null
      ? 100
      : Math.min(
          100,
          Math.round((xpProgress.xpIntoLevel / xpProgress.xpToNextLevel) * 100)
        );

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border-2 border-glow-gold/50 bg-black/35 shadow-sm shadow-ink/5 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 px-6 py-7 text-center sm:px-8">
        {/* 1. キャラクター */}
        <CharacterIllustration level={level} />

        {/* 2. レベル */}
        <p
          className={`${pixelFont.className} mt-1 text-4xl tracking-tight text-glow-green`}
        >
          Lv.{level}
        </p>

        {/* 3. キャラクター名（称号） */}
        <p className="font-serif text-xl font-medium text-glow-gold">
          {title}
        </p>

        {/* 4〜5. XP・進捗バー・次のレベルまで */}
        <div className="mt-1 w-full max-w-xs">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-semibold tracking-wide text-glow-gold/70">
              EXP
            </span>
            <span className="text-sm font-medium text-glow-gold/90">
              {xpProgress.xpIntoLevel.toLocaleString()}
              {xpProgress.xpToNextLevel !== null &&
                ` / ${xpProgress.xpToNextLevel.toLocaleString()}`}{" "}
              XP
            </span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full border border-glow-gold/25 bg-black/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-glow-green to-glow-gold transition-all duration-500"
              style={{ width: `${xpBarPercent}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-glow-gold/60">
            {isMaxLevel
              ? "最高レベルに到達しました"
              : `次のレベルまであと${xpProgress.remainingXp.toLocaleString()} XP`}
          </p>
        </div>

        {/* 6. 読書クエスト開始 */}
        {formOpen ? null : isAtMax ? (
          <p className="mt-1 w-full max-w-xs rounded-full border border-dashed border-glow-gold/40 bg-black/30 py-2.5 text-center text-xs font-medium text-glow-gold/40">
            上限に達しました
          </p>
        ) : (
          <button
            type="button"
            onClick={onStartQuest}
            className="mt-1 w-full max-w-xs rounded-full bg-glow-gold py-2.5 text-sm font-bold text-[#241F1A] shadow-sm transition-transform active:scale-95 hover:brightness-110"
          >
            ＋ 新しい読書クエスト
          </button>
        )}

        {/* 7. 次の報酬 */}
        <p className="text-[11px] text-glow-gold/50">
          {nextReward
            ? `次の報酬：${nextReward.equipmentName}（Lv.${nextReward.level}〜）`
            : "すべての装備を手に入れました"}
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

export function CharacterAvatar({
  level,
  className,
}: {
  level: number;
  className?: string;
}) {
  const blocks = buildSprite(level);
  const outline = outlineFor(blocks);
  const shadow: Block[] = [{ x: 8, y: 32, w: 12, h: 2, fill: "#141B3D" }];

  return (
    <svg
      viewBox={`0 0 ${GRID_W * PX} ${GRID_H * PX}`}
      className={className ?? "h-40 w-36"}
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
