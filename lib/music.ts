import { Note } from "tonal";

export type NoteInfo = {
  name: string; // 含八度，如 "E2"
  pc: string; // 音级（无八度），如 "E"
  octave: number;
  chroma: number; // 0~11，用于同音级匹配
  cents: number; // 与最近音的偏差，裁剪到 [-50, 50]
  freq: number; // 原始检测频率
};

// 频率 → 最近音名 + 音分偏差。全部交给 tonal，不手写 log2 公式（除了 cents）。
export function freqToNote(freq: number): NoteInfo | null {
  const name = Note.fromFreq(freq);
  if (!name) return null;
  const exact = Note.freq(name);
  const info = Note.get(name);
  if (!exact || info.empty || info.oct == null || info.chroma == null) {
    return null;
  }
  let cents = 1200 * Math.log2(freq / exact);
  cents = Math.max(-50, Math.min(50, cents));
  return {
    name,
    pc: info.pc,
    octave: info.oct,
    chroma: info.chroma,
    cents,
    freq,
  };
}
