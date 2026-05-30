"use client";

import { usePitch } from "@/hooks/usePitch";
import Controls from "@/components/Controls";
import Tuner from "@/components/Tuner";
import Link from "next/link";

export default function TunerPage() {
  const { note, mode, error, startMic, startTest, stop } = usePitch();

  return (
    <main className="flex-1 flex flex-col items-center gap-10 px-4 py-10 bg-[#0a0a0a] text-gray-100">
      <header className="text-center">
        <h1 className="text-2xl font-bold">🎵 调音器</h1>
        <p className="mt-1 text-sm text-gray-400">
          实时检测音高，显示音名与音准偏差
        </p>
      </header>

      <Controls
        mode={mode}
        error={error}
        startMic={startMic}
        startTest={startTest}
        stop={stop}
      />

      <Tuner note={note} />

      <nav className="mt-auto pt-6">
        <Link
          href="/fretboard"
          className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4"
        >
          切换到指板可视化 →
        </Link>
      </nav>
    </main>
  );
}
