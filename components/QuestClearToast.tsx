"use client";

type Props = {
  title: string;
  xpGained: number;
};

// レベルアップを伴わないクエストクリア時の軽量トースト。
// レベルアップした場合はLevelUpModalの方が表示されるため、
// こちらは表示されない（ReadingLogApp側で出し分けている）。
export default function QuestClearToast({ title, xpGained }: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <div className="animate-fade-in pointer-events-auto flex max-w-xs flex-col items-center gap-1 rounded-2xl border-2 border-glow-gold bg-black/90 px-6 py-4 text-center shadow-lg backdrop-blur-sm">
        <p className="text-lg font-bold text-glow-gold">クエストクリア！</p>
        <p className="truncate text-sm text-glow-gold/80">
          「{title}」を読了しました
        </p>
        <p className="text-base font-semibold text-glow-green">
          +{xpGained} XP
        </p>
      </div>
    </div>
  );
}
