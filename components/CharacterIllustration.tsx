"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { getLevelInfo } from "@/lib/levels";
import { CharacterAvatar } from "@/components/ReadingCharacter";

type Props = {
  level: number;
  className?: string;
  style?: CSSProperties;
};

// 装備帯ごとに用意した横長のキャラクターイラスト（本人＋装備品バッジ）を表示する。
// 万が一画像の読み込みに失敗した場合は、どのレベルでも必ず表示できる
// 手続き生成のドット絵（CharacterAvatar）に自動でフォールバックする。
export default function CharacterIllustration({ level, className, style }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const info = getLevelInfo(level);

  if (imageFailed || !info.characterImage) {
    return (
      <div
        style={style}
        className={
          className ??
          "flex items-center justify-center rounded-md border-[3px] border-glow-gold bg-gradient-to-b from-[var(--dungeon-base)] to-[var(--dungeon-glow3)] p-3 shadow-[inset_0_0_0_2px_#0A0E22]"
        }
      >
        <CharacterAvatar level={level} className="h-40 w-36" />
      </div>
    );
  }

  return (
    <div
      style={style}
      className={
        className ??
        "w-full overflow-hidden rounded-md border-[3px] border-glow-gold bg-gradient-to-b from-[var(--dungeon-base)] to-[var(--dungeon-glow3)] shadow-[inset_0_0_0_2px_#0A0E22]"
      }
    >
      <div className="relative aspect-[3/2] w-full">
        <Image
          src={info.characterImage}
          alt={`${info.title}（${info.equipmentName}）`}
          fill
          sizes="(min-width: 640px) 480px, 100vw"
          className="object-contain"
          onError={() => setImageFailed(true)}
          priority={false}
        />
      </div>
    </div>
  );
}
