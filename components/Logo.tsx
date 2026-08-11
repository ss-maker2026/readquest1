const OUTLINE = "#241F1A";
const GOLD = "#D8B65C";
const GOLD_LIGHT = "#F0D98C";
const STEEL = "#D8DEE2";
const BROWN = "#4A3223";
const BROWN_DARK = "#3A2519";
const PAGE = "#F6E9C8";

type Block = { x: number; y: number; w?: number; h?: number; fill: string };

function withOutline(blocks: Block[], w: number, h: number): Block[] {
  const grid: boolean[][] = Array.from({ length: h }, () => Array(w).fill(false));
  for (const b of blocks) {
    const bw = b.w ?? 1;
    const bh = b.h ?? 1;
    for (let dy = 0; dy < bh; dy++) {
      for (let dx = 0; dx < bw; dx++) {
        const gx = b.x + dx;
        const gy = b.y + dy;
        if (gx >= 0 && gx < w && gy >= 0 && gy < h) grid[gy][gx] = true;
      }
    }
  }
  const neighbors = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
  ];
  const outline: Block[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x]) continue;
      const touches = neighbors.some(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        return nx >= 0 && nx < w && ny >= 0 && ny < h && grid[ny][nx];
      });
      if (touches) outline.push({ x, y, w: 1, h: 1, fill: OUTLINE });
    }
  }
  return [...outline, ...blocks];
}

function PixelIcon({
  blocks,
  gridW,
  gridH,
  px,
  className,
}: {
  blocks: Block[];
  gridW: number;
  gridH: number;
  px: number;
  className?: string;
}) {
  const withOutlineBlocks = withOutline(blocks, gridW, gridH);
  return (
    <svg
      viewBox={`0 0 ${gridW * px} ${gridH * px}`}
      className={className}
      shapeRendering="crispEdges"
    >
      {withOutlineBlocks.map((b, i) => (
        <rect
          key={i}
          x={b.x * px}
          y={b.y * px}
          width={(b.w ?? 1) * px}
          height={(b.h ?? 1) * px}
          fill={b.fill}
        />
      ))}
    </svg>
  );
}

const SWORD_BLOCKS: Block[] = [
  { x: 3, y: 0, w: 2, h: 8, fill: STEEL },
  { x: 3, y: 0, w: 1, h: 8, fill: GOLD_LIGHT },
  { x: 1, y: 8, w: 6, h: 2, fill: GOLD },
  { x: 3, y: 10, w: 2, h: 4, fill: BROWN },
  { x: 3, y: 14, w: 2, h: 1, fill: GOLD },
];

const BOOK_BLOCKS: Block[] = [
  { x: 0, y: 1, w: 7, h: 8, fill: BROWN },
  { x: 0, y: 1, w: 1, h: 8, fill: BROWN_DARK },
  { x: 7, y: 2, w: 2, h: 6, fill: PAGE },
  { x: 3, y: 0, w: 1, h: 4, fill: GOLD },
];

export default function Logo() {
  return (
    <div className="inline-flex items-center gap-3 rounded-xl border-2 border-gold bg-gradient-to-b from-[#26346E] to-[#0C1330] px-5 py-3 shadow-[inset_0_0_0_2px_#0A0E22] sm:gap-4 sm:px-7">
      <PixelIcon
        blocks={SWORD_BLOCKS}
        gridW={8}
        gridH={15}
        px={3}
        className="h-11 w-auto shrink-0 sm:h-14"
      />
      <h1 className="whitespace-nowrap text-2xl font-bold tracking-wide text-gold sm:text-3xl">
        読書クエスト
      </h1>
      <PixelIcon
        blocks={BOOK_BLOCKS}
        gridW={10}
        gridH={9}
        px={3}
        className="h-8 w-auto shrink-0 sm:h-10"
      />
    </div>
  );
}
