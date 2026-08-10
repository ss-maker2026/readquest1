"use client";

import type { BookLog } from "@/lib/types";
import { ACQUISITION_LABELS, FORMAT_LABELS } from "@/lib/types";

type Props = {
  log: BookLog;
  onEdit: (log: BookLog) => void;
  onDelete: (id: string) => void;
};

const formatDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  return `${y}年${m}月${d}日`;
};

export default function ReadingLogItem({ log, onEdit, onDelete }: Props) {
  return (
    <li className="group animate-fade-in rounded-2xl border border-ink/[0.06] bg-white p-5 shadow-sm shadow-ink/5 transition-shadow hover:shadow-md hover:shadow-ink/[0.06] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-lg font-medium text-ink sm:text-xl">
            {log.title}
          </h3>
          {log.author && (
            <p className="mt-0.5 text-sm text-ink/45">{log.author}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-all group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(log)}
            aria-label="この記録を編集"
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
            onClick={() => onDelete(log.id)}
            aria-label="この記録を削除"
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
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded-full bg-accent-soft px-2.5 py-1 font-medium text-accent">
          {formatDate(log.finishedDate)}読了
        </span>
        <span className="rounded-full bg-paper px-2.5 py-1 text-ink/55 ring-1 ring-inset ring-ink/10">
          {ACQUISITION_LABELS[log.acquisition]}
        </span>
        <span className="rounded-full bg-paper px-2.5 py-1 text-ink/55 ring-1 ring-inset ring-ink/10">
          {FORMAT_LABELS[log.format]}
        </span>
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

      {log.review && (
        <p className="mt-3.5 whitespace-pre-wrap text-sm leading-relaxed text-ink/85">
          {log.review}
        </p>
      )}
    </li>
  );
}
