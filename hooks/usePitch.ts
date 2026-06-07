"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PitchEngine } from "@/lib/audio";
import { freqToNote, type NoteInfo } from "@/lib/music";

type Mode = "idle" | "mic" | "test";

// 用「最近 WINDOW 帧里出现最多的完整音名」做多数表决。
// 次谐波误判（如 E4 偶发蹦成 A2）是少数派会被否决，真实音是多数派快速胜出。
// WINDOW=3 → 约 2 帧（~33ms）即可确认，既快又不被偶发跳变打断。
const WINDOW = 3;
// 显示用的 cents/freq 指数平滑系数（仅影响指针/读数，不影响检测与音名判定）。
const EMA_ALPHA = 0.3;

export function usePitch() {
  const engineRef = useRef<PitchEngine | null>(null);
  const committedRef = useRef<NoteInfo | null>(null);
  // 最近若干帧的完整音名（如 "E4"），用于多数表决
  const historyRef = useRef<string[]>([]);
  // 显示用的平滑值
  const emaRef = useRef<{ cents: number; freq: number } | null>(null);
  const [note, setNote] = useState<NoteInfo | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    committedRef.current = null;
    historyRef.current = [];
    emaRef.current = null;
  }, []);

  const handlePitch = useCallback((freq: number) => {
    const info = freqToNote(freq);
    if (!info) return;

    // 滑动窗口 + 多数表决，键为完整音名（含八度），从而能识破次谐波八度错。
    const hist = historyRef.current;
    hist.push(info.name);
    if (hist.length > WINDOW) hist.shift();

    let winner = info.name;
    let winnerCount = 0;
    const counts = new Map<string, number>();
    for (const n of hist) {
      const c = (counts.get(n) ?? 0) + 1;
      counts.set(n, c);
      if (c > winnerCount) {
        winner = n;
        winnerCount = c;
      }
    }

    const committed = committedRef.current;
    // 已确认音持续出现：实时更新（保持指针跟手）。
    // 否则要求胜出音在窗口里占多数（≥2/3）才切换，挡住单帧次谐波跳变。
    const isCommitted = committed != null && info.name === committed.name;
    if (!isCommitted && winnerCount < 2) return;
    // 多数派若不是当前帧的音（极少见），忽略本帧等下一帧。
    if (!isCommitted && winner !== info.name) return;

    committedRef.current = info;

    // 显示平滑：换音名时重置 EMA，避免跨音跳变拖影。
    const ema = emaRef.current;
    if (!ema || (committed && committed.name !== info.name)) {
      emaRef.current = { cents: info.cents, freq: info.freq };
    } else {
      emaRef.current = {
        cents: ema.cents + EMA_ALPHA * (info.cents - ema.cents),
        freq: ema.freq + EMA_ALPHA * (info.freq - ema.freq),
      };
    }
    setNote({ ...info, cents: emaRef.current.cents, freq: emaRef.current.freq });
  }, []);

  const handleSilence = useCallback(() => {
    reset();
    setNote(null);
  }, [reset]);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new PitchEngine(handlePitch, handleSilence);
    }
    return engineRef.current;
  }, [handlePitch, handleSilence]);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    setMode("idle");
    setNote(null);
    reset();
  }, [reset]);

  const startMic = useCallback(async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("当前浏览器不支持麦克风采集（getUserMedia）。");
        return;
      }
      const engine = getEngine();
      engine.stop();
      await engine.startMic();
      setMode("mic");
    } catch {
      setError("无法访问麦克风，请检查浏览器权限后重试。");
      setMode("idle");
    }
  }, [getEngine]);

  const startTest = useCallback(async () => {
    setError(null);
    try {
      const engine = getEngine();
      engine.stop();
      await engine.startTestTone(440);
      setMode("test");
    } catch {
      setError("无法启动测试音。");
      setMode("idle");
    }
  }, [getEngine]);

  useEffect(() => {
    return () => engineRef.current?.dispose();
  }, []);

  const getAnalyser = useCallback((): AnalyserNode | null => {
    return engineRef.current?.getAnalyser() ?? null;
  }, []);

  return { note, mode, error, startMic, startTest, stop, getAnalyser };
}
