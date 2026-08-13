"use client";

import { useEffect, useState } from "react";
import { averageRating, type BookLog } from "@/lib/types";
import { LOGS_STORAGE_KEY, loadStoredLogs } from "@/lib/storage";
import ReadingLogForm, { type NewBookLog } from "@/components/ReadingLogForm";
import ReadingLogItem from "@/components/ReadingLogItem";
import ReadingCharacter from "@/components/ReadingCharacter";
import ImportExportBar from "@/components/ImportExportBar";
import QuestClearToast from "@/components/QuestClearToast";
import LevelUpModal from "@/components/LevelUpModal";
import {
  MAX_LOGS,
  MAX_LEVEL,
  LEVEL_THRESHOLDS,
  getCharacterProgress,
  applyDungeonZoneStyles,
} from "@/lib/character";
import { BASE_XP_PER_BOOK } from "@/lib/xp";

type FormState = { mode: "create" } | { mode: "edit"; log: BookLog } | null;
type SortOption = "date-desc" | "date-asc" | "rating-desc" | "rating-asc";

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

export default function ReadingLogApp() {
  const [logs, setLogs] = useState<BookLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formState, setFormState] = useState<FormState>(null);
  const [previewLevel, setPreviewLevel] = useState<number | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [questClear, setQuestClear] = useState<{
    title: string;
    xpGained: number;
  } | null>(null);
  const [levelUp, setLevelUp] = useState<{
    fromLevel: number;
    toLevel: number;
  } | null>(null);

  useEffect(() => {
    // 旧バージョンのデータや欠損フィールドがあっても安全に読み込めるよう、
    // 生データはそのまま信頼せずnormalizeBookLogsを通してから利用する。
    setLogs(loadStoredLogs());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  }, [logs, isLoaded]);

  // previewLevel が指定されている間は、実際の記録数ではなくプレビュー用の
  // 冊数（そのレベルの到達しきい値）でキャラクター・背景を表示する。
  const previewCount =
    previewLevel !== null ? LEVEL_THRESHOLDS[previewLevel - 1] : null;
  const effectiveCount = previewCount ?? logs.length;
  const level = getCharacterProgress(effectiveCount).level;

  useEffect(() => {
    applyDungeonZoneStyles(level);
  }, [level]);

  useEffect(() => {
    if (!highlightId) return;
    const timer = window.setTimeout(() => setHighlightId(null), 2000);
    return () => window.clearTimeout(timer);
  }, [highlightId]);

  useEffect(() => {
    if (!questClear) return;
    const timer = window.setTimeout(() => setQuestClear(null), 3800);
    return () => window.clearTimeout(timer);
  }, [questClear]);

  const addLog = (entry: NewBookLog) => {
    const newLog: BookLog = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...entry,
    };
    // クエストクリア演出用に、追加の前後でレベルが変わったかどうかを判定する。
    // この判定はメモリ上の一時的な値のみで行い、どこにも保存しないため、
    // リロードしても同じ演出が再び発生することはない。
    const fromLevel = getCharacterProgress(logs.length).level;
    const toLevel = getCharacterProgress(logs.length + 1).level;
    setLogs((prev) => sortLogs([newLog, ...prev]));
    setFormState(null);
    setHighlightId(newLog.id);

    if (toLevel > fromLevel) {
      // レベルアップした場合は、専用の演出モーダルを優先して見せる
      // （通常のクエストクリアトーストは出さない）。
      setLevelUp({ fromLevel, toLevel });
    } else {
      setQuestClear({ title: newLog.title, xpGained: BASE_XP_PER_BOOK });
    }
  };

  const updateLog = (id: string, entry: NewBookLog) => {
    setLogs((prev) =>
      sortLogs(prev.map((log) => (log.id === id ? { ...log, ...entry } : log)))
    );
    setFormState(null);
    setHighlightId(id);
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

  const displayedLogs = getDisplayedLogs(logs, sortOption, minRating);

  return (
    <div className="space-y-5">
      {questClear && (
        <QuestClearToast
          title={questClear.title}
          xpGained={questClear.xpGained}
        />
      )}

      {levelUp && (
        <LevelUpModal
          fromLevel={levelUp.fromLevel}
          toLevel={levelUp.toLevel}
          onContinue={() => setLevelUp(null)}
        />
      )}

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

      <ReadingCharacter
        count={effectiveCount}
        logs={logs}
        onStartQuest={() => setFormState({ mode: "create" })}
        isAtMax={logs.length >= MAX_LOGS}
        formOpen={formState !== null}
      />

      {formState && (
        <ReadingLogForm
          initial={formState.mode === "edit" ? formState.log : undefined}
          onSubmit={(entry) =>
            formState.mode === "edit"
              ? updateLog(formState.log.id, entry)
              : addLog(entry)
          }
          onCancel={() => setFormState(null)}
        />
      )}

      {!formState && (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDataManagement((v) => !v)}
            className="text-xs text-glow-gold/40 underline decoration-dotted underline-offset-4 transition-colors hover:text-glow-gold/70"
          >
            {showDataManagement
              ? "設定を閉じる"
              : "⚙ 設定（CSV書き出し・読み込み）"}
          </button>
          {showDataManagement && (
            <div className="flex w-full justify-center rounded-2xl border border-dashed border-glow-gold/30 bg-black/25 px-4 py-3">
              <ImportExportBar logs={logs} onImport={importLogs} />
            </div>
          )}
        </div>
      )}

      {logs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-glow-gold/30 bg-black/20 py-12 text-center">
          <p className="text-sm font-medium text-glow-gold/60">
            まだ冒険の記録がありません
          </p>
          <p className="mt-1 text-xs text-glow-gold/40">
            最初の一冊から冒険を始めよう！
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-dashed border-glow-gold/40 bg-black/35 px-4 py-3 text-xs">
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
                  onEdit={(target) => setFormState({ mode: "edit", log: target })}
                  onDelete={deleteLog}
                  highlighted={log.id === highlightId}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
