export const MAX_LOGS = 10000;
export const MAX_LEVEL = 99;

/**
 * レベル1〜99の必要冊数しきい値を2次関数（放物線）カーブで生成する。
 * 1レベルあたりに必要な冊数の「増分」自体がレベルが上がるほど連続的に
 * 大きくなっていくため、序盤だけ「1冊=1レベル」のような平坦な区間が
 * できることがなく、序盤は緩やかに・終盤は重く、を滑らかに実現する。
 * threshold[0] は Lv.1（0冊）、threshold[98] は Lv.99（10,000冊）。
 */
function buildThresholds(): number[] {
  const arr: number[] = [];
  for (let level = 1; level <= MAX_LEVEL; level++) {
    const progress = (level - 1) / (MAX_LEVEL - 1);
    const t = Math.round(MAX_LOGS * progress * progress);
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

export function titleForLevel(level: number): string {
  let title = TITLE_MILESTONES[0][1];
  for (const [from, t] of TITLE_MILESTONES) {
    if (level >= from) title = t;
  }
  return title;
}

// 称号が切り替わるレベル一覧（新しい称号・装備が手に入る節目）。
export const TITLE_MILESTONE_LEVELS: number[] = TITLE_MILESTONES.map(
  ([level]) => level
);

export type DungeonZone = {
  from: number;
  name: string;
  base: string;
  glow1: string;
  glow2: string;
  glow3: string;
  // 半透明カード上に乗る文字色（R G B）。濃紺化がまだの帯は
  // 従来のink色のままにしておく。
  textRgb: string;
  // Lv.数字(緑)とラベル(ゴールド)の文字色（R G B）。
  // 濃紺化がまだの帯は従来のaccent/gold色のままにしておく。
  accentRgb: string;
  goldRgb: string;
  quotes: { author: string; text: string }[];
};

// レベルが上がるほど、洞窟の入口から深部へ潜っていくイメージで
// 背景の色合いを変化させる。ロゴ・キャラクター枠の濃紺+ゴールドを起点に、
// レベルが上がるごとに段階的に暗く深い色へ変化していく。
// 各帯には、古今東西の偉人が読書について残した言葉を紐づけている。
export const DUNGEON_ZONES: DungeonZone[] = [
  {
    from: 1,
    name: "洞窟の入口",
    base: "#26346E",
    glow1: "#8C6B34",
    glow2: "#34418C",
    glow3: "#1B2550",
    textRgb: "236 231 218",
    accentRgb: "111 227 176",
    goldRgb: "240 217 140",
    quotes: [
      {
        author: "ルネ・デカルト",
        text: "良書を読むことは、過去の最もすぐれた人々と語り合うようなものである。",
      },
      {
        author: "孔子",
        text: "学びて時に之を習う、亦た説ばしからずや。",
      },
      {
        author: "フランシス・ベーコン",
        text: "読書は人を豊かにし、対話は人を機敏にし、著述は人を確かにする。",
      },
    ],
  },
  {
    from: 20,
    name: "苔むした回廊",
    base: "#193433",
    glow1: "#DDC780",
    glow2: "#204B35",
    glow3: "#132C1F",
    textRgb: "236 231 218",
    accentRgb: "111 227 176",
    goldRgb: "240 217 140",
    quotes: [
      {
        author: "ヘンリー・デイヴィッド・ソロー",
        text: "一冊の本を読んだことがきっかけで、新たな時代を歩み始めた者は数知れない。",
      },
      {
        author: "荀子",
        text: "学は以て已むべからず。",
      },
      {
        author: "ラルフ・ワルド・エマソン",
        text: "読んだ本の中身は忘れてしまっても、その本は確かに私を形づくっている。",
      },
    ],
  },
  {
    from: 40,
    name: "松明の間",
    base: "#2F271B",
    glow1: "#C9B573",
    glow2: "#553F17",
    glow3: "#2B200B",
    textRgb: "236 231 218",
    accentRgb: "111 227 176",
    goldRgb: "240 217 140",
    quotes: [
      {
        author: "マルクス・トゥッリウス・キケロ",
        text: "本のない部屋は、魂のない身体のようなものだ。",
      },
      {
        author: "杜甫",
        text: "読書破万巻、筆を下せば神あるが如し。",
      },
      {
        author: "マーク・トウェイン",
        text: "本を読まない者は、文字を読めない者と何ら変わりはない。",
      },
    ],
  },
  {
    from: 60,
    name: "地下水脈",
    base: "#102630",
    glow1: "#B6A367",
    glow2: "#153B41",
    glow3: "#0C2124",
    textRgb: "236 231 218",
    accentRgb: "111 227 176",
    goldRgb: "240 217 140",
    quotes: [
      {
        author: "ヴォルテール",
        text: "書物から得る学びは火のようなものだ。隣人から分けてもらい、自らの家で灯し、他者に伝えることで、やがて万人のものとなる。",
      },
      {
        author: "韓愈",
        text: "学業は勤めることで深まり、怠ければ荒れ果てる。",
      },
      {
        author: "ミシェル・ド・モンテーニュ",
        text: "読書ほど安上がりで、長続きする喜びはない。",
      },
    ],
  },
  {
    from: 80,
    name: "溶岩回廊",
    base: "#311613",
    glow1: "#A2915A",
    glow2: "#552114",
    glow3: "#2E120B",
    textRgb: "236 231 218",
    accentRgb: "111 227 176",
    goldRgb: "240 217 140",
    quotes: [
      {
        author: "トーマス・ジェファーソン",
        text: "本なしでは生きられない。",
      },
      {
        author: "諸葛亮",
        text: "学ばざれば以て才を広むる無く、志さざれば以て学を成す無し。",
      },
      {
        author: "フランシス・ベーコン",
        text: "ある本は味わうべきものであり、ある本は飲み込むべきものであり、そして少数の本はよく噛んで消化すべきものである。",
      },
    ],
  },
  {
    from: 95,
    name: "深淵の間",
    base: "#1A102A",
    glow1: "#8F7F4E",
    glow2: "#2E1B44",
    glow3: "#190E24",
    textRgb: "236 231 218",
    accentRgb: "111 227 176",
    goldRgb: "240 217 140",
    quotes: [
      {
        author: "フランツ・カフカ",
        text: "本というものは、私たちの中の凍りついた海を割る斧でなければならない。",
      },
      {
        author: "佐藤一斎",
        text: "少にして学べば、則ち壮にして為すことあり。",
      },
      {
        author: "董遇",
        text: "読書百遍、義自ずから見る。",
      },
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

// レベル（ダンジョンの深さ）に応じて、ページ全体の背景色を書き換える。
// ホーム画面・キャラクター画面など、複数の画面から共通で呼び出せるように
// 副作用（CSS変数の書き換え）をここに独立させている。
export function applyDungeonZoneStyles(level: number): void {
  const zone = getDungeonZone(level);
  const root = document.documentElement.style;
  root.setProperty("--dungeon-base", zone.base);
  root.setProperty("--dungeon-glow1", zone.glow1);
  root.setProperty("--dungeon-glow2", zone.glow2);
  root.setProperty("--dungeon-glow3", zone.glow3);
  root.setProperty("--mist-rgb", zone.textRgb);
  root.setProperty("--glow-green-rgb", zone.accentRgb);
  root.setProperty("--glow-gold-rgb", zone.goldRgb);
}

// レベル帯ごとに複数の格言を持たせ、帯の中でもレベルに応じて少しずつ
// 表示される言葉が変わるようにする（ランダムではなく決定的に選ぶ）。
export function getReadingQuote(level: number): { author: string; text: string } {
  const zone = getDungeonZone(level);
  const index = level % zone.quotes.length;
  return zone.quotes[index];
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
