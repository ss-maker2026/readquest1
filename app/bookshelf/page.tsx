"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import AppNav from "@/components/AppNav";
import { loadStoredLogs } from "@/lib/storage";
import { getCharacterProgress, applyDungeonZoneStyles } from "@/lib/character";
import { calculateBookXp, calculateTotalXpForBookCount } from "@/lib/xp";
import type { BookLog } from "@/lib/types";

type SortOption = "date-desc" | "date-asc";

const formatDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  return `${y}年${m}月${d}日`;
};

const sortByDate = (list: BookLog[], option: SortOption) => {
  const sorted = [...list].sort((a, b) =>
    b.finishedDate === a.finishedDate
      ? b.createdAt - a.createdAt
      : b.finishedDate.localeCompare(a.finishedDate)
  );
  return option === "date-desc" ? sorted : sorted.reverse();
};

function currentYearMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// 「本棚」画面。読了した本を、実務的な記録一覧としてではなく
// 「これまでの冒険の書庫」として振り返れるようにする。
// ホーム画面の一覧（編集・削除・評価つき）とは目的が異なるため、
// あえて別デザインの読み取り専用カードで表示している。
export default function BookshelfPage() {
  const [logs, setLogs] = useState<BookLog[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");

  useEffect(() => {
    setLogs(loadStoredLogs());
  }, []);

  const { level } = getCharacterProgress(logs.length);
  useEffect(() => {
    applyDungeonZoneStyles(level);
  }, [level]);

  const stats = useMemo(() => {
    const totalBooks = logs.length;
    const totalPages = logs.reduce((sum, log) => sum + (log.pages ?? 0), 0);
    const totalXp = calculateTotalXpForBookCount(totalBooks);

    const thisMonth = currentYearMonth();
    const thisMonthLogs = logs.filter((log) =>
      log.finishedDate.startsWith(thisMonth)
    );
    const monthBooks = thisMonthLogs.length;
    const monthPages = thisMonthLogs.reduce(
      (sum, log) => sum + (log.pages ?? 0),
      0
    );

    return { totalBooks, totalPages, totalXp, monthBooks, monthPages };
  }, [logs]);

  const sortedLogs = useMemo(
    () => sortByDate(logs, sortOption),
    [logs, sortOption]
  );

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 pb-24 pt-12 sm:py-20 sm:pb-24">
      <div className="w-full max-w-2xl">
        <header className="mb-6 flex justify-center text-center">
          <Logo />
        </header>

        <div className="mb-2 text-center">
          <h1 className="font-serif text-2xl font-bold text-glow-gold">
            本棚
          </h1>
          <p className="mt-1 text-xs text-glow-gold/60">
            これまでの冒険の記録
          </p>
        </div>

        {/* 統計 */}
        <div className="mb-6 mt-6 overflow-hidden rounded-2xl border-2 border-glow-gold/40 bg-black/30">
          <div className="grid grid-cols-3 gap-px bg-glow-gold/10 text-center">
            <div className="bg-black/40 px-3 py-4">
              <p className="text-lg font-bold text-glow-gold">
                {stats.totalBooks.toLocaleString()}
              </p>
              <p className="text-[11px] text-glow-gold/60">累計読了冊数</p>
            </div>
            <div className="bg-black/40 px-3 py-4">
              <p className="text-lg font-bold text-glow-gold">
                {stats.totalPages.toLocaleString()}
              </p>
              <p className="text-[11px] text-glow-gold/60">累計ページ数</p>
            </div>
            <div className="bg-black/40 px-3 py-4">
              <p className="text-lg font-bold text-glow-gold">
                {stats.totalXp.toLocaleString()}
              </p>
              <p className="text-[11px] text-glow-gold/60">累計XP</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px border-t border-glow-gold/20 bg-glow-gold/10 text-center">
            <div className="bg-black/25 px-3 py-3">
              <p className="text-sm font-semibold text-glow-green">
                {stats.monthBooks.toLocaleString()}冊
              </p>
              <p className="text-[11px] text-glow-gold/50">今月の読了</p>
            </div>
            <div className="bg-black/25 px-3 py-3">
              <p className="text-sm font-semibold text-glow-green">
                {stats.monthPages.toLocaleString()}ページ
              </p>
              <p className="text-[11px] text-glow-gold/50">今月のページ数</p>
            </div>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-glow-gold/30 bg-black/20 py-16 text-center">
            <p className="text-sm font-medium text-glow-gold/60">
              まだ冒険の記録がありません
            </p>
            <p className="mt-1 text-xs text-glow-gold/40">
              最初の一冊から冒険を始めよう！
            </p>
            <Link
              href="/"
              className="mt-5 inline-block rounded-full bg-glow-gold px-5 py-2.5 text-sm font-bold text-[#241F1A] shadow-sm transition-transform active:scale-95 hover:brightness-110"
            >
              ＋ 新しい読書クエスト
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-center gap-2 text-xs">
              <span className="font-semibold text-glow-gold">並び替え</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="rounded-full border border-glow-gold/30 bg-black/40 px-2.5 py-1.5 text-xs text-glow-gold/80 outline-none"
              >
                <option value="date-desc">新しい順</option>
                <option value="date-asc">古い順</option>
              </select>
            </div>

            <ul className="space-y-4">
              {sortedLogs.map((log) => (
                <BookshelfCard key={log.id} log={log} />
              ))}
            </ul>
          </>
        )}
      </div>
      <AppNav />
    </main>
  );
}

function BookshelfCard({ log }: { log: BookLog }) {
  const xp = calculateBookXp({ pages: log.pages });

  return (
    <li className="overflow-hidden rounded-2xl border-2 border-glow-gold/40 bg-black/30 shadow-sm">
      <div className="flex items-start gap-3 border-b border-glow-gold/15 bg-glow-gold/5 px-5 py-3">
        <span className="mt-0.5 shrink-0 text-lg">📖</span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-serif text-lg font-medium text-glow-gold">
            {log.title}
          </h2>
          {log.author && (
            <p className="truncate text-sm text-glow-gold/50">{log.author}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-glow-green/15 px-2.5 py-1 text-xs font-bold text-glow-green">
          +{xp.toLocaleString()} XP
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-5 py-3 text-xs text-glow-gold/60">
        <span className="rounded-full border border-glow-gold/20 px-2.5 py-1">
          {log.startDate && `${formatDate(log.startDate)}〜`}
          {formatDate(log.finishedDate)} クエストクリア
        </span>
        {log.pages !== undefined && (
          <span className="rounded-full border border-glow-gold/20 px-2.5 py-1">
            {log.pages.toLocaleString()}ページ
          </span>
        )}
      </div>

      {log.review && (
        <p className="whitespace-pre-wrap border-t border-glow-gold/10 px-5 py-3 text-sm leading-relaxed text-glow-gold/70">
          {log.review}
        </p>
      )}
    </li>
  );
}
