"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PitchEngine } from "@/lib/audio";
import { freqToNote, type NoteInfo } from "@/lib/music";

type Mode = "idle" | "mic" | "test";

const CONFIRM_FRAMES = 4;

export function usePitch() {
  const engineRef = useRef<PitchEngine | null>(null);
  const committedRef = useRef<NoteInfo | null>(null);
  const candidateRef = useRef<{ name: string; count: number }>({
    name: "",
    count: 0,
  });
  const [note, setNote] = useState<NoteInfo | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [error, setError] = useState<string | null>(null);

  const handlePitch = useCallback((freq: number) => {
    const info = freqToNote(freq);
    if (!info) return;

    const committed = committedRef.current;
    if (committed && info.pc === committed.pc) {
      candidateRef.current = { name: info.pc, count: 0 };
      committedRef.current = info;
      setNote(info);
      return;
    }

    const cand = candidateRef.current;
    if (cand.name === info.pc) {
      cand.count += 1;
    } else {
      candidateRef.current = { name: info.pc, count: 1 };
    }
    if (candidateRef.current.count >= CONFIRM_FRAMES) {
      committedRef.current = info;
      setNote(info);
    }
  }, []);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new PitchEngine(handlePitch);
    }
    return engineRef.current;
  }, [handlePitch]);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    setMode("idle");
    setNote(null);
    committedRef.current = null;
    candidateRef.current = { name: "", count: 0 };
  }, []);

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
