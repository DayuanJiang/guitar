"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ScaleFretboard from "@/components/ScaleFretboard";
import ScalePiano from "@/components/ScalePiano";
import ChordDiagram from "@/components/ChordDiagram";
import { playGuitarSequence, preloadInstruments } from "@/lib/sampler";
import { Note, Scale } from "tonal";

type ToneOption = {
  tonic: string;
  scaleType: string;
  label: string;
  color: string;
};

const OPTIONS: ToneOption[] = [
  { tonic: "C", scaleType: "major", label: "C 大调（明亮）", color: "text-amber-400" },
  { tonic: "A", scaleType: "natural minor", label: "A 自然小调（忧郁）", color: "text-blue-400" },
];

// 6 个开放和弦的指法（svguitar 格式：[string, fret] from string-1 = 高音 e）
// fingers = [[弦号(1=高音e), 品(0=空弦, 'x'=不弹), 可选 finger 号]]
const CHORDS = [
  {
    name: "Am",
    fingers: [
      [6, "x"],
      [5, 0],
      [4, 2, "2"],
      [3, 2, "3"],
      [2, 1, "1"],
      [1, 0],
    ],
    notes: [null, "A2", "E3", "A3", "C4", "E4"], // 6 -> 1 弦
  },
  {
    name: "C",
    fingers: [
      [6, "x"],
      [5, 3, "3"],
      [4, 2, "2"],
      [3, 0],
      [2, 1, "1"],
      [1, 0],
    ],
    notes: [null, "C3", "E3", "G3", "C4", "E4"],
  },
  {
    name: "Dm",
    fingers: [
      [6, "x"],
      [5, "x"],
      [4, 0],
      [3, 2, "2"],
      [2, 3, "3"],
      [1, 1, "1"],
    ],
    notes: [null, null, "D3", "A3", "D4", "F4"],
  },
  {
    name: "Em",
    fingers: [
      [6, 0],
      [5, 2, "2"],
      [4, 2, "3"],
      [3, 0],
      [2, 0],
      [1, 0],
    ],
    notes: ["E2", "B2", "E3", "G3", "B3", "E4"],
  },
  {
    name: "F",
    fingers: [
      [6, 1, "1"],
      [5, 3, "3"],
      [4, 3, "4"],
      [3, 2, "2"],
      [2, 1, "1"],
      [1, 1, "1"],
    ],
    barres: [{ fromString: 6, toString: 1, fret: 1 }],
    notes: ["F2", "C3", "F3", "A3", "C4", "F4"],
  },
  {
    name: "G",
    fingers: [
      [6, 3, "2"],
      [5, 2, "1"],
      [4, 0],
      [3, 0],
      [2, 0],
      [1, 3, "3"],
    ],
    notes: ["G2", "B2", "D3", "G3", "B3", "G4"],
  },
];

export default function MinorScalesLesson() {
  const [selected, setSelected] = useState<ToneOption>(OPTIONS[1]); // 默认 A 小调
  const [preloaded, setPreloaded] = useState(false);

  const playScale = async () => {
    if (!preloaded) {
      await preloadInstruments();
      setPreloaded(true);
    }
    const scale = Scale.get(`${selected.tonic} ${selected.scaleType}`);
    // 加上下行，从 4 八度的主音开始
    const startMidi = Note.midi(`${selected.tonic}3`) ?? 57;
    const tonicChroma = Note.get(selected.tonic).chroma!;
    const scaleChromas = scale.notes.map((n) => Note.get(n).chroma!);
    const ascending: string[] = [];
    let midi = startMidi;
    for (let i = 0; i < 8; i++) {
      ascending.push(Note.fromMidi(midi));
      const next = scaleChromas[(i + 1) % scaleChromas.length];
      const cur = scaleChromas[i % scaleChromas.length];
      let diff = (next - cur + 12) % 12;
      if (diff === 0) diff = 12;
      midi += diff;
    }
    const descending = [...ascending].reverse().slice(1);
    void tonicChroma;
    await playGuitarSequence([...ascending, ...descending], 0.35, 0.04);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            ← 返回主页
          </Link>
          <span className="text-xs text-gray-500">课 · 小调与关系大小调</span>
        </div>

        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            🎸 关系大小调：同一组音，不同的"家"
          </h1>
          <p className="text-gray-400 leading-relaxed">
            C 大调和 A 小调用的是<strong className="text-white">完全相同的 7 个音</strong>——
            区别只在于"以哪个音为家"。下面亲手切换一下，听听感觉怎么变。
          </p>
        </header>

        {/* 切换器 */}
        <section className="mb-10">
          <div className="inline-flex rounded-lg border border-gray-700 p-1 bg-gray-900/50">
            {OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setSelected(opt)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selected.label === opt.label
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={playScale}
            className="ml-3 px-4 py-2 rounded-md text-sm font-medium border border-orange-500/50 text-orange-400 hover:bg-orange-500/10 transition-colors"
          >
            ▶ 播放当前音阶
          </button>
        </section>

        {/* 当前调的指板 */}
        <motion.section
          key={selected.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-10"
        >
          <h2 className={`text-xl font-semibold mb-3 ${selected.color}`}>
            指板：{selected.label}
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-1 align-middle"></span>
            橙色 = 主音（"家"） ·
            <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mx-1 ml-3 align-middle"></span>
            蓝色 = 音阶里的其他音 · <strong>点击任意音可发声</strong>
          </p>
          <ScaleFretboard tonic={selected.tonic} scaleType={selected.scaleType} />
        </motion.section>

        {/* 同步钢琴键盘 */}
        <motion.section
          key={`piano-${selected.label}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-xl font-semibold mb-3">同时看钢琴键盘</h2>
          <p className="text-sm text-gray-500 mb-3">
            注意：C 大调和 A 小调用的是<strong className="text-white">完全相同的 7 个白键</strong>，没有黑键。
            ★ 标注的是主音。
          </p>
          <div className="bg-gray-900/40 rounded-lg p-4 overflow-x-auto">
            <ScalePiano tonic={selected.tonic} scaleType={selected.scaleType} />
          </div>
        </motion.section>

        {/* 6 个共用和弦 */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">这 6 个开放和弦</h2>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            这 6 个和弦同时属于 C 大调和 A 小调——因为它们都是从同一组 7 个音里"叠"出来的。
            练熟这 6 个，你就能伴奏这两个调的大部分流行歌。
            <strong className="text-white"> 点击任意和弦试听。</strong>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CHORDS.map((chord) => (
              <ChordDiagram
                key={chord.name}
                name={chord.name}
                fingers={
                  chord.fingers as unknown as React.ComponentProps<typeof ChordDiagram>["fingers"]
                }
                barres={
                  chord.barres as React.ComponentProps<typeof ChordDiagram>["barres"]
                }
                notes={chord.notes}
              />
            ))}
          </div>
        </section>

        {/* 关键要点 */}
        <section className="mb-10 rounded-lg border border-gray-800 bg-gray-900/30 p-5">
          <h2 className="text-lg font-semibold mb-3">🎯 三件事记住</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300 leading-relaxed">
            <li>
              <strong className="text-white">同样的音，不同的"家"</strong>——C 大调和 A 小调用同一组音，
              只是开头/结尾停在哪个音不同。
            </li>
            <li>
              <strong className="text-white">和弦也是共享的</strong>——Am、C、Dm、Em、F、G 这 6 个开放和弦
              对两个调都通用。
            </li>
            <li>
              <strong className="text-white">这是关系大小调最实用的一面</strong>——学一组和弦，
              能弹两个调的歌；学一个音阶指型，能 solo 两个调。
            </li>
          </ol>
        </section>

        <p className="text-xs text-gray-600 text-center">
          完整版讲义：
          <a
            href="/notes/minor-scales.md"
            className="text-gray-400 hover:text-gray-200 underline ml-1"
          >
            notes/minor-scales.md
          </a>
        </p>
      </div>
    </main>
  );
}
