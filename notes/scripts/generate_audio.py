"""
用 Karplus-Strong 算法生成吉他音色的音阶示例。
为 minor-scales.md 配套使用。
"""
import numpy as np
from scipy.io import wavfile
from pathlib import Path

SAMPLE_RATE = 44100
NOTE_DURATION = 0.5  # 每个音持续秒数
OUTPUT_DIR = Path(__file__).parent.parent / "audio"
OUTPUT_DIR.mkdir(exist_ok=True)


def note_to_freq(note: str) -> float:
    """把音名转成频率。例如 'A4' -> 440.0Hz, 'C4' -> 261.63Hz"""
    # 半音表（以 C 为 0）
    semitones = {
        'C': 0, 'C#': 1, 'Db': 1,
        'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'E#': 5, 'Fb': 4,
        'F': 5, 'F#': 6, 'Gb': 6,
        'G': 7, 'G#': 8, 'Ab': 8,
        'A': 9, 'A#': 10, 'Bb': 10,
        'B': 11, 'Cb': 11,
    }
    # 解析：例如 'F#4' -> ('F#', 4), 'A4' -> ('A', 4)
    if len(note) >= 2 and note[1] in '#b':
        name = note[:2]
        octave = int(note[2:])
    else:
        name = note[0]
        octave = int(note[1:])

    # A4 = 440 Hz, MIDI 编号 69
    midi = 12 * (octave + 1) + semitones[name]
    return 440.0 * (2 ** ((midi - 69) / 12))


def karplus_strong(freq: float, duration: float, decay: float = 0.996) -> np.ndarray:
    """Karplus-Strong 拨弦合成"""
    n_samples = int(SAMPLE_RATE * duration)
    period = int(SAMPLE_RATE / freq)
    # 初始噪声缓冲（模拟拨弦瞬间的能量）
    rng = np.random.default_rng(seed=42)
    buffer = rng.uniform(-1, 1, period)
    output = np.zeros(n_samples)
    for i in range(n_samples):
        output[i] = buffer[i % period]
        # 平均当前值和下一个值，再衰减 —— 这就是 KS 算法的核心
        buffer[i % period] = decay * 0.5 * (buffer[i % period] + buffer[(i + 1) % period])
    # 归一化
    output = output / np.max(np.abs(output))
    return output


def play_notes(notes: list[str], duration: float = NOTE_DURATION) -> np.ndarray:
    """依次弹奏一串音符"""
    audio = np.concatenate([karplus_strong(note_to_freq(n), duration) for n in notes])
    return audio


def play_chord(notes: list[str], duration: float = 2.0) -> np.ndarray:
    """同时弹响多个音（和弦）"""
    waves = [karplus_strong(note_to_freq(n), duration) for n in notes]
    # 长度对齐后相加
    min_len = min(len(w) for w in waves)
    chord = sum(w[:min_len] for w in waves) / len(waves)
    return chord


def save(audio: np.ndarray, filename: str):
    """保存为 WAV 文件"""
    # 16-bit PCM
    audio_int16 = (audio * 32767 * 0.7).astype(np.int16)
    path = OUTPUT_DIR / filename
    wavfile.write(path, SAMPLE_RATE, audio_int16)
    print(f"  ✓ {path.name}")


# ============================================================
# 生成所有示例
# ============================================================

print("生成 C 大调 vs A 小调对比...")
# C 大调上下行
c_major = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5',
           'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4']
save(play_notes(c_major), "01-c-major.wav")

# A 小调（自然）上下行 —— 用同一组音，不同起点
a_minor = ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4',
           'G4', 'F4', 'E4', 'D4', 'C4', 'B3', 'A3']
save(play_notes(a_minor), "02-a-minor-natural.wav")

print("生成 A 和声小调（第 7 级升半音）...")
a_harmonic = ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G#4', 'A4',
              'G#4', 'F4', 'E4', 'D4', 'C4', 'B3', 'A3']
save(play_notes(a_harmonic), "03-a-minor-harmonic.wav")

print("生成 A 旋律小调（上下行不同）...")
a_melodic = ['A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G#4', 'A4',  # 上行：6、7 级升
             'G4', 'F4', 'E4', 'D4', 'C4', 'B3', 'A3']            # 下行：还原成自然小调
save(play_notes(a_melodic), "04-a-minor-melodic.wav")

print("生成对比示例：同一组音，不同主音...")
# 重点：让你听见"主音"的力量
# 第一段：以 C 结尾 -> 大调感觉
# 第二段：以 A 结尾 -> 小调感觉
demo_c = ['G4', 'F4', 'E4', 'D4', 'C4'] * 2  # 落在 C
demo_a = ['E4', 'D4', 'C4', 'B3', 'A3'] * 2  # 落在 A
save(play_notes(demo_c), "05-demo-ends-on-c.wav")
save(play_notes(demo_a), "06-demo-ends-on-a.wav")

print("生成小调和弦进行（Am - F - C - G）...")
# 一个非常常见的小调进行：vi - IV - I - V (相对 C 大调) / i - VI - III - VII (相对 A 小调)
chord_duration = 1.5
am = play_chord(['A3', 'C4', 'E4', 'A4'], chord_duration)
f = play_chord(['F3', 'A3', 'C4', 'F4'], chord_duration)
c = play_chord(['C4', 'E4', 'G4', 'C5'], chord_duration)
g = play_chord(['G3', 'B3', 'D4', 'G4'], chord_duration)
progression = np.concatenate([am, f, c, g, am])
save(progression, "07-minor-progression.wav")

# ============================================================
# 各调的关系小调对比（让你听到"调号相同 = 用同一组音"）
# ============================================================

print("\n生成 G 大调 → E 小调对比...")
g_major = ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4',
           'F#4', 'E4', 'D4', 'C4', 'B3', 'A3', 'G3']
save(play_notes(g_major), "08-g-major.wav")

# E 小调用 G 大调的同一组音，但从 E 开始
e_minor = ['E3', 'F#3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4',
           'D4', 'C4', 'B3', 'A3', 'G3', 'F#3', 'E3']
save(play_notes(e_minor), "09-e-minor.wav")

print("生成 D 大调 → B 小调对比...")
d_major = ['D3', 'E3', 'F#3', 'G3', 'A3', 'B3', 'C#4', 'D4',
           'C#4', 'B3', 'A3', 'G3', 'F#3', 'E3', 'D3']
save(play_notes(d_major), "10-d-major.wav")

b_minor = ['B3', 'C#4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4',
           'A4', 'G4', 'F#4', 'E4', 'D4', 'C#4', 'B3']
save(play_notes(b_minor), "11-b-minor.wav")

# ============================================================
# 根音 vs 其他音（让你听到"主音的引力"）
# ============================================================

print("\n生成根音示范：先听根音，再听整个音阶...")
# 重复弹几次主音 A —— 让你"记住" A 这个音
root_only = ['A3'] * 4
save(play_notes(root_only, duration=0.6), "12-root-A.wav")

# 弹整个音阶，回到 A 时你会感觉"对了，回家了"
scale_with_root_emphasis = (['A3'] * 2 +  # 先强调主音
                             ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'] +  # 上行
                             ['A4'] * 2)  # 在主音上停一下
save(play_notes(scale_with_root_emphasis, duration=0.45), "13-scale-emphasize-root.wav")

# 对比：故意停在非主音上 —— 听起来"没结束"
scale_stop_unfinished = ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4']  # 停在第 7 级 G
save(play_notes(scale_stop_unfinished, duration=0.5), "14-scale-stop-unfinished.wav")

# ============================================================
# A 小调旋律小品（让你听到"在曲子里小调长什么样"）
# ============================================================

print("\n生成 A 小调旋律小品...")
# 一段简单的 8 小节小调旋律，全部用 A 自然小调的音
# 节奏用音符时长来表示（短=0.3s，中=0.5s，长=0.9s）
melody_notes = [
    ('A4', 0.5), ('C5', 0.3), ('E5', 0.3), ('A4', 0.5),
    ('G4', 0.5), ('E4', 0.3), ('A4', 0.3), ('G4', 0.9),
    ('F4', 0.5), ('A4', 0.3), ('C5', 0.3), ('B4', 0.5),
    ('A4', 0.3), ('G4', 0.3), ('F4', 0.3), ('E4', 0.9),
    ('D4', 0.5), ('F4', 0.3), ('A4', 0.3), ('G4', 0.5),
    ('E4', 0.5), ('D4', 0.3), ('C4', 0.3), ('B3', 0.5),
    ('A3', 0.3), ('C4', 0.3), ('E4', 0.3), ('A4', 0.3),
    ('A3', 1.2),  # 落在主音 A 上 —— "回家"
]
melody_audio = np.concatenate([
    karplus_strong(note_to_freq(n), d) for n, d in melody_notes
])
save(melody_audio, "15-a-minor-melody.wav")

# 同样的"音模板"但在 C 大调上，让你对比小调和大调旋律的感觉差别
# 把每个音"平移"成 C 大调里对应级数的音（A→C, C→E, E→G, G→B, F→A, D→F, B→D, A→C）
melody_major = [
    ('C5', 0.5), ('E5', 0.3), ('G5', 0.3), ('C5', 0.5),
    ('B4', 0.5), ('G4', 0.3), ('C5', 0.3), ('B4', 0.9),
    ('A4', 0.5), ('C5', 0.3), ('E5', 0.3), ('D5', 0.5),
    ('C5', 0.3), ('B4', 0.3), ('A4', 0.3), ('G4', 0.9),
    ('F4', 0.5), ('A4', 0.3), ('C5', 0.3), ('B4', 0.5),
    ('G4', 0.5), ('F4', 0.3), ('E4', 0.3), ('D4', 0.5),
    ('C4', 0.3), ('E4', 0.3), ('G4', 0.3), ('C5', 0.3),
    ('C4', 1.2),
]
melody_major_audio = np.concatenate([
    karplus_strong(note_to_freq(n), d) for n, d in melody_major
])
save(melody_major_audio, "16-c-major-melody.wav")

print("\n全部生成完毕！")
print(f"音频文件位于：{OUTPUT_DIR}")
