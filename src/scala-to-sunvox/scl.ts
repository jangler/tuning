// scl-parsing code

export { Scale, parseScl };

type Scale = {
    description: string;
    notes: Array<number>;
}

function centsFromRatio(num: number, den: number): number {
    return 1200 * Math.log(num / den) / Math.log(2);
}

function parseNote(line: string): number {
    line = line.trim();
    if (/^\d+$/.test(line)) {
        const num = parseInt(line);
        return centsFromRatio(num, 1);
    } else if (/^\d+\/\d+$/.test(line)) {
        const tokens = line.split('/').map((x) => parseInt(x));
        return centsFromRatio(tokens[0], tokens[1]);
    } else if (/^\d*.\d*$/.test(line)) {
        return parseFloat(line);
    }
    throw new Error(`Could not parse pitch value: ${line}`)
}

function parseScl(text: string): Scale {
    const lines = text.split('\n').filter((s) => !s.startsWith('!'));
    if (lines.length < 2) {
        throw new Error('Invalid scale file')
    }
    const scale = {
        description: lines[0],
        notes: lines.slice(2).filter((s) => s.length > 0).map(parseNote),
    };
    const count = parseInt(lines[1]);
    if (scale.notes.length != count) {
        throw new Error('Wrong number of notes in scale');
    }
    return scale;
}
