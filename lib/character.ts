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
  kingComments: string[];
};

// レベルが上がるほど、洞窟の入口から深部へ潜っていくイメージで
// 背景の色合いを変化させる。明るさは常に高めに保ち、文字の可読性を崩さない。
// 各帯には、王が読書の歩みに寄せる格言も紐づけている。
export const DUNGEON_ZONES: DungeonZone[] = [
  {
    from: 1,
    name: "洞窟の入口",
    base: "#F1ECE1",
    glow1: "#F8EFD8",
    glow2: "#EEE3CF",
    glow3: "#F2E7D2",
    kingComments: [
      "よくぞいらっしゃいました、若き読み手さん。一冊の本が、あなたの道を照らしてくれるでしょう。",
      "本を開くことは、新たな世界の扉を開くことです。恐れずに読み進めてくださいね。",
      "たとえ一行でも、読んだ言葉はあなたの力となりますよ。",
    ],
  },
  {
    from: 20,
    name: "苔むした回廊",
    base: "#E3E8DD",
    glow1: "#D7E4D0",
    glow2: "#DCE6D6",
    glow3: "#E0E8DA",
    kingComments: [
      "読み重ねてきたあなたの中には、静かな知恵が育っていますよ。",
      "本とは友のようなものです。何度でも語り合ってくださいね。",
      "頁をめくる音は、心が成長する音なのです。",
    ],
  },
  {
    from: 40,
    name: "松明の間",
    base: "#EADCC6",
    glow1: "#F1D9A4",
    glow2: "#E6D09E",
    glow3: "#EAD5AB",
    kingComments: [
      "剣を取るように、本を手に取ってみてください。知恵は最も鋭い刃となりますよ。",
      "読むことを恐れない人だけが、物語の核心にたどり着けるのです。",
      "一冊の本が、千の経験に値することもあるのですよ。",
    ],
  },
  {
    from: 60,
    name: "地下水脈",
    base: "#D7E1E1",
    glow1: "#C5D9DD",
    glow2: "#CDDBDC",
    glow3: "#D2DEDE",
    kingComments: [
      "静かな水脈のように、知識は深く流れ続けていくものです。",
      "読み終えた本の数だけ、あなたは違う自分になっているはずですよ。",
      "本を閉じた後にこそ、本当の読書が始まるのです。",
    ],
  },
  {
    from: 80,
    name: "溶岩回廊",
    base: "#E9D1C1",
    glow1: "#EFB088",
    glow2: "#E6AE92",
    glow3: "#EAC0A4",
    kingComments: [
      "灼熱の情熱を持って読み進める人にこそ、道は開かれていきますよ。",
      "あなたはもう、物語を読む人ではなく、物語を生きる人なのです。",
      "知恵の炎は、あなたの内でずっと燃え続けていますよ。",
    ],
  },
  {
    from: 95,
    name: "深淵の間",
    base: "#DACFE0",
    glow1: "#C6B4D8",
    glow2: "#CEBDDB",
    glow3: "#D4C5DF",
    kingComments: [
      "あなたはついに、言葉の深淵を覗く者となりました。",
      "読書神さん、あなたの物語もまた、いつか誰かの一冊となることでしょう。",
      "これ以上の高みはありません。ただ、読み続けてくださいね。",
    ],
  },
];

export function getDungeonZone(level: number): DungeonZone {
  let zone = DUNGEON_ZONES[0];
  for (const z of DUNGEON_ZONES) {
    if (level >= z.from) zone = z;
  }
  return zone;
}

// レベル帯ごとに複数の格言を持たせ、帯の中でもレベルに応じて少しずつ
// 表示される言葉が変わるようにする（ランダムではなく決定的に選ぶ）。
export function getKingComment(level: number): string {
  const zone = getDungeonZone(level);
  const index = level % zone.kingComments.length;
  return zone.kingComments[index];
}

export type IllustrationTier = {
  from: number;
  to: number;
  equipmentName: string;
  image: string;
};

// ChatGPTで生成したイラストが揃った帯だけをここに追加していく。
// 対応する画像がまだない帯は、従来のドット絵にフォールバックする。
// 区切りは称号の節目（TITLE_MILESTONES）と揃えている。
export const ILLUSTRATION_TIERS: IllustrationTier[] = [
  {
    from: 1,
    to: 8,
    equipmentName: "見習いの外套",
    image: "/characters/tier-01.png",
  },
  {
    from: 9,
    to: 16,
    equipmentName: "革表紙の書",
    image: "/characters/tier-02.png",
  },
  {
    from: 17,
    to: 24,
    equipmentName: "探検者のフード",
    image: "/characters/tier-03.png",
  },
  {
    from: 25,
    to: 32,
    equipmentName: "知識の魔導書",
    image: "/characters/tier-04.png",
  },
  {
    from: 33,
    to: 41,
    equipmentName: "鋼の短剣",
    image: "/characters/tier-05.png",
  },
  {
    from: 42,
    to: 49,
    equipmentName: "伝承の盾",
    image: "/characters/tier-06.png",
  },
  {
    from: 50,
    to: 57,
    equipmentName: "蒼き騎士剣",
    image: "/characters/tier-07.png",
  },
  {
    from: 58,
    to: 65,
    equipmentName: "賢者の杖",
    image: "/characters/tier-08.png",
  },
];

export function getIllustrationForLevel(level: number): IllustrationTier | null {
  return (
    ILLUSTRATION_TIERS.find((t) => level >= t.from && level <= t.to) ?? null
  );
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
