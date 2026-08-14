"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import AppNav from "@/components/AppNav";
import ReadingLogForm, { type NewBookLog } from "@/components/ReadingLogForm";
import ReadingLogItem from "@/components/ReadingLogItem";
import { LOGS_STORAGE_KEY, loadStoredLogs } from "@/lib/storage";
import { getCharacterProgress, applyDungeonZoneStyles } from "@/lib/character";
import { calculateTotalXpForBookCount } from "@/lib/xp";
import { averageRating, type BookLog } from "@/lib/types";

type SortOption = "date-desc" | "date-asc" | "rating-desc" | "rating-asc";

const formatDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  return `${y}年${m}月${d}日`;
};

const sortLogs = (list: BookLog[]) =>
  [...list].sort((a, b) =>
    b.finishedDate === a.finishedDate
      ? b.createdAt - a.createdAt
      : b.finishedDate.localeCompare(a.finishedDate)
  );

// 一覧表示用の並び替え・絞り込み。平均点は星評価未入力の本には存在しないため、
// 平均点順のときは未評価の本を常に末尾へ回す。
const getDisplayedLogs = (
  list: BookLog[],
  sortOption: SortOption,
  minRating: number | null
) => {
  const filtered =
    minRating === null
      ? list
      : list.filter((log) => {
          const avg = averageRating(log.ratings);
          return avg !== null && avg >= minRating;
        });

  if (sortOption === "date-desc") return sortLogs(filtered);
  if (sortOption === "date-asc") return sortLogs(filtered).reverse();

  const rated = filtered.filter((log) => averageRating(log.ratings) !== null);
  const unrated = filtered.filter((log) => averageRating(log.ratings) === null);
  rated.sort((a, b) => {
    const diff = (averageRating(a.ratings) ?? 0) - (averageRating(b.ratings) ?? 0);
    return sortOption === "rating-desc" ? -diff : diff;
  });
  return [...rated, ...unrated];
};

function currentYearMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

type FormState = { log: BookLog } | null;

// 「本棚」画面。読了した本を振り返るだけでなく、編集・削除・絞り込みといった
// 記録の管理もここで行う（新規追加はホーム画面のキャラクターカードから行う）。
export default function BookshelfPage() {
  const [logs, setLogs] = useState<BookLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formState, setFormState] = useState<FormState>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [minRating, setMinRating] = useState<number | null>(null);

  useEffect(() => {
    setLogs(loadStoredLogs());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  }, [logs, isLoaded]);

  useEffect(() => {
    if (!highlightId) return;
    const timer = window.setTimeout(() => setHighlightId(null), 2000);
    return () => window.clearTimeout(timer);
  }, [highlightId]);

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

  const displayedLogs = useMemo(
    () => getDisplayedLogs(logs, sortOption, minRating),
    [logs, sortOption, minRating]
  );

  const updateLog = (id: string, entry: NewBookLog) => {
    setLogs((prev) =>
      sortLogs(prev.map((log) => (log.id === id ? { ...log, ...entry } : log)))
    );
    setFormState(null);
    setHighlightId(id);
  };

  const deleteLog = (id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
    setFormState((prev) => (prev?.log.id === id ? null : prev));
  };

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

        {formState && (
          <div className="mb-6">
            <ReadingLogForm
              initial={formState.log}
              onSubmit={(entry) => updateLog(formState.log.id, entry)}
              onCancel={() => setFormState(null)}
            />
          </div>
        )}

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
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-dashed border-glow-gold/40 bg-black/35 px-4 py-3 text-xs">
              <label className="flex items-center gap-2">
                <span className="font-semibold text-glow-gold">並び替え</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="rounded-full border border-glow-gold/30 bg-black/40 px-2.5 py-1.5 text-xs text-glow-gold/80 outline-none"
                >
                  <option value="date-desc">読了日が新しい順</option>
                  <option value="date-asc">読了日が古い順</option>
                  <option value="rating-desc">平均点が高い順</option>
                  <option value="rating-asc">平均点が低い順</option>
                </select>
              </label>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-glow-gold">絞り込み</span>
                {[null, 3, 4, 5].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => setMinRating(v)}
                    className={`rounded-full border px-2.5 py-1.5 text-xs transition-colors ${
                      minRating === v
                        ? "border-glow-gold text-glow-gold"
                        : "border-glow-gold/25 text-glow-gold/50 hover:border-glow-gold/50"
                    }`}
                  >
                    {v === null ? "すべて" : `★${v}以上`}
                  </button>
                ))}
              </div>
            </div>

            {displayedLogs.length === 0 ? (
              <p className="py-16 text-center text-sm text-glow-gold/40">
                条件に一致する記録がありません
              </p>
            ) : (
              <ul className="space-y-4">
                {displayedLogs.map((log) => (
                  <ReadingLogItem
                    key={log.id}
                    log={log}
                    onEdit={(target) => setFormState({ log: target })}
                    onDelete={deleteLog}
                    highlighted={log.id === highlightId}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
      <AppNav />
    </main>
  );
}
