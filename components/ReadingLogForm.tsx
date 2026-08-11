"use client";

import { useState } from "react";
import type {
  AcquisitionMethod,
  BookFormat,
  BookLog,
  BookRatings,
} from "@/lib/types";
import {
  ACQUISITION_LABELS,
  FORMAT_LABELS,
  RATING_CRITERIA,
  defaultRatings,
} from "@/lib/types";

export type NewBookLog = {
  title: string;
  author: string;
  finishedDate: string;
  acquisition: AcquisitionMethod;
  format: BookFormat;
  review: string;
  shared: boolean;
  keepForever: boolean;
  ratings: BookRatings;
};

type Props = {
  initial?: BookLog;
  onSubmit: (entry: NewBookLog) => void;
  onCancel: () => void;
};

const todayStr = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
};

export default function ReadingLogForm({ initial, onSubmit, onCancel }: Props) {
  const isEditing = Boolean(initial);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [finishedDate, setFinishedDate] = useState(
    initial?.finishedDate ?? todayStr()
  );
  const [acquisition, setAcquisition] = useState<AcquisitionMethod>(
    initial?.acquisition ?? "purchase"
  );
  const [format, setFormat] = useState<BookFormat>(initial?.format ?? "paper");
  const [review, setReview] = useState(initial?.review ?? "");
  const [shared, setShared] = useState(initial?.shared ?? false);
  const [keepForever, setKeepForever] = useState(initial?.keepForever ?? false);
  const [ratings, setRatings] = useState<BookRatings>(
    initial?.ratings ?? defaultRatings()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !finishedDate) return;

    onSubmit({
      title: trimmedTitle,
      author: author.trim(),
      finishedDate,
      acquisition,
      format,
      review: review.trim(),
      shared,
      keepForever,
      ratings,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-slide-down space-y-6 rounded-2xl border border-ink/[0.06] bg-white p-6 shadow-sm shadow-ink/5 sm:p-7"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs font-medium tracking-wide text-ink/50">
            書籍タイトル
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="本のタイトルを入力"
            maxLength={200}
            required
            className="rounded-lg border border-ink/10 bg-paper/60 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/15"
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs font-medium tracking-wide text-ink/50">
            著者（任意）
          </span>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="著者名を入力"
            maxLength={100}
            className="rounded-lg border border-ink/10 bg-paper/60 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/15"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium tracking-wide text-ink/50">
            読み終えた日
          </span>
          <input
            type="date"
            value={finishedDate}
            onChange={(e) => setFinishedDate(e.target.value)}
            required
            className="rounded-lg border border-ink/10 bg-paper/60 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/15"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium tracking-wide text-ink/50">
            入手方法
          </span>
          <div className="flex gap-2">
            {(Object.keys(ACQUISITION_LABELS) as AcquisitionMethod[]).map(
              (key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAcquisition(key)}
                  aria-pressed={acquisition === key}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    acquisition === key
                      ? "border-accent bg-accent text-white"
                      : "border-ink/10 bg-paper/60 text-ink/60 hover:border-accent/40"
                  }`}
                >
                  {ACQUISITION_LABELS[key]}
                </button>
              )
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium tracking-wide text-ink/50">
            形式
          </span>
          <div className="flex gap-2">
            {(Object.keys(FORMAT_LABELS) as BookFormat[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFormat(key)}
                aria-pressed={format === key}
                className={`flex-1 rounded-lg border px-2 py-2 text-xs transition-colors sm:text-sm ${
                  format === key
                    ? "border-accent bg-accent text-white"
                    : "border-ink/10 bg-paper/60 text-ink/60 hover:border-accent/40"
                }`}
              >
                {FORMAT_LABELS[key]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium tracking-wide text-ink/50">
          感想
        </span>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="読んで感じたことを書き留めておきましょう"
          rows={4}
          maxLength={2000}
          className="resize-none rounded-lg border border-ink/10 bg-paper/60 px-3.5 py-2.5 text-sm leading-relaxed text-ink outline-none transition-colors focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/15"
        />
      </label>

      <div className="flex flex-col gap-2.5 rounded-lg border border-ink/10 bg-paper/40 p-4">
        <span className="text-xs font-medium tracking-wide text-ink/50">
          評価（5点満点）
        </span>
        {RATING_CRITERIA.map(({ key, label }) => (
          <StarRow
            key={key}
            label={label}
            value={ratings[key]}
            onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
        <ToggleRow
          label="誰かにシェアした"
          checked={shared}
          onChange={setShared}
        />
        <ToggleRow
          label="永久保存したい内容"
          checked={keepForever}
          onChange={setKeepForever}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-4 py-2 text-sm text-ink/50 transition-colors hover:bg-ink/[0.04] hover:text-ink/70"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white shadow-sm shadow-accent/30 transition-all hover:bg-accent-light active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isEditing ? "更新する" : "記録する"}
        </button>
      </div>
    </form>
  );
}

function StarRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink/65">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${label} ${n}点`}
            aria-pressed={n <= value}
            className="p-0.5"
          >
            <svg
              viewBox="0 0 20 20"
              className={`h-5 w-5 transition-colors ${
                n <= value ? "fill-gold" : "fill-ink/15"
              }`}
            >
              <path d="M10 1.2 12.7 7l6.3.7-4.6 4.4 1.2 6.2L10 15.2l-5.6 3.1 1.2-6.2L1 7.7 7.3 7Z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className="flex items-center gap-2.5"
    >
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-ink/15"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0"
          }`}
        />
      </span>
      <span className="text-sm text-ink/70">{label}</span>
    </button>
  );
}
