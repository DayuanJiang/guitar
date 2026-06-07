"use client";

import { useEffect, useRef } from "react";
import { Fretboard as FretboardJs, type Position } from "@moonwave99/fretboard.js";
import { Note, Scale } from "tonal";
import { playGuitarNote } from "@/lib/sampler";

const TUNING = ["E2", "A2", "D3", "G3", "B3", "E4"];
const FRET_COUNT = 12;
const FB_HEIGHT = 280;
const LEFT_PADDING = 40;
const STRING_LABELS = [...TUNING].reverse().map((n) => Note.get(n).pc);

type ScaleDot = Position & {
  noteName: string;
  pc: string;
  inScale: boolean;
  isRoot: boolean;
};

export type ScaleFretboardProps = {
  /** 主音的音级，例如 "A" 或 "C" */
  tonic: string;
  /** 音阶类型，例如 "minor pentatonic"、"major"、"natural minor" */
  scaleType: string;
  /** 高亮范围（fret 起止），默认 0-12 全显示 */
  fretRange?: [number, number];
};

export default function ScaleFretboard({
  tonic,
  scaleType,
  fretRange,
}: ScaleFretboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fbRef = useRef<FretboardJs | null>(null);

  // 初始化指板（只跑一次）
  useEffect(() => {
    if (!containerRef.current) return;
    const fb = new FretboardJs({
      el: containerRef.current,
      tuning: TUNING,
      fretCount: FRET_COUNT,
      width: 1100,
      height: FB_HEIGHT,
      leftPadding: LEFT_PADDING,
      dotSize: 32,
      dotStrokeColor: "transparent",
      dotStrokeWidth: 0,
      dotFill: "transparent",
      dotTextSize: 12,
      fretColor: "#4b5563",
      stringColor: "#9ca3af",
      nutColor: "#e5e7eb",
      middleFretColor: "#6b7280",
      fretNumbersColor: "#9ca3af",
      font: "ui-sans-serif, system-ui, sans-serif",
    });
    fb.render();
    fbRef.current = fb;

    // 弦名标注
    const svg = containerRef.current.querySelector("svg");
    const wrapper = svg?.querySelector("g.fretboard-wrapper");
    if (wrapper) {
      const NS = "http://www.w3.org/2000/svg";
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "string-labels");
      STRING_LABELS.forEach((label, i) => {
        const y = (FB_HEIGHT / (STRING_LABELS.length - 1)) * i;
        const t = document.createElementNS(NS, "text");
        t.setAttribute("x", "-12");
        t.setAttribute("y", String(y));
        t.setAttribute("text-anchor", "end");
        t.setAttribute("dominant-baseline", "central");
        t.setAttribute("font-size", "15");
        t.setAttribute("font-weight", "600");
        t.setAttribute("fill", "#e5e7eb");
        t.textContent = label;
        g.appendChild(t);
      });
      wrapper.appendChild(g);
    }

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
      fbRef.current = null;
    };
  }, []);

  // 根据音阶 + 主音重绘点位
  useEffect(() => {
    const fb = fbRef.current;
    if (!fb) return;

    // 用 tonal 计算当前调式的所有音级（pc）
    const scaleName = `${tonic} ${scaleType}`;
    const scale = Scale.get(scaleName);
    const scalePcs = new Set(scale.notes.map((n) => Note.get(n).pc));
    const tonicPc = Note.get(tonic).pc;
    const [minFret, maxFret] = fretRange ?? [0, FRET_COUNT];

    // 为每个 (string, fret) 计算是否在音阶内 + 是否是根音
    const openMidi = TUNING.map((n) => Note.midi(n) as number);
    const dots: ScaleDot[] = [];
    for (let stringNum = 1; stringNum <= 6; stringNum++) {
      const open = openMidi[6 - stringNum];
      for (let fret = 0; fret <= FRET_COUNT; fret++) {
        const midi = open + fret;
        const noteName = Note.fromMidi(midi);
        const pc = Note.get(noteName).pc;
        const inScale = scalePcs.has(pc) && fret >= minFret && fret <= maxFret;
        const isRoot = inScale && pc === tonicPc;
        dots.push({ string: stringNum, fret, noteName, pc, inScale, isRoot });
      }
    }

    fb.setDots(dots)
      .render()
      .style({
        // 不在音阶内：透明
        filter: (p: Position) => !(p as ScaleDot).inScale,
        fill: "transparent",
        text: "",
      })
      .style({
        // 音阶内但不是根音：浅蓝
        filter: (p: Position) => (p as ScaleDot).inScale && !(p as ScaleDot).isRoot,
        fill: "#60a5fa",
        text: (p: Position) => (p as ScaleDot).pc,
        fontFill: "#0f172a",
        fontSize: 12,
      })
      .style({
        // 根音（"家"）：橙色突出
        filter: (p: Position) => (p as ScaleDot).isRoot,
        fill: "#f97316",
        text: (p: Position) => (p as ScaleDot).pc,
        fontFill: "#0f172a",
        fontSize: 13,
      });

    // 给所有"在音阶内"的点加点击事件 → 出真吉他声
    const svgEl = containerRef.current?.querySelector("svg");
    if (svgEl) {
      const allDots = svgEl.querySelectorAll<SVGElement>(".dot");
      allDots.forEach((dotEl, idx) => {
        const dot = dots[idx];
        if (!dot || !dot.inScale) {
          dotEl.style.cursor = "default";
          dotEl.style.pointerEvents = "none";
          return;
        }
        dotEl.style.cursor = "pointer";
        dotEl.style.pointerEvents = "auto";
        dotEl.onclick = () => {
          playGuitarNote(dot.noteName).catch(() => {});
        };
      });
    }
  }, [tonic, scaleType, fretRange]);

  return (
    <div className="w-full overflow-x-auto">
      <div ref={containerRef} className="min-w-[800px]" />
    </div>
  );
}
