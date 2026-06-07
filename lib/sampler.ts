"use client";

import { Soundfont, SplendidGrandPiano } from "smplr";

// 全站共享一个 AudioContext，避免 Safari 6-context 限制和重复初始化
let sharedContext: AudioContext | null = null;

function getContext(): AudioContext {
  if (sharedContext) return sharedContext;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  sharedContext = new Ctx();
  return sharedContext;
}

type Instrument = ReturnType<typeof Soundfont> | ReturnType<typeof SplendidGrandPiano>;

let guitarInstance: Instrument | null = null;
let pianoInstance: Instrument | null = null;

// 真吉他采样（FluidR3 GM 的钢弦/电吉他洁净音色）
function getGuitar(): Instrument {
  if (guitarInstance) return guitarInstance;
  guitarInstance = Soundfont(getContext(), {
    instrument: "acoustic_guitar_steel",
  });
  return guitarInstance;
}

// 钢琴采样
function getPiano(): Instrument {
  if (pianoInstance) return pianoInstance;
  pianoInstance = SplendidGrandPiano(getContext());
  return pianoInstance;
}

async function ensureContextRunning() {
  const ctx = getContext();
  if (ctx.state === "suspended") await ctx.resume();
}

// 播放单音（吉他）。note 可以是音名 "A4"、"C#5" 或 MIDI 号
export async function playGuitarNote(note: string | number, durationSec = 1.2) {
  await ensureContextRunning();
  const guitar = getGuitar();
  await guitar.ready;
  guitar.start({ note, duration: durationSec });
}

// 播放单音（钢琴）
export async function playPianoNote(note: string | number, durationSec = 1.5) {
  await ensureContextRunning();
  const piano = getPiano();
  await piano.ready;
  piano.start({ note, duration: durationSec });
}

// 同时播一组音（吉他和弦）
export async function playGuitarChord(notes: (string | number)[], durationSec = 1.8) {
  await ensureContextRunning();
  const guitar = getGuitar();
  await guitar.ready;
  notes.forEach((n) => guitar.start({ note: n, duration: durationSec }));
}

// 顺序播一段音阶（吉他），按节奏依次触发
export async function playGuitarSequence(
  notes: (string | number)[],
  noteDurationSec = 0.4,
  gapSec = 0.05
) {
  await ensureContextRunning();
  const ctx = getContext();
  const guitar = getGuitar();
  await guitar.ready;
  let time = ctx.currentTime;
  notes.forEach((n) => {
    guitar.start({ note: n, duration: noteDurationSec, time });
    time += noteDurationSec + gapSec;
  });
}

// 预加载吉他和钢琴（提示用户在交互前可能要等一下）
export async function preloadInstruments() {
  await ensureContextRunning();
  const guitar = getGuitar();
  const piano = getPiano();
  await Promise.all([guitar.ready, piano.ready]);
}
