import {
  getUnlockedAchievements,
  type Achievement,
  type PlayerStats,
} from "@/lib/achievements";

// 実績を解放すると、その実績名が「称号」として表示・選択できるようになる。
// 現時点では未選択なら自動的に一番難度の高い（最後に解放した）実績を
// 表示するが、選択状態はlocalStorageに保存しているため、将来的に
// 「称号を選ぶ」UIを追加しても既存データを壊さずそのまま拡張できる。
const SELECTED_TITLE_KEY = "reading-log-app:selectedTitleId";

export function loadSelectedTitleId(): string | null {
  try {
    return window.localStorage.getItem(SELECTED_TITLE_KEY);
  } catch {
    return null;
  }
}

export function saveSelectedTitleId(id: string | null): void {
  try {
    if (id === null) {
      window.localStorage.removeItem(SELECTED_TITLE_KEY);
    } else {
      window.localStorage.setItem(SELECTED_TITLE_KEY, id);
    }
  } catch {
    // localStorageが使えない環境では何もしない（クラッシュさせない）。
  }
}

// 現在表示すべき称号（＝実績）を返す。実績を1つも解放していなければnull。
export function getCurrentTitle(
  stats: PlayerStats,
  selectedId: string | null
): Achievement | null {
  const unlocked = getUnlockedAchievements(stats);
  if (unlocked.length === 0) return null;

  if (selectedId) {
    const selected = unlocked.find((a) => a.id === selectedId);
    if (selected) return selected;
  }

  // 未選択、または選択済みのものがまだ未解放なら、最も難度の高い
  // （定義順で最後に解放される）実績を自動的に選ぶ。
  return unlocked[unlocked.length - 1];
}
