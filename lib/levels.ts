// Lv.1〜99のレベル情報テーブルと、累計XPから現在のレベル・進捗を
// 求める処理。
//
// 重要: しきい値は既存の LEVEL_THRESHOLDS（lib/character.ts、冊数ベース）を
// BASE_XP_PER_BOOK倍しただけの値を単一の情報源として使っている。
// そのため、現時点（1冊=100XPのみ、ボーナスなし）ではこのモジュールの
// 計算結果は既存の getCharacterProgress（冊数ベース）と完全に一致する。
// 既存の「次のレベルまであとN冊」表示（components/ReadingCharacter.tsx）や
// lib/character.ts 自体には一切手を加えていない。

import {
  LEVEL_THRESHOLDS,
  MAX_LEVEL,
  titleForLevel,
  TITLE_MILESTONE_LEVELS,
  DUNGEON_ZONES,
} from "@/lib/character";
import { BASE_XP_PER_BOOK } from "@/lib/xp";

export type LevelInfo = {
  level: number;
  // このレベルに到達するために、直前のレベルから追加で必要なXP。
  // Lv.1は開始レベルのため0。
  requiredXp: number;
  characterName: string;
  // まだ用意できていないレベル帯はnull。
  characterImage: string | null;
  equipmentName: string;
  title: string;
};

export type EquipmentTier = {
  from: number;
  equipmentName: string;
  characterImage: string | null;
};

// 装備名・キャラクター画像は、既存の称号の節目（TITLE_MILESTONES、12段階）と
// 同じ区切りで割り当てている。画像は現状Lv.1〜65の8段階分しか用意できて
// いないため、Lv.66以降はnullのままにしている（将来差し替え予定）。
export const EQUIPMENT_TIERS: EquipmentTier[] = [
  { from: 1, equipmentName: "見習いの外套", characterImage: "/characters/tier-01.png" },
  { from: 9, equipmentName: "革表紙の書", characterImage: "/characters/tier-02.png" },
  { from: 17, equipmentName: "探検者のフード", characterImage: "/characters/tier-03.png" },
  { from: 25, equipmentName: "知識の魔導書", characterImage: "/characters/tier-04.png" },
  { from: 33, equipmentName: "鋼の短剣", characterImage: "/characters/tier-05.png" },
  { from: 42, equipmentName: "伝承の盾", characterImage: "/characters/tier-06.png" },
  { from: 50, equipmentName: "蒼き騎士剣", characterImage: "/characters/tier-07.png" },
  { from: 58, equipmentName: "賢者の杖", characterImage: "/characters/tier-08.png" },
  { from: 66, equipmentName: "大賢者の法衣", characterImage: null },
  { from: 74, equipmentName: "英雄の証", characterImage: null },
  { from: 82, equipmentName: "無限の書架の鍵", characterImage: null },
  { from: 90, equipmentName: "神々の叡智", characterImage: null },
];

function equipmentForLevel(level: number) {
  let current = EQUIPMENT_TIERS[0];
  for (const tier of EQUIPMENT_TIERS) {
    if (level >= tier.from) current = tier;
  }
  return current;
}

// 冊数ベースのしきい値をXPしきい値に変換（単一の情報源をそのまま再利用）。
const XP_THRESHOLDS = LEVEL_THRESHOLDS.map((books) => books * BASE_XP_PER_BOOK);

function buildLevelTable(): LevelInfo[] {
  const table: LevelInfo[] = [];
  for (let level = 1; level <= MAX_LEVEL; level++) {
    const cumulative = XP_THRESHOLDS[level - 1];
    const previousCumulative = level === 1 ? 0 : XP_THRESHOLDS[level - 2];
    const equipment = equipmentForLevel(level);
    const title = titleForLevel(level);
    table.push({
      level,
      requiredXp: cumulative - previousCumulative,
      // 現状「キャラクター名」に相当する固有の概念がアプリにまだ無いため、
      // 称号（title）と同じ値を暫定的に入れている。将来、専用の名前付けを
      // 導入する場合はここを差し替える。
      characterName: title,
      characterImage: equipment.characterImage,
      equipmentName: equipment.equipmentName,
      title,
    });
  }
  return table;
}

// Lv.1〜99、99件のレベル情報テーブル（table[0]がLv.1）。
export const LEVEL_TABLE: LevelInfo[] = buildLevelTable();

export function getLevelInfo(level: number): LevelInfo {
  const safeLevel = Number.isFinite(level) ? level : 1;
  const clamped = Math.min(MAX_LEVEL, Math.max(1, Math.floor(safeLevel)));
  return LEVEL_TABLE[clamped - 1];
}

// 「冒険の記録」画面などで特別に目立たせる節目レベル。
// 称号が切り替わるレベル・ダンジョンの深度が変わるレベル・最大レベルの
// 合算（重複除去）。いずれも実際に何かが変化する意味のある節目。
const MILESTONE_LEVELS = new Set<number>([
  ...TITLE_MILESTONE_LEVELS,
  ...DUNGEON_ZONES.map((zone) => zone.from),
  MAX_LEVEL,
]);

export function isMilestoneLevel(level: number): boolean {
  return MILESTONE_LEVELS.has(level);
}

export type NextReward = { level: number; equipmentName: string } | null;

// 現在のレベルより先にある、次の装備切り替わり（=次の報酬）を返す。
// 既に最終装備帯にいる場合はnull。
export function getNextEquipmentReward(level: number): NextReward {
  const next = EQUIPMENT_TIERS.find((tier) => tier.from > level);
  if (!next) return null;
  return { level: next.from, equipmentName: next.equipmentName };
}

export type XpProgress = {
  level: number;
  totalXp: number;
  // 現在のレベルに入ってから稼いだXP（繰り越し分）。
  xpIntoLevel: number;
  // 次のレベルに到達するために必要なXP。Lv.99の場合はnull。
  xpToNextLevel: number | null;
  // 次のレベルまでの残りXP。Lv.99の場合は0。
  remainingXp: number;
  // 次のレベルまでの残り冊数の目安（既存の「あとN冊」表示との互換用）。
  // Lv.99の場合は0。
  remainingBooks: number;
  isMaxLevel: boolean;
};

// 累計XPから、現在のレベルと次のレベルまでの進捗を求める。
// XPが必要値に達するたびにlevelを1ずつ上げ、余ったXPは次のレベルへ
// 繰り越す（複数レベルアップにも対応）。Lv.99に到達したら、
// それ以上はレベルアップしない。
export function getXpProgress(totalXp: number): XpProgress {
  const xp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  let xpIntoLevel = xp;

  while (level < MAX_LEVEL) {
    const cost = getLevelInfo(level + 1).requiredXp;
    if (xpIntoLevel >= cost) {
      xpIntoLevel -= cost;
      level += 1;
    } else {
      break;
    }
  }

  const isMaxLevel = level >= MAX_LEVEL;
  const xpToNextLevel = isMaxLevel ? null : getLevelInfo(level + 1).requiredXp;
  const remainingXp =
    xpToNextLevel !== null ? Math.max(0, xpToNextLevel - xpIntoLevel) : 0;
  const remainingBooks =
    remainingXp > 0 ? Math.ceil(remainingXp / BASE_XP_PER_BOOK) : 0;

  return {
    level,
    totalXp: xp,
    xpIntoLevel,
    xpToNextLevel,
    remainingXp,
    remainingBooks,
    isMaxLevel,
  };
}
