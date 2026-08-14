"use client";

import { useEffect, useState } from "react";
import { Press_Start_2P } from "next/font/google";
import Logo from "@/components/Logo";
import AppNav from "@/components/AppNav";
import CharacterIllustration from "@/components/CharacterIllustration";
import { loadStoredLogs } from "@/lib/storage";
import { getCharacterProgress, applyDungeonZoneStyles } from "@/lib/character";
import { getLevelInfo, EQUIPMENT_TIERS } from "@/lib/levels";
import { calculateTotalXpForBookCount } from "@/lib/xp";
import { ACHIEVEMENTS, getUnlockedAchievements } from "@/lib/achievements";
import {
  getCurrentTitle,
  loadSelectedTitleId,
  saveSelectedTitleId,
} from "@/lib/titles";
import type { BookLog } from "@/lib/types";

const pixelFont = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
});

// キャラクターの成長状況をまとめて確認できる専用画面。
// 画像はホーム画面のキャラクターカードやレベルアップ演出と同じ
// CharacterIllustrationを使う。装備帯ごとのイラストが読み込めない
// 場合は、常に全レベルぶん表示できるドット絵に自動フォールバックする。
export default function CharacterPage() {
  const [logs, setLogs] = useState<BookLog[]>([]);
  const [selectedTitleId, setSelectedTitleId] = useState<string | null>(null);

  useEffect(() => {
    setLogs(loadStoredLogs());
    setSelectedTitleId(loadSelectedTitleId());
  }, []);

  const totalBooks = logs.length;
  const totalPages = logs.reduce((sum, log) => sum + (log.pages ?? 0), 0);
  const totalXp = calculateTotalXpForBookCount(totalBooks);
  const { level } = getCharacterProgress(totalBooks);
  const info = getLevelInfo(level);

  const playerStats = {
    totalBooks,
    level,
    currentStreak: 0,
    longestStreak: 0,
  };
  const unlockedAchievements = getUnlockedAchievements(playerStats);
  const currentTitle = getCurrentTitle(playerStats, selectedTitleId);

  const handleSelectTitle = (id: string) => {
    setSelectedTitleId(id);
    saveSelectedTitleId(id);
  };

  useEffect(() => {
    applyDungeonZoneStyles(level);
  }, [level]);

  // 現在装備している装備帯（＝到達済みの装備帯のうち最も新しいもの）。
  const currentTierFrom = [...EQUIPMENT_TIERS]
    .reverse()
    .find((tier) => tier.from <= level)?.from;

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 pb-24 pt-12 sm:py-20 sm:pb-24">
      <div className="w-full max-w-2xl">
        <header className="mb-6 flex justify-center text-center">
          <Logo />
        </header>

        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl font-bold text-glow-gold">
            キャラクター
          </h1>
          <p className="mt-1 text-xs text-glow-gold/60">
            冒険者としてのステータス
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border-2 border-glow-gold/50 bg-black/35 shadow-sm shadow-ink/5 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 px-6 py-8 text-center sm:px-8">
            <CharacterIllustration
              level={level}
              className="w-full max-w-sm overflow-hidden rounded-md border-[3px] border-glow-gold bg-gradient-to-b from-[var(--dungeon-base)] to-[var(--dungeon-glow3)] shadow-[inset_0_0_0_2px_#0A0E22] transition-colors duration-700"
            />

            <p
              className={`${pixelFont.className} mt-2 text-4xl tracking-tight text-glow-green`}
            >
              Lv.{level}
            </p>
            <p className="text-xl font-medium text-glow-gold">
              {info.characterName}
            </p>
            <div className="mt-1 flex flex-col gap-0.5 text-sm text-glow-gold/70">
              <p>称号：{info.title}</p>
              <p>現在の装備：{info.equipmentName}</p>
              <p>
                実績称号：
                {currentTitle ? `${currentTitle.icon} ${currentTitle.name}` : "まだありません"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-px border-t border-glow-gold/20 bg-glow-gold/10 text-center">
            <div className="bg-black/40 px-3 py-4">
              <p className="text-lg font-bold text-glow-gold">
                {totalBooks.toLocaleString()}
              </p>
              <p className="text-[11px] text-glow-gold/60">累計読了冊数</p>
            </div>
            <div className="bg-black/40 px-3 py-4">
              <p className="text-lg font-bold text-glow-gold">
                {totalPages.toLocaleString()}
              </p>
              <p className="text-[11px] text-glow-gold/60">累計ページ数</p>
            </div>
            <div className="bg-black/40 px-3 py-4">
              <p className="text-lg font-bold text-glow-gold">
                {totalXp.toLocaleString()}
              </p>
              <p className="text-[11px] text-glow-gold/60">累計XP</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border-2 border-glow-gold/40 bg-black/30 p-5">
          <h2 className="mb-4 text-sm font-semibold text-glow-gold">
            装備コレクション
          </h2>
          <ul className="space-y-2">
            {EQUIPMENT_TIERS.map((tier) => {
              const unlocked = level >= tier.from;
              const isCurrent = tier.from === currentTierFrom;
              return (
                <li
                  key={tier.from}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm ${
                    isCurrent
                      ? "border-glow-gold bg-glow-gold/10"
                      : unlocked
                        ? "border-glow-gold/25 bg-black/20"
                        : "border-glow-gold/10 bg-black/10"
                  }`}
                >
                  <span
                    className={unlocked ? "text-glow-gold" : "text-glow-gold/35"}
                  >
                    {unlocked ? "✅" : "🔒"} {tier.equipmentName}
                  </span>
                  {isCurrent ? (
                    <span className="rounded-full bg-glow-gold px-2 py-0.5 text-[10px] font-bold text-[#241F1A]">
                      装備中
                    </span>
                  ) : unlocked ? (
                    <span className="text-[11px] text-glow-gold/40">
                      Lv.{tier.from}〜
                    </span>
                  ) : (
                    <span className="text-[11px] text-glow-gold/40">
                      Lv.{tier.from}で解放
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* 実績で獲得した称号。未解放のものは選べない。 */}
        <div className="mt-6 rounded-2xl border-2 border-glow-gold/40 bg-black/30 p-5">
          <h2 className="mb-1 text-sm font-semibold text-glow-gold">
            称号を選ぶ
          </h2>
          <p className="mb-4 text-[11px] text-glow-gold/50">
            実績を解放すると、その名前を称号として選べるようになります。
          </p>
          {unlockedAchievements.length === 0 ? (
            <p className="text-xs text-glow-gold/40">
              まだ称号がありません。実績を解放すると選べるようになります。
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {unlockedAchievements.map((achievement) => {
                const isSelected = currentTitle?.id === achievement.id;
                return (
                  <button
                    key={achievement.id}
                    type="button"
                    onClick={() => handleSelectTitle(achievement.id)}
                    aria-pressed={isSelected}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      isSelected
                        ? "border-glow-gold bg-glow-gold text-[#241F1A] font-bold"
                        : "border-glow-gold/30 text-glow-gold/70 hover:border-glow-gold hover:text-glow-gold"
                    }`}
                  >
                    {achievement.icon} {achievement.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 実績一覧。条件は隠さず、常に目標として見えるようにする。 */}
        <div className="mt-6 rounded-2xl border-2 border-glow-gold/40 bg-black/30 p-5">
          <h2 className="mb-4 text-sm font-semibold text-glow-gold">実績</h2>
          <ul className="space-y-2">
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = achievement.isUnlocked(playerStats);
              return (
                <li
                  key={achievement.id}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm ${
                    unlocked
                      ? "border-glow-gold/25 bg-black/20"
                      : "border-glow-gold/10 bg-black/10"
                  }`}
                >
                  <span className="shrink-0 text-lg">
                    {unlocked ? achievement.icon : "🔒"}
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <p
                      className={
                        unlocked
                          ? "font-medium text-glow-gold"
                          : "font-medium text-glow-gold/45"
                      }
                    >
                      {achievement.name}
                    </p>
                    <p
                      className={
                        unlocked ? "text-xs text-glow-gold/60" : "text-xs text-glow-gold/35"
                      }
                    >
                      {achievement.description}
                    </p>
                  </div>
                  {unlocked && (
                    <span className="shrink-0 rounded-full bg-glow-gold/15 px-2 py-0.5 text-[10px] font-bold text-glow-gold">
                      達成
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <AppNav />
    </main>
  );
}
