import type { AcquisitionMethod, BookFormat, BookLog } from "@/lib/types";

const CSV_COLUMNS = [
  "title",
  "author",
  "finishedDate",
  "acquisition",
  "format",
  "review",
  "shared",
  "keepForever",
  "rating",
  "pages",
  "startDate",
] as const;

function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function logsToCSV(logs: BookLog[]): string {
  const header = CSV_COLUMNS.join(",");
  const rows = logs.map((log) => {
    const fields = [
      log.title,
      log.author,
      log.finishedDate,
      log.acquisition,
      log.format,
      log.review,
      log.shared ? "true" : "false",
      log.keepForever ? "true" : "false",
      log.rating !== undefined ? String(log.rating) : "",
      log.pages !== undefined ? String(log.pages) : "",
      log.startDate ?? "",
    ];
    return fields.map(csvEscape).join(",");
  });
  return [header, ...rows].join("\r\n");
}

// ダブルクォートで囲まれたセル内のカンマ・改行・エスケープ済み引用符に対応した
// 簡易CSVパーサー。
function parseCSVRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (char === "\r") {
      i++;
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += char;
    i++;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""));
}

const ACQUISITION_VALUES: AcquisitionMethod[] = ["purchase", "rental"];
const FORMAT_VALUES: BookFormat[] = ["paper", "ebook", "audiobook"];

function clampRating(raw: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 3;
  return Math.min(5, Math.max(1, Math.round(n)));
}

export function csvToLogs(text: string): BookLog[] {
  const BOM = String.fromCharCode(0xfeff);
  const rows = parseCSVRows(text.startsWith(BOM) ? text.slice(1) : text);
  if (rows.length === 0) return [];

  const header = rows[0].map((h) => h.trim());
  const columnIndex = (name: string) => header.indexOf(name);
  const dataRows = rows.slice(1);

  return dataRows
    .map((cols, i): BookLog | null => {
      const get = (name: string) => {
        const idx = columnIndex(name);
        return idx >= 0 ? (cols[idx] ?? "") : "";
      };

      const title = get("title").trim();
      if (!title) return null;

      const acquisitionRaw = get("acquisition").trim() as AcquisitionMethod;
      const formatRaw = get("format").trim() as BookFormat;
      const finishedDateRaw = get("finishedDate").trim();

      const ratingRaw = get("rating").trim();
      const rating = ratingRaw !== "" ? clampRating(ratingRaw) : undefined;

      const pagesRaw = get("pages").trim();
      const pagesNum = Number(pagesRaw);
      const pages =
        pagesRaw !== "" && Number.isFinite(pagesNum) && pagesNum > 0
          ? Math.round(pagesNum)
          : undefined;

      const startDateRaw = get("startDate").trim();
      const startDate = /^\d{4}-\d{2}-\d{2}$/.test(startDateRaw)
        ? startDateRaw
        : undefined;

      return {
        id: crypto.randomUUID(),
        title,
        author: get("author").trim(),
        finishedDate: /^\d{4}-\d{2}-\d{2}$/.test(finishedDateRaw)
          ? finishedDateRaw
          : new Date().toISOString().slice(0, 10),
        acquisition: ACQUISITION_VALUES.includes(acquisitionRaw)
          ? acquisitionRaw
          : "purchase",
        format: FORMAT_VALUES.includes(formatRaw) ? formatRaw : "paper",
        review: get("review"),
        shared: get("shared").trim().toLowerCase() === "true",
        keepForever: get("keepForever").trim().toLowerCase() === "true",
        createdAt: Date.now() + i,
        rating,
        pages,
        startDate,
      };
    })
    .filter((log): log is BookLog => log !== null);
}

export function downloadLogsAsCSV(logs: BookLog[]) {
  const csv = logsToCSV(logs);
  const blob = new Blob([String.fromCharCode(0xfeff) + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reading-quest-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
