export type AcquisitionMethod = "purchase" | "rental";
export type BookFormat = "paper" | "ebook" | "audiobook";

// 感想のあとに5点満点で採点する6つの評価軸。
export const RATING_CRITERIA = [
  { key: "tempo", label: "テンポ" },
  { key: "immersion", label: "没入感" },
  { key: "impact", label: "インパクト" },
  { key: "learning", label: "学び" },
  { key: "excitement", label: "ワクワク度" },
  { key: "emotionalImpact", label: "心を揺さぶる度" },
] as const;

export type RatingKey = (typeof RATING_CRITERIA)[number]["key"];
export type BookRatings = Record<RatingKey, number>;

export function defaultRatings(): BookRatings {
  return {
    tempo: 3,
    immersion: 3,
    impact: 3,
    learning: 3,
    excitement: 3,
    emotionalImpact: 3,
  };
}

export type BookLog = {
  id: string;
  title: string;
  author: string;
  finishedDate: string;
  acquisition: AcquisitionMethod;
  format: BookFormat;
  review: string;
  shared: boolean;
  keepForever: boolean;
  createdAt: number;
  // 既存データとの互換性のため任意項目にしている。
  ratings?: BookRatings;
};

// 6軸評価の平均点。未評価の場合はnullを返す。
export function averageRating(ratings?: BookRatings): number | null {
  if (!ratings) return null;
  const sum = RATING_CRITERIA.reduce((acc, c) => acc + (ratings[c.key] ?? 0), 0);
  return sum / RATING_CRITERIA.length;
}

export const ACQUISITION_LABELS: Record<AcquisitionMethod, string> = {
  purchase: "購入",
  rental: "レンタル",
};

export const FORMAT_LABELS: Record<BookFormat, string> = {
  paper: "紙",
  ebook: "電子書籍",
  audiobook: "オーディオブック",
};
