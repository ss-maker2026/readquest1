"use client";

import { useEffect, useState } from "react";
import type { BookLog } from "@/lib/types";
import ReadingLogForm, { type NewBookLog } from "@/components/ReadingLogForm";
import ReadingLogItem from "@/components/ReadingLogItem";
import ReadingCharacter from "@/components/ReadingCharacter";
import ImportExportBar from "@/components/ImportExportBar";
import {
  MAX_LOGS,
  MAX_LEVEL,
  LEVEL_THRESHOLDS,
  getCharacterProgress,
  getDungeonZone,
} from "@/lib/character";

const STORAGE_KEY = "reading-log-app:logs";

type FormState = { mode: "create" } | { mode: "edit"; log: BookLog } | null;

const sortLogs = (list: BookLog[]) =>
  [...list].sort((a, b) =>
    b.finishedDate === a.finishedDate
      ? b.createdAt - a.createdAt
      : b.finishedDate.localeCompare(a.finishedDate)
  );

export default function ReadingLogApp() {
  const [logs, setLogs] = useState<BookLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formState, setFormState] = useState<FormState>(null);
  const [previewLevel, setPreviewLevel] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setLogs(JSON.parse(stored));
    } catch {
      // localStorageが使えない環境では初期状態のまま
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs, isLoaded]);

  // previewLevel が指定されている間は、実際の記録数ではなくプレビュー用の
  // 冊数（そのレベルの到達しきい値）でキャラクター・背景を表示する。
  const previewCount =
    previewLevel !== null ? LEVEL_THRESHOLDS[previewLevel - 1] : null;
  const effectiveCount = previewCount ?? logs.length;
  const level = getCharacterProgress(effectiveCount).level;

  useEffect(() => {
    // レベル（ダンジョンの深さ）に応じて、ページ全体の背景色を書き換える。
    const zone = getDungeonZone(level);
    const root = document.documentElement.style;
    root.setProperty("--dungeon-base", zone.base);
    root.setProperty("--dungeon-glow1", zone.glow1);
    root.setProperty("--dungeon-glow2", zone.glow2);
    root.setProperty("--dungeon-glow3", zone.glow3);
    root.setProperty("--mist-rgb", zone.textRgb);
    root.setProperty("--glow-green-rgb", zone.accentRgb);
    root.setProperty("--glow-gold-rgb", zone.goldRgb);
  }, [level]);

  const addLog = (entry: NewBookLog) => {
    const newLog: BookLog = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...entry,
    };
    setLogs((prev) => sortLogs([newLog, ...prev]));
    setFormState(null);
  };

  const updateLog = (id: string, entry: NewBookLog) => {
    setLogs((prev) =>
      sortLogs(prev.map((log) => (log.id === id ? { ...log, ...entry } : log)))
    );
    setFormState(null);
  };

  const deleteLog = (id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
    setFormState((prev) =>
      prev?.mode === "edit" && prev.log.id === id ? null : prev
    );
  };

  const importLogs = (imported: BookLog[]) => {
    setLogs((prev) => {
      const remaining = Math.max(0, MAX_LOGS - prev.length);
      return sortLogs([...imported.slice(0, remaining), ...prev]);
    });
  };

  return (
    <div className="space-y-5">
      <ImportExportBar logs={logs} onImport={importLogs} />

      {process.env.NODE_ENV !== "production" && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-glow-gold/40 bg-black/35 px-4 py-3 text-xs text-glow-gold/60">
          <span className="font-semibold text-accent">レベルプレビュー</span>
          <input
            type="range"
            min={1}
            max={MAX_LEVEL}
            value={previewLevel ?? level}
            onChange={(e) => setPreviewLevel(Number(e.target.value))}
            className="min-w-[140px] flex-1 accent-accent"
          />
          <span className="w-14 shrink-0 tabular-nums">Lv.{previewLevel ?? level}</span>
          {previewLevel !== null && (
            <button
              type="button"
              onClick={() => setPreviewLevel(null)}
              className="rounded-full border border-glow-gold/30 px-2.5 py-1 text-[11px] text-glow-gold/50 hover:border-glow-gold hover:text-glow-gold"
            >
              実際の記録に戻す
            </button>
          )}
        </div>
      )}

      <ReadingCharacter count={effectiveCount} />

      {formState ? (
        <ReadingLogForm
          initial={formState.mode === "edit" ? formState.log : undefined}
          onSubmit={(entry) =>
            formState.mode === "edit"
              ? updateLog(formState.log.id, entry)
              : addLog(entry)
          }
          onCancel={() => setFormState(null)}
        />
      ) : logs.length >= MAX_LOGS ? (
        <p className="rounded-2xl border border-dashed border-glow-gold/40 bg-black/35 py-4 text-center text-sm font-medium text-glow-gold/40">
          上限（{MAX_LOGS.toLocaleString()}冊）に達しました
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setFormState({ mode: "create" })}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-glow-gold/40 bg-black/35 py-4 text-sm font-medium text-glow-gold/50 transition-colors hover:border-glow-gold hover:bg-black/50 hover:text-glow-gold"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[2]">
            <path d="M10 4v12M4 10h12" strokeLinecap="round" />
          </svg>
          新しい記録を追加
        </button>
      )}

      {logs.length === 0 ? (
        <p className="py-16 text-center text-sm text-glow-gold/40">
          まだ記録がありません
        </p>
      ) : (
        <ul className="space-y-4">
          {logs.map((log) => (
            <ReadingLogItem
              key={log.id}
              log={log}
              onEdit={(target) => setFormState({ mode: "edit", log: target })}
              onDelete={deleteLog}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
