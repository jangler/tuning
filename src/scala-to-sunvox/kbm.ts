// kbm-parsing code

export { Keymap, parseKbm, defaultMap };

type Keymap = {
    size: number;
    firstNote: number;
    lastNote: number;
    middleNote: number;
    referenceNote: number;
    frequency: number;
    formalOctave: number;
    mapping: Array<number | null>;
}

function parseKbm(text: string): Keymap {
    const lines = text.split('\n').filter((s) => !s.startsWith('!'));
    if (lines.length < 7) {
        throw new Error('Invalid mapping file')
    }
    const keymap = {
        size: parseInt(lines[0]),
        firstNote: parseInt(lines[1]),
        lastNote: parseInt(lines[2]),
        middleNote: parseInt(lines[3]),
        referenceNote: parseInt(lines[4]),
        frequency: parseFloat(lines[5]),
        formalOctave: parseInt(lines[6]),
        mapping: lines.slice(7).map((s) =>
            s.trim() == 'x' ? null : parseInt(s)),
    };
    if (keymap.mapping.length != keymap.size) {
        throw new Error('Wrong number of keys in mapping');
    }
    return keymap;
}

function defaultMap(size: number): Keymap {
    return {
        size: size,
        firstNote: 0,
        lastNote: 127,
        middleNote: 60,
        referenceNote: 69,
        frequency: 440.0,
        formalOctave: size,
        mapping: [...new Array(size).keys()],
    };
}
