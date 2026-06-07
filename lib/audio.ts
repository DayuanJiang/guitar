import { PitchDetector } from "pitchy";

// 检测到一个稳定音高时回调，freq 单位 Hz，clarity 是 pitchy 的清晰度 (0~1)
export type PitchCallback = (freq: number, clarity: number) => void;
// 持续一段时间没有有效音高时回调，让 UI 清空残留读数
export type SilenceCallback = () => void;

// 吉他合理音域：最低 E2≈82Hz。实测：MPM 在高音弦衰减时会锁到次谐波
// （如 E4→110/55Hz、B3→49Hz），这些错值都落在 78Hz 以下，而真实最低弦 80Hz+，
// 所以把下限提到 78 能一刀切掉绝大多数次谐波误判，又不误伤低 E。
const MIN_FREQ = 78;
const MAX_FREQ = 1300;
// 清晰度门槛。实测真实拨弦（含高音弦）的基频 clarity 普遍 ≥0.8，纯噪声更低，
// 0.8 是个好分界。注意：次谐波错值的 clarity 也可能很高，靠的是 MIN_FREQ 拦它。
const MIN_CLARITY = 0.8;
// 安静多久（ms）没有有效音高就清空显示，避免停手后旧音残留。
// 用 400ms 而非 300ms，给高音弦的衰减尾音留点余地，免得弹着弹着闪空。
const SILENCE_MS = 400;
// pitchy 音量兜底：RMS 低于此值的帧直接判静音，挡掉安静环境噪声。
const MIN_VOLUME = 0.005;

// 把麦克风（或测试音）接到同一个 AnalyserNode，跑 requestAnimationFrame 循环做音高检测。
// 这是整个 app 唯一的音频「胶水层」，UI 只需要给一个 onPitch 回调。
export class PitchEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private detector: PitchDetector<Float32Array> | null = null;
  private buffer: Float32Array<ArrayBuffer> = new Float32Array(0);
  private rafId: number | null = null;
  private stream: MediaStream | null = null;
  private oscillator: OscillatorNode | null = null;
  private onPitch: PitchCallback;
  private onSilence: SilenceCallback;
  private lastPitchAt = 0; // 最近一次有效音高的时间戳（performance.now）
  private silent = true; // 当前是否已处于「静音已通知」状态，避免重复回调

  constructor(onPitch: PitchCallback, onSilence: SilenceCallback) {
    this.onPitch = onPitch;
    this.onSilence = onSilence;
  }

  private ensureContext() {
    if (!this.audioContext) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.audioContext = new Ctx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.buffer = new Float32Array(this.analyser.fftSize);
      this.detector = PitchDetector.forFloat32Array(this.analyser.fftSize);
      // 音量兜底：太安静的帧直接返回 clarity 0，挡掉环境噪声。
      this.detector.minVolumeAbsolute = MIN_VOLUME;
    }
    return this.audioContext;
  }

  // 启动麦克风采集。会触发浏览器权限询问；失败时抛错由调用方处理。
  async startMic() {
    const ctx = this.ensureContext();
    await ctx.resume();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    const source = ctx.createMediaStreamSource(this.stream);
    source.connect(this.analyser!);
    this.loop();
  }

  // 启动一个测试音（默认 A4=440Hz），无需吉他即可端到端验证整条流水线。
  async startTestTone(freq = 440) {
    const ctx = this.ensureContext();
    await ctx.resume();
    this.oscillator = ctx.createOscillator();
    this.oscillator.type = "sine";
    this.oscillator.frequency.value = freq;
    // 接到 analyser 用于检测；不接 destination，避免外放刺耳。
    this.oscillator.connect(this.analyser!);
    this.oscillator.start();
    this.loop();
  }

  private loop = () => {
    if (!this.analyser || !this.detector || !this.audioContext) return;
    this.analyser.getFloatTimeDomainData(this.buffer);
    const [freq, clarity] = this.detector.findPitch(
      this.buffer,
      this.audioContext.sampleRate
    );

    const now = performance.now();
    if (freq > MIN_FREQ && freq < MAX_FREQ && clarity > MIN_CLARITY) {
      this.lastPitchAt = now;
      this.silent = false;
      this.onPitch(freq, clarity);
    } else if (!this.silent && now - this.lastPitchAt > SILENCE_MS) {
      // 持续没有有效音高 → 通知 UI 清空残留读数（只通知一次）
      this.silent = true;
      this.onSilence();
    }
    this.rafId = requestAnimationFrame(this.loop);
  };

  // 停止一切：循环、麦克风、测试音。可重复调用。
  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    // 复位静音看门狗，下次启动从干净状态开始
    this.silent = true;
    this.lastPitchAt = 0;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  dispose() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
