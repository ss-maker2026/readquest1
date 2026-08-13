"use client";

import { useEffect, useRef, useState } from "react";
import { Press_Start_2P } from "next/font/google";
import Logo from "@/components/Logo";
import AppNav from "@/components/AppNav";
import { CharacterAvatar } from "@/components/ReadingCharacter";
import { loadStoredLogs } from "@/lib/storage";
import {
  getCharacterProgress,
  applyDungeonZoneStyles,
  titleForLevel,
  MAX_LEVEL,
} from "@/lib/character";
import { getXpProgress, isMilestoneLevel } from "@/lib/levels";
import { calculateTotalXpForBookCount } from "@/lib/xp";
import type { BookLog } from "@/lib/types";

const pixelFont = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
});

const ALL_LEVELS = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1);

type RowState = "reached" | "next" | "locked";

// 「これから何が待っているのか」を見せつつ、ネタバレしすぎないための
// 3段階の状態。到達済みは称号を公開し、次のレベルだけ特別に先出しし、
// それより先は🔒でミステリーのまま保つ。
function stateForLevel(level: number, currentLevel: number): RowState {
  if (level <= currentLevel) return "reached";
  if (level === currentLevel + 1) return "next";
  return "locked";
}

export default function AdventurePage() {
  const [logs, setLogs] = useState<BookLog[]>([]);
  const currentRowRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    setLogs(loadStoredLogs());
  }, []);

  const totalBooks = logs.length;
  const { level: currentLevel, isMaxLevel } = getCharacterProgress(totalBooks);
  const totalXp = calculateTotalXpForBookCount(totalBooks);
  const xpProgress = getXpProgress(totalXp);

  useEffect(() => {
    applyDungeonZoneStyles(currentLevel);
  }, [currentLevel]);

  useEffect(() => {
    currentRowRef.current?.scrollIntoView({ block: "center" });
  }, [currentLevel]);

  const nextLevel = currentLevel + 1;

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 pb-24 pt-12 sm:py-20 sm:pb-24">
      <div className="w-full max-w-2xl">
        <header className="mb-6 flex justify-center text-center">
          <Logo />
        </header>

        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl font-bold text-glow-gold">
            冒険の記録
          </h1>
          <p className="mt-1 text-xs text-glow-gold/60">
            これまでとこれからの道のり
          </p>
        </div>

        {/* 次の冒険：もうすぐ手が届く、すぐ次のレベルだけを先出しで見せる */}
        {isMaxLevel ? (
          <div className="mb-8 rounded-2xl border-2 border-glow-gold bg-black/40 px-6 py-7 text-center shadow-lg">
            <p className="text-lg font-bold text-glow-gold">
              🏆 最高レベルに到達しました！
            </p>
            <p className="mt-1 text-sm text-glow-gold/70">
              あなたの冒険は、もはや伝説です。
            </p>
          </div>
        ) : (
          <div className="mb-8 overflow-hidden rounded-2xl border-2 border-glow-green bg-black/40 px-6 py-6 text-center shadow-lg">
            <p className="text-xs font-semibold tracking-wide text-glow-gold/70">
              次の冒険
            </p>
            <p
              className={`${pixelFont.className} mt-2 text-2xl text-glow-green`}
            >
              Lv.{nextLevel}
            </p>
            <div className="my-3 flex justify-center">
              <div className="rounded-md border-[3px] border-glow-gold bg-gradient-to-b from-[var(--dungeon-base)] to-[var(--dungeon-glow3)] p-3 shadow-[inset_0_0_0_2px_#0A0E22] transition-colors duration-700">
                <CharacterAvatar level={nextLevel} className="h-32 w-28" />
              </div>
            </div>
            <p className="text-lg font-medium text-glow-gold">
              「{titleForLevel(nextLevel)}」
            </p>
            <p className="mt-2 text-sm font-semibold text-glow-green">
              あと {xpProgress.remainingXp.toLocaleString()} XP
            </p>
          </div>
        )}

        <p className="mb-3 text-center text-xs text-glow-gold/50">
          現在地：Lv.{currentLevel}
        </p>

        {/* 進行マップ：Lv.1〜99の全行程。到達済みは公開、次のレベルは先出し、
            それより先は🔒でミステリーのまま。節目レベルだけ特別に目立たせる。 */}
        <ol className="flex flex-col items-center">
          {ALL_LEVELS.map((level, index) => {
            const state = stateForLevel(level, currentLevel);
            const milestone = isMilestoneLevel(level);
            const isCurrent = level === currentLevel;
            return (
              <li
                key={level}
                ref={isCurrent ? currentRowRef : undefined}
                className="flex w-full flex-col items-center"
              >
                <AdventureRow
                  level={level}
                  state={state}
                  milestone={milestone}
                  isCurrent={isCurrent}
                />
                {index < ALL_LEVELS.length - 1 && (
                  <span className="py-0.5 text-xs leading-none text-glow-gold/20">
                    ↓
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
      <AppNav />
    </main>
  );
}

function AdventureRow({
  level,
  state,
  milestone,
  isCurrent,
}: {
  level: number;
  state: RowState;
  milestone: boolean;
  isCurrent: boolean;
}) {
  const revealed = state !== "locked";
  const title = revealed ? titleForLevel(level) : "？？？";

  const marker = state === "reached" ? "●" : state === "next" ? "🎯" : "🔒";

  if (milestone) {
    // 節目レベルは、到達状況にかかわらずカードを大きく・装飾的にして
    // 「特別な何かがある」ことを常に伝える。ただし中身は未到達なら隠す。
    return (
      <div
        className={`my-1 flex w-full items-center justify-between gap-3 rounded-xl border-2 px-4 py-4 ${
          revealed
            ? "border-glow-gold bg-glow-gold/10"
            : "border-glow-gold/40 bg-black/30"
        } ${isCurrent ? "ring-2 ring-glow-green" : ""}`}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="shrink-0 text-lg">{revealed ? "✨" : "🔒"}</span>
          <div className="min-w-0 text-left">
            <p
              className={`text-sm font-bold ${revealed ? "text-glow-gold" : "text-glow-gold/50"}`}
            >
              Lv.{level}
            </p>
            <p
              className={`truncate text-sm ${revealed ? "text-glow-gold/90" : "text-glow-gold/40"}`}
            >
              {title}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {isCurrent && (
            <span className="rounded-full bg-glow-green px-2 py-0.5 text-[10px] font-bold text-[#0A0E22]">
              現在地
            </span>
          )}
          {!revealed && (
            <span className="text-[11px] text-glow-gold/40">
              Lv.{level}で解放
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-2 text-sm ${
        state === "next"
          ? "border-glow-green/60 bg-glow-green/10"
          : state === "reached"
            ? "border-glow-gold/15 bg-black/15"
            : "border-glow-gold/10 bg-black/5"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={
            state === "reached"
              ? "text-glow-gold/70"
              : state === "next"
                ? "text-glow-green"
                : "text-glow-gold/25"
          }
        >
          {marker}
        </span>
        <span
          className={
            state === "locked" ? "text-glow-gold/25" : "text-glow-gold/70"
          }
        >
          Lv.{level}
        </span>
        <span
          className={`truncate ${
            state === "locked" ? "text-glow-gold/25" : "text-glow-gold/60"
          }`}
        >
          {title}
        </span>
      </div>
      {isCurrent && (
        <span className="shrink-0 rounded-full bg-glow-green px-2 py-0.5 text-[10px] font-bold text-[#0A0E22]">
          現在地
        </span>
      )}
    </div>
  );
}
