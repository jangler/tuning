// scl-parsing code

export type Scale = {
    description: string;
    notes: Array<number>;
}

function centsFromRatio(num: number, den: number): number {
    return 1200 * Math.log(num / den) / Math.log(2);
}

/** Try to parse s as a ratio or cents value.
 *  Throw an exception if the input could not be parsed. */
export function parseInterval(s: string): number {
    s = s.trim();
    if (/^\d+$/.test(s)) {
        const num = parseInt(s);
        return centsFromRatio(num, 1);
    } else if (/^\d+\/\d+$/.test(s)) {
        const tokens = s.split('/').map((x) => parseInt(x));
        return centsFromRatio(tokens[0], tokens[1]);
    } else if (/^(\d+\.\d*|\.\d+)$/.test(s)) {
        return parseFloat(s);
    }
    throw new Error(`Could not parse pitch value: ${s}`)
}

export function parseScl(text: string): Scale {
    const lines = text.split('\n').filter((s) => !s.startsWith('!'));
    if (lines.length < 2) {
        throw new Error('Invalid scale file')
    }
    const scale = {
        description: lines[0],
        notes: lines.slice(2).filter((s) => s.length > 0).map(parseInterval),
    };
    const count = parseInt(lines[1]);
    if (scale.notes.length != count) {
        throw new Error('Wrong number of notes in scale');
    }
    return scale;
}
