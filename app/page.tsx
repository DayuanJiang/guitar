import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-10 px-4 py-10 bg-[#0a0a0a] text-gray-100">
      <header className="text-center">
        <h1 className="text-3xl font-bold">🎸 吉他可视化</h1>
        <p className="mt-2 text-gray-400">
          选择一个工具开始
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-3xl">
        <Link
          href="/tuner"
          className="group flex flex-col items-center gap-3 rounded-xl border border-gray-700 p-8 hover:border-green-500 hover:bg-green-500/5 transition-colors"
        >
          <span className="text-4xl">🎵</span>
          <span className="text-lg font-semibold group-hover:text-green-400 transition-colors">
            调音器
          </span>
          <span className="text-sm text-gray-500 text-center">
            实时检测音高、音准偏差
          </span>
        </Link>

        <Link
          href="/fretboard"
          className="group flex flex-col items-center gap-3 rounded-xl border border-gray-700 p-8 hover:border-amber-500 hover:bg-amber-500/5 transition-colors"
        >
          <span className="text-4xl">🎸</span>
          <span className="text-lg font-semibold group-hover:text-amber-400 transition-colors">
            指板可视化
          </span>
          <span className="text-sm text-gray-500 text-center">
            在指板上点亮当前弹的音
          </span>
        </Link>

        <Link
          href="/lessons/minor-scales"
          className="group flex flex-col items-center gap-3 rounded-xl border border-gray-700 p-8 hover:border-orange-500 hover:bg-orange-500/5 transition-colors"
        >
          <span className="text-4xl">📖</span>
          <span className="text-lg font-semibold group-hover:text-orange-400 transition-colors">
            小调与关系大小调
          </span>
          <span className="text-sm text-gray-500 text-center">
            交互课程：指板 + 钢琴 + 和弦图
          </span>
        </Link>
      </div>

      <footer className="mt-auto pt-6 text-xs text-gray-600">
        基于 pitchy · tonal · fretboard.js · smplr · svguitar · react-piano
      </footer>
    </main>
  );
}
