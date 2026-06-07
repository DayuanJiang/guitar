declare module "react-piano" {
  import type { ComponentType, ReactNode } from "react";

  export interface NoteRange {
    first: number;
    last: number;
  }

  export interface PianoProps {
    noteRange: NoteRange;
    playNote: (midiNumber: number) => void;
    stopNote: (midiNumber: number) => void;
    activeNotes?: number[];
    width?: number;
    keyWidthToHeight?: number;
    keyboardShortcuts?: KeyboardShortcut[] | null;
    disabled?: boolean;
    renderNoteLabel?: (info: {
      midiNumber: number;
      isAccidental: boolean;
      isActive: boolean;
    }) => ReactNode;
    className?: string;
  }

  export interface KeyboardShortcut {
    key: string;
    midiNumber: number;
  }

  export const Piano: ComponentType<PianoProps>;
  export const ControlledPiano: ComponentType<PianoProps>;
  export const Keyboard: ComponentType<PianoProps>;

  export const KeyboardShortcuts: {
    HOME_ROW: KeyboardShortcut[];
    QWERTY_ROW: KeyboardShortcut[];
    BOTTOM_ROW: KeyboardShortcut[];
    create: (config: {
      firstNote: number;
      lastNote: number;
      keyboardConfig: KeyboardShortcut[];
    }) => KeyboardShortcut[];
  };

  export const MidiNumbers: {
    fromNote: (note: string) => number;
    getAttributes: (midiNumber: number) => {
      note: string;
      pitchName: string;
      octave: number;
      midiNumber: number;
      isAccidental: boolean;
    };
    NATURAL_MIDI_NUMBERS: number[];
    MIDI_NUMBERS_BY_NOTE: Record<string, number>;
  };
}

declare module "react-piano/dist/styles.css";
