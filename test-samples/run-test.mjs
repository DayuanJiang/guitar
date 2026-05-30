// 用真实吉他录音验证检测流水线，与 app 逻辑保持一致：
//   pitchy + 同样的频率/清晰度门(MIN_CLARITY) + 同样的「按音级连续确认」(CONFIRM_FRAMES)。
//
// 两组样本（文件名即 ground-truth 音高）：
//   1) freewavesamples.com 下载的真实吉他单音（C3~C6，覆盖高音区）
//   2) openstrings/ —— 由真实吉他 C4 用 ffmpeg 变调得到的标准调弦六根开放弦
//      （保留真实的起音/谐波/衰减，精确落在 E2/A2/D3/G3/B3/E4）
//
// 运行: node test-samples/run-test.mjs
import { PitchDetector } from "pitchy";
import { Note } from "tonal";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));

// ---- 与 app 保持一致的常量（见 lib/audio.ts / app/page.tsx）----
const MIN_FREQ = 70;
const MAX_FREQ = 1300;
const MIN_CLARITY = 0.8;
const CONFIRM_FRAMES = 4;
const FFT = 2048;

// ---- 极简 WAV 解码（16-bit PCM，混成单声道）----
function decodeWav(buf) {
  if (buf.toString("ascii", 0, 4) !== "RIFF") throw new Error("not RIFF");
  let p = 12;
  let fmt = null;
  let dataOffset = -1;
  let dataLen = 0;
  while (p + 8 <= buf.length) {
    const id = buf.toString("ascii", p, p + 4);
    const size = buf.readUInt32LE(p + 4);
    if (id === "fmt ") {
      fmt = {
        channels: buf.readUInt16LE(p + 10),
        sampleRate: buf.readUInt32LE(p + 12),
        bitsPerSample: buf.readUInt16LE(p + 22),
      };
    } else if (id === "data") {
      dataOffset = p + 8;
      dataLen = size;
    }
    p += 8 + size + (size & 1);
  }
  if (!fmt || dataOffset < 0) throw new Error("missing fmt/data");
  if (fmt.bitsPerSample !== 16) throw new Error("only 16-bit supported");

  const ch = fmt.channels;
  const frameBytes = 2 * ch;
  const nFrames = Math.floor(dataLen / frameBytes);
  const out = new Float32Array(nFrames);
  for (let i = 0; i < nFrames; i++) {
    let sum = 0;
    for (let c = 0; c < ch; c++) {
      sum += buf.readInt16LE(dataOffset + i * frameBytes + c * 2) / 32768;
    }
    out[i] = sum / ch;
  }
  return { samples: out, sampleRate: fmt.sampleRate };
}

function labelFromName(name) {
  const m = name.match(/[_-]([A-G][#b]?\d)\.wav$/i);
  return m ? m[1] : null;
}

// 复刻 app 的「按音级连续确认」状态机，返回最终提交的音。
function detect(path) {
  const { samples, sampleRate } = decodeWav(readFileSync(path));
  const detector = PitchDetector.forFloat32Array(FFT);
  const buf = new Float32Array(FFT);

  let committed = null; // {name, pc}
  let cand = { pc: "", count: 0 };
  const seq = [];
  let frames = 0;
  let gated = 0;

  for (let off = 0; off + FFT <= samples.length; off += FFT) {
    buf.set(samples.subarray(off, off + FFT));
    const [freq, clarity] = detector.findPitch(buf, sampleRate);
    frames++;
    if (!(freq > MIN_FREQ && freq < MAX_FREQ && clarity > MIN_CLARITY)) continue;
    gated++;
    const name = Note.fromFreq(freq);
    const info = Note.get(name);
    if (info.empty) continue;
    const pc = info.pc;
    if (committed && pc === committed.pc) {
      cand = { pc, count: 0 };
      committed = { name, pc };
      continue;
    }
    if (cand.pc === pc) cand.count++;
    else cand = { pc, count: 1 };
    if (cand.count >= CONFIRM_FRAMES) {
      committed = { name, pc };
      seq.push(name);
    }
  }
  return { committed, seq, frames, gated };
}

function runSuite(title, dir, exactOctave) {
  if (!existsSync(dir)) return [0, 0];
  const wavs = readdirSync(dir).filter((f) => f.endsWith(".wav")).sort();
  if (wavs.length === 0) return [0, 0];
  console.log(`\n=== ${title} ===`);
  let pass = 0;
  for (const w of wavs) {
    const label = labelFromName(w);
    const r = detect(join(dir, w));
    const det = r.committed;
    // exactOctave=true 时要求连八度都对；否则只比音级
    const ok = exactOctave
      ? det?.name === label
      : det?.pc === (label ? Note.get(label).pc : null);
    if (ok) pass++;
    console.log(
      `${ok ? "✅" : "❌"} ${w.padEnd(42)} 标注=${String(label).padEnd(4)} ` +
        `检测=${(det?.name ?? "(none)").padEnd(5)} ` +
        `[过门 ${r.gated}/${r.frames}, 序列 ${JSON.stringify(r.seq)}]`
    );
  }
  console.log(`小计: ${pass}/${wavs.length}`);
  return [pass, wavs.length];
}

const [p1, n1] = runSuite("真实吉他单音 (C3~C6)", DIR, false);
const [p2, n2] = runSuite("标准调弦六根开放弦 (含八度)", join(DIR, "openstrings"), true);
console.log(`\n总计正确: ${p1 + p2}/${n1 + n2}`);
