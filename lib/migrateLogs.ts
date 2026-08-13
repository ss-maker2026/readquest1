import {
  RATING_CRITERIA,
  defaultRatings,
  type AcquisitionMethod,
  type BookFormat,
  type BookLog,
  type BookRatings,
} from "@/lib/types";

const ACQUISITION_VALUES: AcquisitionMethod[] = ["purchase", "rental"];
const FORMAT_VALUES: BookFormat[] = ["paper", "ebook", "audiobook"];

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

// 保存されていた評価オブジェクトを補正する。欠けている軸はdefaultRatings()の
// 値(3)で補い、値が不正・範囲外の軸は1〜5にクランプする。
// 評価データが一つも見つからない場合はundefined（未評価）を返す。
function normalizeRatings(raw: unknown): BookRatings | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const source = raw as Record<string, unknown>;
  const hasAny = RATING_CRITERIA.some(
    (c) => typeof source[c.key] === "number" && Number.isFinite(source[c.key])
  );
  if (!hasAny) return undefined;

  const result = defaultRatings();
  for (const c of RATING_CRITERIA) {
    const v = source[c.key];
    if (typeof v === "number" && Number.isFinite(v)) {
      result[c.key] = Math.min(5, Math.max(1, Math.round(v)));
    }
  }
  return result;
}

// 保存済み・インポートされた形状不明のデータ1件を、現行のBookLog型へ
// 安全に変換する。旧バージョンで保存されたデータや、将来追加された
// 未知のフィールドが含まれていても壊れないよう、フィールドごとに
// 型チェックとデフォルト値の補完を行う。
// タイトルが無いなど、本として成立しないデータはnullを返して除外する。
export function normalizeBookLog(raw: unknown): BookLog | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;

  const title = typeof source.title === "string" ? source.title.trim() : "";
  if (!title) return null;

  const acquisition = ACQUISITION_VALUES.includes(
    source.acquisition as AcquisitionMethod
  )
    ? (source.acquisition as AcquisitionMethod)
    : "purchase";
  const format = FORMAT_VALUES.includes(source.format as BookFormat)
    ? (source.format as BookFormat)
    : "paper";

  return {
    id:
      typeof source.id === "string" && source.id
        ? source.id
        : crypto.randomUUID(),
    title,
    author: typeof source.author === "string" ? source.author : "",
    finishedDate: isValidDate(source.finishedDate)
      ? source.finishedDate
      : new Date().toISOString().slice(0, 10),
    acquisition,
    format,
    review: typeof source.review === "string" ? source.review : "",
    shared: source.shared === true,
    keepForever: source.keepForever === true,
    createdAt:
      typeof source.createdAt === "number" && Number.isFinite(source.createdAt)
        ? source.createdAt
        : Date.now(),
    ratings: normalizeRatings(source.ratings),
    pages:
      typeof source.pages === "number" &&
      Number.isFinite(source.pages) &&
      source.pages > 0
        ? Math.round(source.pages)
        : undefined,
    startDate: isValidDate(source.startDate) ? source.startDate : undefined,
  };
}

// localStorageから読み込んだ配列全体を安全に変換する。
// 配列でない・壊れている要素はスキップし、有効な記録だけを返す。
export function normalizeBookLogs(raw: unknown): BookLog[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeBookLog(item))
    .filter((log): log is BookLog => log !== null);
}
