"use client";

import { useEffect, useState } from "react";
import { Note, Scale } from "tonal";
import { playPianoNote } from "@/lib/sampler";

// react-piano 没自带类型，简单声明用到的部分
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComp = any;

let PianoLib: { Piano: AnyComp; MidiNumbers: AnyComp } | null = null;

export type ScalePianoProps = {
  tonic: string;
  scaleType: string;
  /** 显示几个八度，默认 2 */
  octaves?: number;
};

export default function ScalePiano({
  tonic,
  scaleType,
  octaves = 2,
}: ScalePianoProps) {
  const [ready, setReady] = useState(false);

  // 动态加载 react-piano（避免 SSR 报错）
  useEffect(() => {
    let mounted = true;
    Promise.all([
      import("react-piano"),
      // 注入样式
      import("react-piano/dist/styles.css" as never).catch(() => null),
    ]).then(([mod]) => {
      if (!mounted) return;
      PianoLib = mod as unknown as { Piano: AnyComp; MidiNumbers: AnyComp };
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready || !PianoLib) {
    return (
      <div className="text-gray-500 text-sm py-8 text-center">
        正在加载钢琴键盘…
      </div>
    );
  }

  const { Piano, MidiNumbers } = PianoLib;

  // 计算音阶里有哪些音级（pc）
  const scaleName = `${tonic} ${scaleType}`;
  const scale = Scale.get(scaleName);
  const scalePcs = new Set(scale.notes.map((n) => Note.get(n).pc));
  const tonicPc = Note.get(tonic).pc;

  // C4 ~ B5（默认 2 个八度）
  const firstNote = MidiNumbers.fromNote("c4");
  const lastNote = MidiNumbers.fromNote(`b${4 + octaves - 1}`);

  // 给在音阶内的键加视觉标记（react-piano 用 keyboardShortcuts/activeNotes 高亮）
  // 我们用 activeNotes 永久点亮"音阶内"的所有 MIDI 号
  const activeNotes: number[] = [];
  const rootNotes: number[] = [];
  for (let midi = firstNote; midi <= lastNote; midi++) {
    const name = Note.fromMidi(midi);
    const pc = Note.get(name).pc;
    if (scalePcs.has(pc)) activeNotes.push(midi);
    if (pc === tonicPc) rootNotes.push(midi);
  }

  const playNote = (midi: number) => {
    const name = Note.fromMidi(midi);
    playPianoNote(name).catch(() => {});
  };

  return (
    <div className="scale-piano">
      <Piano
        noteRange={{ first: firstNote, last: lastNote }}
        playNote={playNote}
        stopNote={() => {}}
        activeNotes={activeNotes}
        width={600}
        keyWidthToHeight={0.25}
        keyboardShortcuts={null}
        renderNoteLabel={({ midiNumber, isAccidental }: { midiNumber: number; isAccidental: boolean }) => {
          const pc = Note.get(Note.fromMidi(midiNumber)).pc;
          if (!scalePcs.has(pc)) return null;
          const isRoot = rootNotes.includes(midiNumber);
          return (
            <div
              style={{
                fontSize: 10,
                textAlign: "center",
                color: isAccidental ? "#fff" : "#0f172a",
                fontWeight: isRoot ? 700 : 500,
                marginTop: -16,
                pointerEvents: "none",
              }}
            >
              {isRoot ? `★${pc}` : pc}
            </div>
          );
        }}
      />
      <style jsx global>{`
        .scale-piano .ReactPiano__Key--active {
          background: #60a5fa !important;
        }
        .scale-piano .ReactPiano__Key--accidental.ReactPiano__Key--active {
          background: #2563eb !important;
        }
      `}</style>
    </div>
  );
}
