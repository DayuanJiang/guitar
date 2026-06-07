"use client";

import { useEffect, useRef } from "react";
import { SVGuitarChord, ChordStyle, type Chord } from "svguitar";
import { playGuitarChord } from "@/lib/sampler";

export type ChordDiagramProps = {
  /** 和弦名 */
  name: string;
  /** svguitar 的 fingers 定义 */
  fingers: Chord["fingers"];
  /** 哪些弦不弹（"x"），默认无 */
  barres?: Chord["barres"];
  /** 第一品位置（默认 1，表示从第 1 品开始）*/
  position?: number;
  /** 点击或 hover 时播放的音（按从 6 弦到 1 弦的顺序）*/
  notes: (string | null)[];
};

export default function ChordDiagram({
  name,
  fingers,
  barres,
  position,
  notes,
}: ChordDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const chart = new SVGuitarChord(containerRef.current);
    chart
      .configure({
        title: name,
        style: ChordStyle.normal,
        strings: 6,
        frets: 4,
        position: position ?? 1,
        backgroundColor: "transparent",
        color: "#e5e7eb",
        titleFontSize: 36,
        titleColor: "#f3f4f6",
        fretColor: "#9ca3af",
        stringColor: "#9ca3af",
        fingerColor: "#f97316",
        fingerSize: 0.7,
        fingerTextColor: "#0f172a",
        fingerTextSize: 22,
      })
      .chord({ fingers, barres: barres ?? [] })
      .draw();
  }, [name, fingers, barres, position]);

  const handlePlay = () => {
    const playable = notes.filter((n): n is string => n !== null);
    playGuitarChord(playable).catch(() => {});
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      className="rounded-lg border border-gray-700 p-3 hover:border-orange-500 hover:bg-orange-500/5 transition-colors cursor-pointer"
      title={`点击播放 ${name}`}
    >
      <div ref={containerRef} className="flex items-center justify-center" />
      <div className="text-center text-xs text-gray-400 mt-1">点击播放</div>
    </button>
  );
}
