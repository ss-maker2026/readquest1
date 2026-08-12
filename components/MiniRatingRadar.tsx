"use client";

import { RATING_CRITERIA, type BookRatings } from "@/lib/types";

type Props = {
  ratings?: BookRatings;
  size?: "md" | "lg";
};

const SIZE_CLASSES: Record<"md" | "lg", string> = {
  md: "h-28 w-28",
  lg: "h-52 w-52",
};

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 50;
const LEVELS = 5;
const AXIS_COUNT = RATING_CRITERIA.length;
const LABEL_OFFSET = 20;

function pointAt(index: number, r: number) {
  const angle = (-90 + index * (360 / AXIS_COUNT)) * (Math.PI / 180);
  return { x: CENTER + Math.cos(angle) * r, y: CENTER + Math.sin(angle) * r };
}

function pointForValue(index: number, value: number) {
  return pointAt(index, (RADIUS * value) / LEVELS);
}

function polygonPath(points: { x: number; y: number }[]) {
  return (
    points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z"
  );
}

export default function MiniRatingRadar({ ratings, size = "md" }: Props) {
  if (!ratings) return null;

  const overall =
    RATING_CRITERIA.reduce((sum, c) => sum + (ratings[c.key] ?? 0), 0) /
    AXIS_COUNT;

  return (
    <div className="flex shrink-0 flex-col items-center">
      <span className="text-xs font-semibold text-accent">
        平均 {overall.toFixed(1)}
      </span>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={SIZE_CLASSES[size]}>
        {Array.from({ length: LEVELS }, (_, i) => i + 1).map((level) => (
          <path
            key={level}
            d={polygonPath(
              RATING_CRITERIA.map((_, idx) => pointForValue(idx, level))
            )}
            fill="none"
            stroke="#565E63"
            strokeOpacity={0.16}
          />
        ))}
        {RATING_CRITERIA.map((c, idx) => {
          const p = pointForValue(idx, LEVELS);
          return (
            <line
              key={c.key}
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              stroke="#565E63"
              strokeOpacity={0.2}
            />
          );
        })}
        <path
          d={polygonPath(
            RATING_CRITERIA.map((c, idx) =>
              pointForValue(idx, ratings[c.key] ?? 0)
            )
          )}
          fill="#7FA593"
          fillOpacity={0.5}
          stroke="#5E8C77"
          strokeWidth={2}
        />
        {RATING_CRITERIA.map((c, idx) => {
          const p = pointAt(idx, RADIUS + LABEL_OFFSET);
          const angleDeg = -90 + idx * (360 / AXIS_COUNT);
          const cos = Math.cos((angleDeg * Math.PI) / 180);
          const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
          const lines =
            c.label.length > 5
              ? [
                  c.label.slice(0, Math.ceil(c.label.length / 2)),
                  c.label.slice(Math.ceil(c.label.length / 2)),
                ]
              : [c.label];
          return (
            <text
              key={c.key}
              x={p.x}
              y={p.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill="#565E63"
              fillOpacity={0.75}
              fontWeight={600}
              style={{ fontSize: 9 }}
            >
              {lines.map((line, i) => (
                <tspan
                  key={i}
                  x={p.x}
                  dy={i === 0 ? (lines.length > 1 ? -5 : 0) : 11}
                >
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
