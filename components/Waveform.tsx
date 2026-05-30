"use client";

import { useEffect, useRef } from "react";

export default function Waveform({
  getAnalyser,
  active,
}: {
  getAnalyser: () => AnalyserNode | null;
  active: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let freqBuf: Uint8Array | null = null;

    const draw = () => {
      const analyser = getAnalyser();
      if (!analyser) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      if (!freqBuf) {
        freqBuf = new Uint8Array(analyser.frequencyBinCount);
      }
      analyser.getByteFrequencyData(freqBuf);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 只画前 1/4 频段（0~约 3kHz，覆盖吉他全部有用频率）
      const useBins = Math.floor(freqBuf.length / 4);
      const barWidth = w / useBins;

      for (let i = 0; i < useBins; i++) {
        const val = freqBuf[i] / 255;
        const barH = val * h;
        const x = i * barWidth;

        // 低音绿 → 中音蓝 → 高音紫
        const ratio = i / useBins;
        let r: number, g: number, b: number;
        if (ratio < 0.33) {
          r = 34; g = 197; b = 94;
        } else if (ratio < 0.66) {
          r = 96; g = 165; b = 250;
        } else {
          r = 168; g = 85; b = 247;
        }

        ctx.fillStyle = `rgba(${r},${g},${b},${0.7 + val * 0.3})`;
        ctx.fillRect(x, h - barH, barWidth - 1, barH);
      }

      // 标注频段
      ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText("低音", 4, 14);
      ctx.fillText("中音", w * 0.33, 14);
      ctx.fillText("高音", w * 0.66, 14);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, getAnalyser]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={180}
      className="w-full max-w-4xl rounded-lg border border-gray-800 bg-gray-900/50"
    />
  );
}
