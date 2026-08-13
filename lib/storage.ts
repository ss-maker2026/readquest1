import { normalizeBookLogs } from "@/lib/migrateLogs";
import type { BookLog } from "@/lib/types";

// 読書記録を保存しているlocalStorageキー。既存データとの互換性のため
// 変更しない。ホーム画面・キャラクター画面など複数の画面から同じキーで
// 読み書きするため、ここに一本化している。
export const LOGS_STORAGE_KEY = "reading-log-app:logs";

// localStorageから読書記録を安全に読み込む。壊れたJSON・旧形式のデータ・
// localStorageが使えない環境でもクラッシュせず、空配列にフォールバックする。
export function loadStoredLogs(): BookLog[] {
  try {
    const stored = window.localStorage.getItem(LOGS_STORAGE_KEY);
    if (!stored) return [];
    return normalizeBookLogs(JSON.parse(stored));
  } catch {
    return [];
  }
}
