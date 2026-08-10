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
};

export const ACQUISITION_LABELS: Record<AcquisitionMethod, string> = {
  purchase: "購入",
  rental: "レンタル",
};

export const FORMAT_LABELS: Record<BookFormat, string> = {
  paper: "紙媒体",
  ebook: "電子書籍",
  audiobook: "オーディオブック",
};
