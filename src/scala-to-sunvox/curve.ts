// curve generation code

export { generateCurve };

import { Scale } from "./scl.js";
import { Keymap } from "./kbm.js";

const TOTAL_KEYS = 128;
const C5_UNITS = 0x7c00;
const C5_KEY = 60;
const CENTS_PER_SEMITONE = 100;
const UNITS_PER_SEMITONE = 0x100;
const MIN_UNITS = 0;
const MAX_UNITS = 0xffff;

function generateCurve(scale: Scale, keymap: Keymap, offset: number): Uint8Array {
    const buf = new Uint8Array(TOTAL_KEYS * 2);
    for (let key = 0; key < TOTAL_KEYS; key++) {
        const units = (key >= keymap.firstNote && key <= keymap.lastNote) ?
            calcPitch(scale, keymap, key, offset) :
            C5_UNITS + (key - C5_KEY) * UNITS_PER_SEMITONE;
        buf[key * 2] = units & 0xff;
        buf[key * 2 + 1] = units >> 8;
    }
    return buf;
}

function modulo(x: number, y: number): number {
    let n = x % y;
    while (n < 0) {
        n += y;
    }
    return n;
}

function calcPitch(
    scale: Scale, keymap: Keymap, key: number, centsOffset: number): number {
    // sorry for all the increment/decrement nonsense
    const offset = key - 1 - keymap.middleNote;
    const octave = Math.floor(offset / keymap.size);
    let mapIndex = modulo(offset + 1, keymap.size);
    const scaleIndex = keymap.mapping[mapIndex];
    const units = scaleIndex === null ?
        MIN_UNITS :
        C5_UNITS + Math.round(
            (scale.notes[modulo(scaleIndex - 1, scale.notes.length)] +
                octave * scale.notes[scale.notes.length - 1] +
                centsOffset) *
            UNITS_PER_SEMITONE / CENTS_PER_SEMITONE
        );
    return Math.max(MIN_UNITS, Math.min(MAX_UNITS, units));
}
