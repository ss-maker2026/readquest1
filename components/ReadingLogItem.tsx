"use client";

import { useEffect, useRef } from "react";
import type { BookLog } from "@/lib/types";
import { ACQUISITION_LABELS, FORMAT_LABELS } from "@/lib/types";

type Props = {
  log: BookLog;
  onEdit: (log: BookLog) => void;
  onDelete: (id: string) => void;
  highlighted?: boolean;
};

const formatDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  return `${y}年${m}月${d}日`;
};

export default function ReadingLogItem({
  log,
  onEdit,
  onDelete,
  highlighted,
}: Props) {
  const liRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (highlighted) {
      liRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted]);

  return (
    <li
      ref={liRef}
      className={`group animate-fade-in relative rounded-2xl border bg-gold-soft p-4 shadow-sm shadow-ink/5 transition-all hover:shadow-md hover:shadow-ink/[0.06] sm:p-5 ${
        highlighted ? "border-accent ring-2 ring-accent/40" : "border-gold/25"
      }`}
    >
      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-100 transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(log)}
          aria-label="このクエストを編集"
          className="rounded-full p-1.5 text-ink/25 transition-all hover:bg-accent-soft hover:text-accent"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.7]">
            <path
              d="M13.5 3.5 16.5 6.5 7 16H4v-3L13.5 3.5Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`「${log.title}」を削除しますか？この操作は取り消せません。`)) {
              onDelete(log.id);
            }
          }}
          aria-label="このクエストを削除"
          className="rounded-full p-1.5 text-ink/25 transition-all hover:bg-red-50 hover:text-red-400"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.7]">
            <path
              d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6m2 0-.6 9.4a1.5 1.5 0 0 1-1.5 1.4H8.1a1.5 1.5 0 0 1-1.5-1.4L6 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="min-w-0 w-full pr-1">
        <h3 className="break-words font-serif text-base font-medium leading-snug text-ink sm:text-lg">
          {log.title}
        </h3>
        {log.author && (
          <p className="mt-0.5 text-sm text-ink/45">{log.author}</p>
        )}

        <div className="mt-2 flex flex-col gap-1 text-xs">
          <span className="w-fit rounded-full bg-accent-soft px-2.5 py-1 font-medium text-accent">
            {log.startDate && `${formatDate(log.startDate)}〜`}
            {formatDate(log.finishedDate)} クエストクリア
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] text-ink/55 ring-1 ring-inset ring-ink/10">
              {ACQUISITION_LABELS[log.acquisition]}
            </span>
            <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] text-ink/55 ring-1 ring-inset ring-ink/10">
              {FORMAT_LABELS[log.format]}
            </span>
            {log.pages !== undefined && (
              <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] text-ink/55 ring-1 ring-inset ring-ink/10">
                {log.pages.toLocaleString()}ページ
              </span>
            )}
            {log.shared && (
              <span className="flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-gold">
                <svg viewBox="0 0 20 20" className="h-3 w-3 fill-current">
                  <path d="M15 6a2 2 0 1 0-1.94-2.5L7.9 6.32a2 2 0 1 0 0 3.36l5.16 2.82a2 2 0 1 0 .72-1.36L8.62 8.32a2.02 2.02 0 0 0 0-.64l5.16-2.82c.34.28.76.46 1.22.46Z" />
                </svg>
                シェア済み
              </span>
            )}
            {log.keepForever && (
              <span className="flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-gold">
                <svg viewBox="0 0 20 20" className="h-3 w-3 fill-current">
                  <path d="M10 2 4 4v6c0 4.4 2.6 7.6 6 8.9 3.4-1.3 6-4.5 6-8.9V4l-6-2Z" />
                </svg>
                永久保存
              </span>
            )}
          </div>
        </div>
      </div>

      {log.review && (
        <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-ink/85">
          {log.review}
        </p>
      )}
    </li>
  );
}
