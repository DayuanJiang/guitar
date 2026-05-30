"use client";

import { useEffect, useRef } from "react";
import { Fretboard as FretboardJs, type Position } from "@moonwave99/fretboard.js";
import { Note } from "tonal";
import type { NoteInfo } from "@/lib/music";

const FRET_COUNT = 15;
const FB_HEIGHT = 400;
const LEFT_PADDING = 56;
// fretboard.js 默认调弦，string 1 = 高音 E4，string 6 = 低音 E2。
const TUNING = ["E2", "A2", "D3", "G3", "B3", "E4"];
const OPEN_MIDI = TUNING.map((n) => Note.midi(n) as number);
const STRING_LABELS = [...TUNING].reverse().map((n) => Note.get(n).pc);

type DotPos = Position & {
  noteName: string;
  natural: boolean;
  highlighted: boolean;
  exact: boolean;
};

// 自然音 chroma（C=0, D=2, E=4, F=5, G=7, A=9, B=11）
const NATURAL_CHROMAS = new Set([0, 2, 4, 5, 7, 9, 11]);

function allDots(detectedMidi: number | null): DotPos[] {
  const detectedChroma = detectedMidi !== null ? ((detectedMidi % 12) + 12) % 12 : -1;
  const dots: DotPos[] = [];
  for (let stringNum = 1; stringNum <= 6; stringNum++) {
    const openMidi = OPEN_MIDI[6 - stringNum];
    for (let fret = 0; fret <= FRET_COUNT; fret++) {
      const midi = openMidi + fret;
      const noteName = Note.fromMidi(midi);
      const chroma = ((midi % 12) + 12) % 12;
      const natural = NATURAL_CHROMAS.has(chroma);
      const highlighted = detectedChroma >= 0 && chroma === detectedChroma;
      const exact = highlighted && midi === detectedMidi;
      dots.push({ string: stringNum, fret, noteName, natural, highlighted, exact });
    }
  }
  return dots;
}

export default function Fretboard({ note }: { note: NoteInfo | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fbRef = useRef<FretboardJs | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const fb = new FretboardJs({
      el: containerRef.current,
      tuning: TUNING,
      fretCount: FRET_COUNT,
      width: 1400,
      height: FB_HEIGHT,
      leftPadding: LEFT_PADDING,
      dotSize: 36,
      dotStrokeColor: "transparent",
      dotStrokeWidth: 0,
      dotFill: "transparent",
      dotTextSize: 13,
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
      g.setAttribute("font-family", "ui-sans-serif, system-ui, sans-serif");
      STRING_LABELS.forEach((label, i) => {
        const y = (FB_HEIGHT / (STRING_LABELS.length - 1)) * i;
        const t = document.createElementNS(NS, "text");
        t.setAttribute("x", "-16");
        t.setAttribute("y", String(y));
        t.setAttribute("text-anchor", "end");
        t.setAttribute("dominant-baseline", "central");
        t.setAttribute("font-size", "17");
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

  const noteName = note?.name ?? null;
  useEffect(() => {
    const fb = fbRef.current;
    if (!fb) return;
    const midi = noteName ? Note.midi(noteName) : null;
    const dots = allDots(midi ?? null);
    fb.setDots(dots)
      .render()
      .style({
        // 半音（升降号）：小字、暗灰色、不强调
        filter: (p: Position) => !(p as DotPos).natural,
        text: (p: Position) => (p as DotPos).noteName ?? "",
        fontSize: 10,
        fontFill: "#6b7280",
        fill: "transparent",
      })
      .style({
        // 自然音（A B C D E F G）：大字、亮白色、强调
        filter: (p: Position) => (p as DotPos).natural,
        text: (p: Position) => (p as DotPos).noteName ?? "",
        fontSize: 14,
        fontFill: "#f3f4f6",
        fill: "transparent",
      })
      .style({
        // 检测到的同音级：蓝色圆底
        filter: (p: Position) => (p as DotPos).highlighted === true,
        fill: "#60a5fa",
        fontFill: "#0f172a",
        fontSize: 13,
      })
      .style({
        // 精确八度：橙色圆底
        filter: (p: Position) => (p as DotPos).exact === true,
        fill: "#f97316",
        fontFill: "#0f172a",
        fontSize: 13,
      });
  }, [noteName]);

  return (
    <div className="w-full overflow-x-auto">
      <div ref={containerRef} className="min-w-[900px]" />
    </div>
  );
}
