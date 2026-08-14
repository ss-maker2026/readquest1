export type AcquisitionMethod = "purchase" | "rental";
export type BookFormat = "paper" | "ebook" | "audiobook";

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
  // 5点満点の評価。未評価はundefined。
  rating?: number;
  // 読書クエストの詳細情報（任意項目、既存データとの互換性のため後から追加）。
  pages?: number;
  startDate?: string;
};

export const ACQUISITION_LABELS: Record<AcquisitionMethod, string> = {
  purchase: "購入",
  rental: "レンタル",
};

export const FORMAT_LABELS: Record<BookFormat, string> = {
  paper: "紙",
  ebook: "電子書籍",
  audiobook: "オーディオブック",
};
