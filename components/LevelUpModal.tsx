"use client";

import { useEffect, useState } from "react";
import { titleForLevel } from "@/lib/character";
import { getLevelInfo } from "@/lib/levels";
import { CharacterAvatar } from "@/components/ReadingCharacter";

type Props = {
  fromLevel: number;
  toLevel: number;
  onContinue: () => void;
};

// レベルアップ専用の演出モーダル。
// 「LEVEL UP → 新しいキャラクター → 新しい装備」を、複数の画面遷移では
// なく1つのモーダル内の段階的なフェードインで軽く表現する。
// いつでもクリック（背景 or ボタン）で閉じられ、ユーザーの操作を妨げない。
export default function LevelUpModal({ fromLevel, toLevel, onContinue }: Props) {
  const [barFilled, setBarFilled] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setBarFilled(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  const fromTitle = titleForLevel(fromLevel);
  const toTitle = titleForLevel(toLevel);
  const titleChanged = fromTitle !== toTitle;

  const fromEquipment = getLevelInfo(fromLevel).equipmentName;
  const toEquipment = getLevelInfo(toLevel).equipmentName;
  const equipmentChanged = fromEquipment !== toEquipment;

  const levelsGained = toLevel - fromLevel;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
      onClick={onContinue}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col items-center gap-2 rounded-2xl border-2 border-glow-gold bg-gradient-to-b from-[var(--dungeon-base)] to-[var(--dungeon-glow3)] px-6 py-8 text-center shadow-2xl"
      >
        <p
          className="animate-fade-in text-2xl font-bold tracking-wide text-glow-gold [animation-fill-mode:backwards]"
          style={{ animationDelay: "0ms" }}
        >
          LEVEL UP!
        </p>

        <div
          className="animate-fade-in flex items-center gap-2 text-xl font-bold text-glow-green [animation-fill-mode:backwards]"
          style={{ animationDelay: "120ms" }}
        >
          <span>Lv.{fromLevel}</span>
          <span className="text-glow-gold/60">→</span>
          <span>Lv.{toLevel}</span>
        </div>

        {levelsGained > 1 && (
          <p
            className="animate-fade-in text-xs text-glow-gold/70 [animation-fill-mode:backwards]"
            style={{ animationDelay: "180ms" }}
          >
            {levelsGained}レベルアップ！
          </p>
        )}

        <p
          className="animate-fade-in text-sm text-glow-gold/80 [animation-fill-mode:backwards]"
          style={{ animationDelay: "220ms" }}
        >
          {titleChanged ? `${fromTitle} → ${toTitle}` : toTitle}
        </p>

        <div
          className="mt-1 w-full max-w-[200px] animate-fade-in [animation-fill-mode:backwards]"
          style={{ animationDelay: "300ms" }}
        >
          <div className="h-2.5 w-full overflow-hidden rounded-full border border-glow-gold/25 bg-black/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-glow-green to-glow-gold transition-all duration-700 ease-out"
              style={{ width: barFilled ? "100%" : "10%" }}
            />
          </div>
        </div>

        <div
          className="animate-fade-in mt-2 rounded-md border-[3px] border-glow-gold bg-gradient-to-b from-[var(--dungeon-base)] to-[var(--dungeon-glow3)] p-3 shadow-[inset_0_0_0_2px_#0A0E22] [animation-fill-mode:backwards]"
          style={{ animationDelay: "450ms" }}
        >
          <CharacterAvatar level={toLevel} className="h-40 w-36" />
        </div>

        {equipmentChanged && (
          <div
            className="animate-fade-in mt-1 flex flex-col items-center gap-0.5 [animation-fill-mode:backwards]"
            style={{ animationDelay: "700ms" }}
          >
            <p className="text-xs font-semibold text-glow-gold/70">
              ✨ 新しい装備を獲得！
            </p>
            <p className="text-sm font-medium text-glow-gold">「{toEquipment}」</p>
          </div>
        )}

        <button
          type="button"
          onClick={onContinue}
          className="mt-3 w-full rounded-full bg-glow-gold py-2.5 text-sm font-bold text-[#241F1A] shadow-sm transition-transform active:scale-95 hover:brightness-110"
        >
          冒険を続ける
        </button>
      </div>
    </div>
  );
}
