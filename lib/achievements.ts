// 実績（アチーブメント）の定義と判定処理。
// 新しい実績を増やしたいときは ACHIEVEMENTS配列に1件追加するだけでよい
// （コードの他の部分を変更する必要はない）。

export type PlayerStats = {
  totalBooks: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: (stats: PlayerStats) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-book",
    name: "はじめての一冊",
    description: "本を1冊読了する",
    icon: "🌱",
    isUnlocked: (stats) => stats.totalBooks >= 1,
  },
  {
    id: "reader",
    name: "読書家",
    description: "本を10冊読了する",
    icon: "📗",
    isUnlocked: (stats) => stats.totalBooks >= 10,
  },
  {
    id: "knowledge-seeker",
    name: "知識の探求者",
    description: "本を50冊読了する",
    icon: "📘",
    isUnlocked: (stats) => stats.totalBooks >= 50,
  },
  {
    id: "book-adventurer",
    name: "本の冒険者",
    description: "本を100冊読了する",
    icon: "📙",
    isUnlocked: (stats) => stats.totalBooks >= 100,
  },
  {
    id: "path-to-sage",
    name: "大賢者への道",
    description: "Lv.50に到達する",
    icon: "🧙",
    isUnlocked: (stats) => stats.level >= 50,
  },
  {
    id: "legendary-reader",
    name: "伝説の読書家",
    description: "Lv.99に到達する",
    icon: "👑",
    isUnlocked: (stats) => stats.level >= 99,
  },
];

// statsを満たしている（＝解放済みの）実績だけを、配列の定義順のまま返す。
export function getUnlockedAchievements(stats: PlayerStats): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.isUnlocked(stats));
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
