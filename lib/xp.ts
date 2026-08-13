// 読書によって得られる経験値（XP）の計算処理。
// 現時点では「本を1冊読了 = 100XP」というシンプルな仕様のみだが、
// 将来的にページ数・読書時間・連続読書ボーナスなどを追加できるよう、
// 経験値の計算をこのモジュールに独立させている。
// 既存のレベル表示ロジック（lib/character.ts の冊数ベースの仕組み）には
// 一切手を加えていない。

export const BASE_XP_PER_BOOK = 100;

// 本1冊分のXP計算に使う要素。現時点ではどれも未使用で、
// 将来ここに要素を追加していくための受け皿として用意してある。
export type XpFactors = {
  // 将来: ページ数に応じたボーナス
  pages?: number;
  // 将来: 読書時間（分）に応じたボーナス
  minutesSpent?: number;
  // 将来: 連続読書日数に応じたボーナス
  streakDays?: number;
  // 将来: イベントなどによる固定ボーナス
  bonus?: number;
};

// 本1冊を読了したときに得られるXPを計算する。
// 現在は基本XP（BASE_XP_PER_BOOK）のみを返す。factorsを介して
// 将来ボーナスを加算できるように引数だけ用意してある。
export function calculateBookXp(_factors: XpFactors = {}): number {
  // TODO: 将来的にここでページ数・読書時間・連続読書ボーナスなどを加算する。
  return BASE_XP_PER_BOOK;
}

// 読了した本のリスト（本1冊ごとのXP計算要素の配列）から、
// 累計獲得XPを計算する。
export function calculateTotalXp(entries: XpFactors[]): number {
  return entries.reduce((sum, factors) => sum + calculateBookXp(factors), 0);
}

// 冊数のみから累計XPを計算する（本ごとのXP計算要素を持たない場合の簡易版）。
// calculateTotalXp(Array(count).fill({})) と同じ結果になる。
export function calculateTotalXpForBookCount(count: number): number {
  return Math.max(0, count) * calculateBookXp();
}
