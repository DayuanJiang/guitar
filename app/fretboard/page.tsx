"use client";

import { usePitch } from "@/hooks/usePitch";
import Controls from "@/components/Controls";
import Fretboard from "@/components/Fretboard";
import Waveform from "@/components/Waveform";
import Link from "next/link";

export default function FretboardPage() {
  const { note, mode, error, startMic, startTest, stop, getAnalyser } = usePitch();

  return (
    <main className="flex-1 flex flex-col items-center gap-10 px-4 py-10 bg-[#0a0a0a] text-gray-100">
      <header className="text-center">
        <h1 className="text-2xl font-bold">🎸 指板可视化</h1>
        <p className="mt-1 text-sm text-gray-400">
          实时检测音高，在指板上点亮所有同名音位置
        </p>
      </header>

      <Controls
        mode={mode}
        error={error}
        startMic={startMic}
        startTest={startTest}
        stop={stop}
      />

      <section className="w-full max-w-5xl">
        <h2 className="mb-3 text-center text-sm font-medium text-gray-400">
          标准调弦 · 橙色=同名同八度，蓝色=同名其它八度
        </h2>
        <Fretboard note={note} />
      </section>

      <Waveform getAnalyser={getAnalyser} active={mode !== "idle"} />

      <nav className="mt-auto pt-6">
        <Link
          href="/tuner"
          className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4"
        >
          ← 切换到调音器
        </Link>
      </nav>
    </main>
  );
}
