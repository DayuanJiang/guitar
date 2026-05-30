"use client";

type Props = {
  mode: "idle" | "mic" | "test";
  error: string | null;
  startMic: () => void;
  startTest: () => void;
  stop: () => void;
};

export default function Controls({
  mode,
  error,
  startMic,
  startTest,
  stop,
}: Props) {
  const listening = mode !== "idle";

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {!listening ? (
          <button
            onClick={startMic}
            className="rounded-lg bg-green-600 px-6 py-2.5 font-semibold hover:bg-green-500 transition-colors"
          >
            ▶ 开始（麦克风）
          </button>
        ) : (
          <button
            onClick={stop}
            className="rounded-lg bg-red-600 px-6 py-2.5 font-semibold hover:bg-red-500 transition-colors"
          >
            ■ 停止
          </button>
        )}
        <button
          onClick={mode === "test" ? stop : startTest}
          className={`rounded-lg px-5 py-2.5 font-medium border transition-colors ${
            mode === "test"
              ? "border-amber-500 bg-amber-500/20 text-amber-300"
              : "border-gray-600 hover:border-gray-400 text-gray-300"
          }`}
        >
          🔊 测试音 440Hz
        </button>
        <span className="text-xs text-gray-500">
          {mode === "mic"
            ? "● 正在监听麦克风"
            : mode === "test"
              ? "● 正在播放测试音"
              : "未启动"}
        </span>
      </div>

      {error && (
        <div className="rounded-md bg-red-950 border border-red-800 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
    </>
  );
}
