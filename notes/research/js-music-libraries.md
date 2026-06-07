# JS 音乐/吉他库调研报告

> 生成时间：2026-06-01
> 调研规模：319 次搜索 → 217 个独立库 → 40 个深度阅读 README
> 项目背景：Next.js 16 + React 19 + Tailwind 4 + TypeScript
> 已用：`@moonwave99/fretboard.js`、`tonal`、`pitchy`

---

## 1. TL;DR 推荐

如果只能选 3 个：**Tone.js + smplr + svguitar**

完整推荐 8 个：

1. **Tone.js** — 音频引擎。替代 `lib/audio.ts` 的 sine wave，提供 synth/sampler/Transport
2. **smplr** — 真乐器采样（吉他、钢琴、鼓、Soundfont GM），点指板出真吉他声
3. **svguitar** — 专门画和弦盒子图，chordpic.com 用的就是它
4. **VexFlow** — 五线谱 + Tab 渲染，让学员同时学认谱
5. **Motion (Framer Motion)** — React 19 时代的动画首选
6. **react-piano (kevinsqi)** — 钢琴键盘组件，配合吉他指板做双视图
7. **ChordSheetJS** — ChordPro 解析 + 移调（可选，做歌谱时用）
8. **Tuna.js** — 吉他踏板效果（过载/wah/混响），可选

---

## 2. 分类完整目录

### 🎵 audio-synth（音频生成）

**深度阅读：**

| 库 | verdict | 用途 |
|----|---------|------|
| **Tone.js** | ✅ must-try | 所有"播放音/和弦/音阶"交互的基础 |
| **smplr** | ✅ must-try | 真实吉他/钢琴音色，零后端 |
| **Howler.js** | 🤔 consider | 只在用预录采样片段时考虑（与 Tone.js 重复）|
| **WebAudioFont** | 🤔 consider | GM 之外要 Strat/Les Paul/失真音色时 |
| **tonejs-instruments** | 🤔 consider | Tone.Sampler 的现成采样包 |
| **webaudio-tinysynth** | 🤔 consider | 50KB GM 合成器，零资源回退方案 |
| **SpessaSynth** | 🤔 consider | TS SoundFont2 + AudioWorklet，专业级 |
| **js-synthesizer** | ⚠️ niche | FluidSynth WASM，几 MB 资源 |
| **AlphaSynth** | 🤔 consider | 仅在用 alphaTab 时 |
| **Magenta.js** | ⚠️ niche | 生成式音乐，2024 后停滞 |
| **soundfont-player** | ❌ skip | 已废弃，作者让用 smplr |
| **MIDI.js** | ❌ skip | 已死，Next.js 集成困难 |
| **bap** | ❌ skip | 不维护、领域不对 |
| **Elementary Audio** | ❌ skip | 大材小用 |
| **Gibberish.js** | ❌ skip | 打包困难、不友好 React |
| **p5.sound.js** | ❌ skip | 强制依赖 p5.js |

**轻量列表（其他选项）：**
- Tone.Sampler、@tonejs/piano、midi-sounds-react、Reactronica、XSound
- midi-js-soundfonts (gleitz)、sf2-player、sf2-parser、soundfont2
- sample-player (danigb)、sfz-web-player、tonejs-instrument-guitar-acoustic-ogg

---

### 🎸 fretboard（指板可视化）

**深度阅读：**

| 库 | verdict | 用途 |
|----|---------|------|
| **@moonwave99/fretboard.js** | ✅ must-try | **已在用**，CAGED/3NPS/五声盒子，留着 |
| **react-guitar (4lejandrito)** | 🤔 consider | 拟真可点击的 React 吉他组件 |

**轻量列表：**
- react-fretboard (devboell)、react-fretboard-diagram
- fretboarder (cheap-glitch)、tuning-spork (igorski)
- Dimethoxy/Scales、radzionc/guitar（参考代码）

---

### 🎼 chord-diagram（和弦盒子图）

**深度阅读：**

| 库 | verdict | 用途 |
|----|---------|------|
| **svguitar** | ✅ must-try | 课件里所有和弦图都用它 |
| **@tombatossals/react-chords** | 🤔 consider | 配 chords-db 数据集 |
| **@techies23/react-chords** | 🤔 consider | 上面那个的 React 19 维护版 |
| chordproject/chord-diagrammer | ❌ skip | npm 包发布错误 |
| chord-component | ❌ skip | 已废弃 |
| chordhub/react-chord-chart | ❌ skip | 2020 年废弃 |
| react-guitar-lyrics | ❌ skip | 2018 年废弃 |
| react-chord-parser | ❌ skip | 2016 年废弃 |
| chord-parser (ehynds) | ⚠️ niche | 20 行正则可替代 |

**轻量列表：**
- vexchords（VexFlow 作者写的）、chordkit、chordbook/charts
- kiastorm/guitar-chord-diagram-web-component、pianosnake/uke-chord
- mwcm/ChordSVG、andygock/chordy-svg
- react-guitar-chord、react-guitar-chord-chart、@authentrics/chord-diagram
- text-guitar-chart、guitar-chord (Svelte web component)
- VcChordDiagram (Vue)、chord-library (lowery)

---

### 🎹 piano（钢琴键盘）

**轻量列表（重要选项）：**
- **react-piano (kevinsqi)** — ⭐ 强烈推荐，最经典的 React 钢琴
- klavier — 轻量、可定制
- react-piano-component (lillydinhle) — 自带 MP3 音频
- piano-chart (ailon) — 可视化音/和弦/音阶
- pianokeys (jesperdj) — SVG 钢琴 + 高亮 API
- piano-keys-sjb、custom-piano-keys
- Salamander Grand Piano（采样集）
- samples-piano-mp3 (darosh)

---

### 📜 notation（五线谱/Tab）

**深度阅读：**

| 库 | verdict | 用途 |
|----|---------|------|
| **VexFlow** | ✅ must-try | 五线谱 + Tab 渲染 |
| **@coderline/alphatab** | 🤔 consider | Guitar Pro 全曲渲染 + 内置合成 |
| **OpenSheetMusicDisplay** | 🤔 consider | MusicXML 渲染（基于 VexFlow）|
| **abcjs** | 🤔 consider | ABC 记谱 + 内置 MIDI |
| **VexTab** | 🤔 consider | ⚠️ 非商业许可 |
| vue-music-notation | ❌ skip | 仅 Vue 2 |

**轻量列表：**
- abc2svg、Verovio、react-sheet-music、react-musicxml
- Smoosic、abcjs-vexflow-renderer、jTab
- musical-components、guitar-tabs-editor、@praisecharts/chordsheetjs

---

### 🎓 theory（乐理计算）

**深度阅读：**

| 库 | verdict | 用途 |
|----|---------|------|
| **ChordSheetJS** | 🤔 consider | ChordPro 解析 + 移调 + Nashville |
| Tune.js | ❌ skip | 微分音调律，与 12-TET 吉他不符 |

**轻量列表：**
- **tonal** — ⭐ 已在用
- @tonaljs/scale、@tonaljs/chord、@tonaljs/progression、@tonaljs/pcset、@tonaljs/chord-detect
- Teoria.js、tonic.ts（含吉他指法计算！）
- @chordkit/theory、@chordkit/detect
- @musodojo/music-theory-data、@patrady/chord-js
- harmony (rpmessner)、music.note、music-interval、interval-parser
- MUSIC.js、Konduktiva、Pomax/music-theory-js
- chordproject/chorpro-parser、solfege、shadcn music blocks

---

### 🎤 pitch（音高检测）

**轻量列表（已有 pitchy，备选）：**
- **pitchy** — ⭐ 已在用，McLeod Pitch Method
- pitchfinder — 多种算法（YIN、AMDF、autocorrelation、wavelet）
- aubiojs — WASM 端口（含节奏检测）
- ml5.js (CREPE) — 深度学习，重
- yinjs、detect-pitch
- pitch.js (audiocogs)、webaudio-pitch-tuner
- MMLL、perfect-pitch (omar-diop)

---

### 👂 ear-training（练耳）

**轻量列表（多为参考应用，非可导入库）：**
- OpenEar — Angular 全栈练耳应用，**借鉴它的练习分类法**
- Solfetta、MinorSeventh、earwise、Tone the Ear
- earboard、ear-training (mrbossosity)、Music-TS-React
- Perfect_pitch_ear、fretfull、fretboard-trainer

---

### 🎚️ dsp / effects（音频效果/分析）

**深度阅读：**

| 库 | verdict | 用途 |
|----|---------|------|
| **Tuna.js** | 🤔 consider | 吉他踏板效果（过载/混响/wah）|

**轻量列表：**
- Meyda — 音频特征提取（MFCC、RMS、色谱、谱质心）
- essentia.js — Essentia WASM（调性/和弦/HPCP/节拍）
- myers/chord_detector — AudioBuffer 和弦检测

---

### 📊 viz（可视化）

**轻量列表：**
- wavesurfer.js — 音频波形可视化/播放
- audiomotion-analyzer — 高分辨率频谱分析
- NexusUI — 旋钮、刻度盘、音序器 UI
- Waveform Playlist — 多轨音频编辑
- react-piano-roll (minagishl/dpren) — 落音 piano roll
- webaudio-pianoroll (g200kg) — Web Component
- React Three Fiber + drei — 3D 指板
- p5.js — 创意编程
- react-graph-gallery chord diagram (D3) — D3 弦图模板

---

### ✨ animation（动画）

**轻量列表：**
- **Motion (Framer Motion)** — ⭐ 首选，spring/layout/手势
- react-spring — spring 物理动画
- GSAP — timeline + ScrollTrigger / MorphSVG
- Motion One — 3.8KB Web Animations API 封装
- Anime.js — 通用动画
- AutoAnimate — 零配置过渡
- Lottie / lottie-react — AE JSON 动画
- Theatre.js — 可视化时间轴编辑器
- React Transition Group — 底层进入/退出原语
- React ViewTransition — View Transitions API 封装

---

### 🎹 midi

**深度阅读：**

| 库 | verdict |
|----|---------|
| @musicbird/gpx-parser | ❌ skip（alphaTab 覆盖）|
| parse-gp5 | ❌ skip（已废弃）|

**轻量列表：**
- @tonejs/midi — 解析/生成 MIDI 文件
- MidiPlayerJS — SMF 读取 → JSON 事件
- WEBMIDI.js — Web MIDI API 高级封装
- MIDIVal — TS MIDI 库
- react-web-midi、Scribbletune（生成进行）
- html-midi-player — `<midi-player>` Web Component
- smfplayer.js、midi-file、midi-parser-js、smf-parser、midi-json-parser
- MidiPianoRoll、web-midi-player、MIDIjs (midijs.net)
- @waveform-playlist/midi

---

### 🛠️ other / utility

- **use-sound** — 🤔 consider，UI 反馈音效，基于 Howler 的 React hook
- AudioKeys — QWERTY → 音符映射，支持复音
- awesome-webaudio / awesome-javascript-audio / noteflakes/awesome-music — 资源汇总
- webaudio-node — 与浏览器项目无关

---

## 3. 教程功能 → 推荐组合

### 点指板上某个音 → 听到真吉他声
- **fretboard.js** 处理点击命中（`fretboard.on('click', ...)`）
- **Tone.js + smplr**（`Soundfont('acoustic_guitar_nylon')`）出真吉他声
- 注意：让 Tone.js 和 smplr 共享一个 AudioContext（避免 Safari 6-context 限制 + 自动播放问题）

### "同一指型换家"演示（关系大小调）
- **fretboard.js** `highlightAreas()` 同时画两个高亮框
- **Motion** 动画化"家"从 C 滑到 A
- **Tone.js** 依次播放两种"家"下的音阶，让耳朵听差别

### 和弦从音阶里抽出来的动画
- **fretboard.js** 显示父级音阶
- 用 `setDots()` 渐进显示 1-3-5（带延迟）
- **Motion** 做点的淡入/缩放动画
- **tonal** `Chord.get('Cmaj7').notes` 取和弦音
- **Tone.js** `triggerAttackRelease` 与视觉同步
- **svguitar** 完成后渲染最终和弦盒

### 钢琴显示音程（白键/黑键）
- **react-piano (kevinsqi)** — React 最干净的钢琴组件
- **smplr** `SplendidGrandPiano` 出声
- 与 fretboard.js 并排放，**同一组音同时在两个视图高亮**

### 和弦盒子图（ChordPro 风格）
- **svguitar** 是正确答案，API 最干净，barre 渲染最好
- **tonal** 验证和弦名 + 自建 JSON 指法库（或直接用 @tombatossals/chords-db）
- **不要用 fretboard.js 画和弦盒**——它是长指板可视化器

### Backing Track 循环（练 solo 用）
- **Tone.js** `Transport` + `Loop` 做节奏骨架
- **smplr** `DrumMachine` 鼓 + `Soundfont('electric_bass_finger')` 贝斯
- **smplr** `Reverb` 效果粘合
- 可选：**Scribbletune** 从罗马数字生成进行
- ❌ 不要用 alphaTab 做 backing loop（太重）

### 音阶形状之间的动画过渡
- **Motion** 是首选——`<motion.circle>` 配 `layoutId` 让点形态变化
- **GSAP MorphSVG** 如果要更顺滑的路径变形
- 注意：fretboard.js 输出 SVG，但你可能要 patch 它的 render 或用 overlay SVG

### 听耳训练（音程辨认）
- **tonal** 生成随机音程（`Interval.fromSemitones(n)`）
- **Tone.js + smplr** 播放参考音 + 测试音
- **Motion** 正确/错误反馈动画
- **use-sound** 短暂提示音
- 参考 **OpenEar** (https://github.com/ShacharHarshuv/open-ear) 的练习分类设计

---

## 4. 反推荐（明确跳过）

| 库 | 跳过理由 |
|---|---|
| **soundfont-player** | 官方废弃，作者改推 smplr |
| **MIDI.js** | 已死，pre-ESM globals，需要 Next.js 适配垫片 |
| **bap** | 2019 后不维护，节拍采样领域（不对吉他/乐理）|
| **Elementary Audio** | 大材小用，Tone.js 全覆盖。AudioWorklet 资源在 Next.js 16 里有摩擦 |
| **Gibberish.js** | 打包麻烦（global script + worklet path），不友好 React |
| **p5.sound.js** | 强迫依赖 p5.js，直接用 Tone.js |
| **Tune.js (abbernie)** | 3000+ 微分音律，与 12-TET 吉他无关 |
| **vue-music-notation** | 仅 Vue 2 |
| **chordhub/react-chord-chart** | 3 commits，2020，README 是 CRA 模板 |
| **chord-component** | npm 官方废弃 |
| **@musicbird/gpx-parser / parse-gp5** | 单版本 GP 解析器，alphaTab 全覆盖 |
| **react-guitar-lyrics** | 2018 demo，未上 npm，React 16 时代 |
| **react-chord-parser (tekumai)** | 2016 class 组件 |
| **chord-parser (ehynds)** | 20 行正则可替代 |
| **chordproject/chord-diagrammer** | npm 包 README 指向错误的包 |
| **VexTab** | ⚠️ 非商业许可，未来商业化会卡住 |
| **Magenta.js** | 仓库 2024 起停滞，TF.js + 模型几 MB |

---

## 5. 有趣但题外（暂不需要）

| 库 | 何时回来看 |
|----|----------|
| **@coderline/alphaTab** | 想做"配 Guitar Pro 完整曲目跟弹"功能时 |
| **OpenSheetMusicDisplay** | 教程内容用 MuseScore/Dorico 编写并导出 MusicXML 时 |
| **abcjs** | 想用 ABC 文本编写课件 + 内置播放时 |
| **SpessaSynth / js-synthesizer** | 想做离线高质量练习曲渲染时 |
| **WebAudioFont** | 学员想听 Strat/Les Paul/失真音色对比时 |
| **Tonic.ts (osteele)** | 需要程序化生成吉他指法时 |
| **@chordkit/detect** | 做"弹一个和弦让网站识别"功能时 |
| **Meyda / essentia.js** | 高级特征提取（色谱图可视化、调性识别）|
| **html-midi-player** | 想用 `<midi-player>` Web Component 一行嵌入 MIDI |
| **wavesurfer.js / audiomotion-analyzer** | 做"录音 + 看波形"课时 |
| **react-piano-roll** | 做 Synthesia 风格的"跟着旋律弹"功能 |
| **shadcn music blocks** | 找布局/UX 灵感 |
| **NexusUI** | 做效果器机架课，配 Tuna.js |
| **AudioKeys** | 加"用电脑键盘弹"模式 |
| **GSAP MorphSVG** | CAGED 形状之间的丝滑变形（Motion `layoutId` 不够时）|

---

## 6. 立即行动建议

```bash
npm install tone smplr svguitar react-piano framer-motion
```

第一步：把现有 markdown 第二节"关系大小调"改成交互式页面，包含：
1. 共用指板（fretboard.js）+ 切换"家"按钮
2. 钢琴（react-piano）同步高亮
3. 6 个开放和弦的 svguitar 图（hover 听声）
4. "为什么是这 6 个"的动画——从音阶 7 个音里"跳一个抽一个"逐个生成
