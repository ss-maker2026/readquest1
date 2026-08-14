"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// 装備帯（EQUIPMENT_TIERS）ごとに用意できたイラストだけをここに登録する。
// 現在はLv.1〜8（見習いの外套）とLv.9〜（革表紙の書）の2段階分のみ試験的に用意。
// 未登録の装備帯はfromを跨いでも表示を切り替えず、直近の下位帯のまま表示する。
const FOOTSTEP_TIERS: { from: number; frames: string[] }[] = [
  {
    from: 1,
    frames: [
      "/characters/step-lv1-1.png",
      "/characters/step-lv1-2.png",
      "/characters/step-lv1-3.png",
      "/characters/step-lv1-4.png",
    ],
  },
  {
    from: 9,
    frames: [
      "/characters/step-lv9-1.png",
      "/characters/step-lv9-2.png",
      "/characters/step-lv9-3.png",
      "/characters/step-lv9-4.png",
    ],
  },
];

function framesForLevel(level: number): string[] | null {
  let current: string[] | null = null;
  for (const tier of FOOTSTEP_TIERS) {
    if (level >= tier.from) current = tier.frames;
  }
  return current;
}

const FRAME_INTERVAL_MS = 220;

type Props = {
  level: number;
  className?: string;
};

// レベル表記・称号の横に配置する、足踏みするドット絵キャラクター（試験配置）。
export default function FootstepCharacter({ level, className }: Props) {
  const frames = framesForLevel(level);
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    setFrameIndex(0);
  }, [frames]);

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
