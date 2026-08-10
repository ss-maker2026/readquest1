export const MAX_LOGS = 10000;
export const MAX_LEVEL = 99;

/**
 * レベル1〜99の必要冊数しきい値を対数スケールで生成する。
 * 序盤は数冊ごとにレベルが上がり、終盤は到達に多くの冊数を要する。
 * threshold[0] は Lv.1（0冊）、threshold[98] は Lv.99（10,000冊）。
 */
function buildThresholds(): number[] {
  const arr: number[] = [];
  for (let level = 1; level <= MAX_LEVEL; level++) {
    const t = Math.round(
      Math.exp(((level - 1) * Math.log(MAX_LOGS + 1)) / (MAX_LEVEL - 1)) - 1
    );
    arr.push(t);
  }
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] <= arr[i - 1]) arr[i] = arr[i - 1] + 1;
  }
  arr[arr.length - 1] = MAX_LOGS;
  return arr;
}

export const LEVEL_THRESHOLDS = buildThresholds();

// 称号はレベル範囲ごとの節目にのみ設定し、装備・見た目はレベルごとに変化させる。
const TITLE_MILESTONES: [level: number, title: string][] = [
  [1, "見習い冒険者"],
  [9, "ページの旅人"],
  [17, "物語の探検家"],
  [25, "知識の魔導士"],
  [33, "本の剣士"],
  [42, "伝承の守護者"],
  [50, "叡智の騎士"],
  [58, "賢者"],
  [66, "大賢者"],
  [74, "読書の英雄"],
  [82, "伝説の司書"],
  [90, "読書神"],
];

function titleForLevel(level: number): string {
  let title = TITLE_MILESTONES[0][1];
  for (const [from, t] of TITLE_MILESTONES) {
    if (level >= from) title = t;
  }
  return title;
}

export type DungeonZone = {
  from: number;
  name: string;
  base: string;
  glow1: string;
  glow2: string;
  glow3: string;
};

// レベルが上がるほど、洞窟の入口から深部へ潜っていくイメージで
// 背景の色合いを変化させる。明るさは常に高めに保ち、文字の可読性を崩さない。
export const DUNGEON_ZONES: DungeonZone[] = [
  {
    from: 1,
    name: "洞窟の入口",
    base: "#F1ECE1",
    glow1: "#F8EFD8",
    glow2: "#EEE3CF",
    glow3: "#F2E7D2",
  },
  {
    from: 20,
    name: "苔むした回廊",
    base: "#E3E8DD",
    glow1: "#D7E4D0",
    glow2: "#DCE6D6",
    glow3: "#E0E8DA",
  },
  {
    from: 40,
    name: "松明の間",
    base: "#EADCC6",
    glow1: "#F1D9A4",
    glow2: "#E6D09E",
    glow3: "#EAD5AB",
  },
  {
    from: 60,
    name: "地下水脈",
    base: "#D7E1E1",
    glow1: "#C5D9DD",
    glow2: "#CDDBDC",
    glow3: "#D2DEDE",
  },
  {
    from: 80,
    name: "溶岩回廊",
    base: "#E9D1C1",
    glow1: "#EFB088",
    glow2: "#E6AE92",
    glow3: "#EAC0A4",
  },
  {
    from: 95,
    name: "深淵の間",
    base: "#DACFE0",
    glow1: "#C6B4D8",
    glow2: "#CEBDDB",
    glow3: "#D4C5DF",
  },
];

export function getDungeonZone(level: number): DungeonZone {
  let zone = DUNGEON_ZONES[0];
  for (const z of DUNGEON_ZONES) {
    if (level >= z.from) zone = z;
  }
  return zone;
}

export type CharacterProgress = {
  level: number;
  title: string;
  progress: number;
  remaining: number;
  count: number;
  isMaxLevel: boolean;
};

export function getCharacterProgress(count: number): CharacterProgress {
  const clamped = Math.max(0, Math.min(count, MAX_LOGS));

  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (clamped >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }

  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? null;
  const isMaxLevel = level >= MAX_LEVEL;

  const progress = nextThreshold
    ? Math.min(
        1,
        (clamped - currentThreshold) / (nextThreshold - currentThreshold)
      )
    : 1;

  return {
    level,
    title: titleForLevel(level),
    progress,
    remaining: nextThreshold ? nextThreshold - clamped : 0,
    count: clamped,
    isMaxLevel,
  };
}
