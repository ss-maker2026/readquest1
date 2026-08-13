import type { BookLog } from "@/lib/types";

export type StreakInfo = {
  // 今日を含む、現在継続中の連続読書日数（途切れていれば0）。
  currentStreak: number;
  // これまでの最長連続読書日数。
  longestStreak: number;
  // 今日すでに読了記録があるかどうか。
  isActiveToday: boolean;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function toDateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseDateOnly(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

// 読了日(finishedDate)から連続読書日数を計算する。新しいstateを持たず、
// 既存の記録だけから毎回導出するため、記録を消したり編集したりしても
// 自動的に正しい値になる。
export function calculateStreak(
  logs: BookLog[],
  now: Date = new Date()
): StreakInfo {
  const uniqueDates = Array.from(
    new Set(
      logs
        .map((log) => log.finishedDate)
        .filter((d): d is string => typeof d === "string")
    )
  )
    .map(parseDateOnly)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, isActiveToday: false };
  }

  // 最長連続記録
  let longest = 1;
  let run = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const diffDays = Math.round(
      (uniqueDates[i].getTime() - uniqueDates[i - 1].getTime()) / ONE_DAY_MS
    );
    run = diffDays === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const today = toDateOnly(now);
  const lastDate = uniqueDates[uniqueDates.length - 1];
  const diffFromToday = Math.round(
    (today.getTime() - lastDate.getTime()) / ONE_DAY_MS
  );
  const isActiveToday = diffFromToday === 0;

  // 最後に読んだ日が2日以上前なら、連続記録はいったん途切れている。
  // （「今日」または「昨日」まではまだ継続中とみなす）
  if (diffFromToday > 1) {
    return { currentStreak: 0, longestStreak: longest, isActiveToday: false };
  }

  let current = 1;
  for (let i = uniqueDates.length - 1; i > 0; i--) {
    const diffDays = Math.round(
      (uniqueDates[i].getTime() - uniqueDates[i - 1].getTime()) / ONE_DAY_MS
    );
    if (diffDays === 1) {
      current += 1;
    } else {
      break;
    }
  }

  return {
    currentStreak: current,
    longestStreak: Math.max(longest, current),
    isActiveToday,
  };
}

// 連続読書日数の表示メッセージ。読めなかった日を責めるのではなく、
// 常に前向きな言葉で次の一歩を後押しする。
export function getStreakMessage(streak: StreakInfo, hasAnyLogs: boolean): string {
  if (streak.currentStreak > 0) {
    return streak.isActiveToday
      ? `🔥 ${streak.currentStreak}日連続読書中！`
      : `🔥 ${streak.currentStreak}日連続読書中！今日も記録を伸ばそう`;
  }
  return hasAnyLogs
    ? "また今日から冒険を続けよう"
    : "🔥 今日から連続読書を始めよう";
}
