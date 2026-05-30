import { PitchDetector } from "pitchy";

// 检测到一个稳定音高时回调，freq 单位 Hz，clarity 是 pitchy 的清晰度 (0~1)
export type PitchCallback = (freq: number, clarity: number) => void;

// 吉他合理音域：约 E2(82Hz) 到高把位 ~ 1300Hz。留点余量从 70 开始。
const MIN_FREQ = 70;
const MAX_FREQ = 1300;
// 清晰度门槛。细弦（高音 E）衰减快、有噪声，真实信号 clarity 常在 0.8~0.93，
// 0.9 会把它整根挡掉；0.8 能放进真实音、又能挡住纯噪声（通常 < 0.5）。
const MIN_CLARITY = 0.8;

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

  constructor(onPitch: PitchCallback) {
    this.onPitch = onPitch;
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
    if (freq > MIN_FREQ && freq < MAX_FREQ && clarity > MIN_CLARITY) {
      this.onPitch(freq, clarity);
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
