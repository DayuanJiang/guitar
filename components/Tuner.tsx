"use client";

import type { NoteInfo } from "@/lib/music";

const IN_TUNE_CENTS = 5;

export default function Tuner({ note }: { note: NoteInfo | null }) {
  const cents = note?.cents ?? 0;
  const inTune = note != null && Math.abs(cents) < IN_TUNE_CENTS;
  // cents ∈ [-50, 50] → 指针位置 0%~100%
  const pointerLeft = ((cents + 50) / 100) * 100;

  const accent = note == null ? "#6b7280" : inTune ? "#22c55e" : "#f59e0b";

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 大号音名 */}
      <div className="flex items-end gap-2">
        <span
          className="text-[120px] leading-none font-bold tabular-nums transition-colors"
          style={{ color: accent }}
        >
          {note ? note.pc : "—"}
        </span>
        {note && (
          <span className="text-4xl font-semibold text-gray-400 mb-3">
            {note.octave}
          </span>
        )}
      </div>

      {/* 频率 + 音分读数 */}
      <div className="text-sm text-gray-400 tabular-nums h-5">
        {note
          ? `${note.freq.toFixed(1)} Hz · ${cents > 0 ? "+" : ""}${cents.toFixed(
              0
            )} cents`
          : "等待输入…"}
      </div>

      {/* 调音表 */}
      <div className="w-full max-w-md">
        <div className="relative h-12 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden">
          {/* 中央基准线 */}
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-green-500/60" />
          {/* 刻度 */}
          {[-50, -25, 0, 25, 50].map((t) => (
            <div
              key={t}
              className="absolute top-0 h-full flex items-start pt-1"
              style={{ left: `${((t + 50) / 100) * 100}%` }}
            >
              <span className="-translate-x-1/2 text-[10px] text-gray-500 tabular-nums">
                {t > 0 ? `+${t}` : t}
              </span>
            </div>
          ))}
          {/* 指针 */}
          {note && (
            <div
              className="absolute top-0 h-full w-1 -translate-x-1/2 transition-all duration-75"
              style={{ left: `${pointerLeft}%`, backgroundColor: accent }}
            />
          )}
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>♭ 偏低</span>
          <span style={{ color: inTune ? "#22c55e" : undefined }}>
            {inTune ? "✓ 准了" : "♮"}
          </span>
          <span>偏高 ♯</span>
        </div>
      </div>
    </div>
  );
}
