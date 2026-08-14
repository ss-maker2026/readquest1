"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// 現在はLv.1のイラストのみ試験的に用意。他レベル分ができたら追加する。
const LEVEL_FRAMES: Record<number, string[]> = {
  1: [
    "/characters/step-lv1-1.png",
    "/characters/step-lv1-2.png",
    "/characters/step-lv1-3.png",
    "/characters/step-lv1-4.png",
  ],
};

const FRAME_INTERVAL_MS = 220;

type Props = {
  level: number;
  className?: string;
};

// レベル表記・称号の横に配置する、足踏みするドット絵キャラクター（試験配置）。
export default function FootstepCharacter({ level, className }: Props) {
  const frames = LEVEL_FRAMES[level];
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (!frames) return;
    const id = setInterval(() => {
      setFrameIndex((i) => (i + 1) % frames.length);
    }, FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, [frames]);

  if (!frames) return null;

  return (
    <div className={`relative ${className ?? "h-16 w-9"}`}>
      <Image
        src={frames[frameIndex]}
        alt=""
        fill
        sizes="80px"
        className="object-contain object-bottom"
        priority={false}
      />
    </div>
  );
}
