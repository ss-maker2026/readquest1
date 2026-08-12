"use client";

import { useRef, useState } from "react";
import type { BookLog } from "@/lib/types";
import { csvToLogs, downloadLogsAsCSV } from "@/lib/csv";

type Props = {
  logs: BookLog[];
  onImport: (logs: BookLog[]) => void;
};

export default function ImportExportBar({ logs, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 3000);
  };

  const handleExport = () => {
    if (logs.length === 0) {
      showMessage("記録がありません");
      return;
    }
    downloadLogsAsCSV(logs);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = csvToLogs(String(reader.result ?? ""));
        if (imported.length === 0) {
          showMessage("読み込める記録がありませんでした");
          return;
        }
        onImport(imported);
        showMessage(`${imported.length.toLocaleString()}件読み込みました`);
      } catch {
        showMessage("CSVの読み込みに失敗しました");
      }
    };
    reader.readAsText(file, "utf-8");
  };

  return (
    <div className="fixed right-3 top-3 z-20 flex flex-col items-end gap-1.5 sm:right-5 sm:top-5">
      <div className="flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-1 rounded-full border border-glow-gold/40 bg-black/35 px-2.5 py-1.5 text-[11px] text-glow-gold/60 shadow-sm backdrop-blur-sm transition-colors hover:border-glow-gold hover:bg-black/50 hover:text-glow-gold"
        >
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.7]">
            <path d="M10 3v9m0 0 3-3m-3 3-3-3M4 14v1.5A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5V14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          CSV書き出し
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 rounded-full border border-glow-gold/40 bg-black/35 px-2.5 py-1.5 text-[11px] text-glow-gold/60 shadow-sm backdrop-blur-sm transition-colors hover:border-glow-gold hover:bg-black/50 hover:text-glow-gold"
        >
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.7]">
            <path d="M10 12V3m0 0 3 3m-3-3-3 3M4 14v1.5A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5V14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          CSV読み込み
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {message && (
        <p className="animate-fade-in rounded-full bg-ink/80 px-3 py-1 text-[11px] text-white shadow-sm">
          {message}
        </p>
      )}
    </div>
  );
}
