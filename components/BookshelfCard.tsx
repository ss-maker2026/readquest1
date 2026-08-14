"use client";

import { useEffect, useRef } from "react";
import { calculateBookXp } from "@/lib/xp";
import type { BookLog } from "@/lib/types";

type Props = {
  log: BookLog;
  highlighted?: boolean;
};

const formatDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  return `${y}年${m}月${d}日`;
};

// 読み取り専用の記録カード（編集・削除ボタンは持たない）。
// 「これまでの冒険の書庫」を眺めるための表示に徹する。
export default function BookshelfCard({ log, highlighted }: Props) {
  const xp = calculateBookXp({ pages: log.pages });
  const liRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (highlighted) {
      liRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted]);

  return (
    <li
      ref={liRef}
      className={`overflow-hidden rounded-2xl border-2 bg-black/30 shadow-sm transition-all ${
        highlighted
          ? "border-glow-green ring-2 ring-glow-green/40"
          : "border-glow-gold/40"
      }`}
    >
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
