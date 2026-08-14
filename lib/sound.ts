// Web Audio APIでその場で生成する効果音。
// 外部の音声ファイルを一切使わないため、追加の依存パッケージやアセットが不要。
// ドット絵・レトロRPGの世界観に合わせ、8bit風のチップチューンサウンドにしている。

const SOUND_MUTED_KEY = "reading-log-app:soundMuted";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

export function isSoundMuted(): boolean {
  try {
    return window.localStorage.getItem(SOUND_MUTED_KEY) === "true";
  } catch {
    return false;
  }
}

export function setSoundMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(SOUND_MUTED_KEY, muted ? "true" : "false");
  } catch {
    // localStorageが使えない環境では何もしない（クラッシュさせない）。
  }
}

type Note = {
  // 周波数（Hz）。
  freq: number;
  // 再生開始タイミング（秒、シーケンス先頭からのオフセット）。
  start: number;
  // 音の長さ（秒）。
  duration: number;
  // ピーク音量（0〜1）。
  gain?: number;
};

function playNotes(notes: Note[], type: OscillatorType) {
  if (isSoundMuted()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      // ブラウザの自動再生ポリシー対策。ユーザー操作（クリック）由来の
      // 呼び出しなので、ここでresumeしても問題なく再生できる。
      void ctx.resume();
    }

    const now = ctx.currentTime;
    for (const note of notes) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.value = note.freq;

      const peakGain = note.gain ?? 0.18;
      const startAt = now + note.start;
      const endAt = startAt + note.duration;

      // 短いアタック→減衰のエンベロープで、クリック音のような硬さを避ける。
      gainNode.gain.setValueAtTime(0, startAt);
      gainNode.gain.linearRampToValueAtTime(peakGain, startAt + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, endAt);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start(startAt);
      oscillator.stop(endAt + 0.02);
    }
  } catch {
    // 効果音は演出の一部であり、失敗してもアプリの他機能には影響させない。
  }
}

// クエストクリア（レベルアップを伴わない読了）用の、軽く弾むような短い一音。
export function playQuestClearSound(): void {
  playNotes(
    [
      { freq: 659.25, start: 0, duration: 0.09 }, // E5
      { freq: 987.77, start: 0.07, duration: 0.16 }, // B5
    ],
    "triangle"
  );
}

// レベルアップ用の、上昇する4音のファンファーレ。
export function playLevelUpSound(): void {
  playNotes(
    [
      { freq: 523.25, start: 0, duration: 0.12, gain: 0.16 }, // C5
      { freq: 659.25, start: 0.1, duration: 0.12, gain: 0.16 }, // E5
      { freq: 783.99, start: 0.2, duration: 0.12, gain: 0.16 }, // G5
      { freq: 1046.5, start: 0.3, duration: 0.35, gain: 0.2 }, // C6（伸ばして締める）
    ],
    "square"
  );
}
