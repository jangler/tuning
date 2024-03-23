function mod(a: number, b: number): number {
    return a - Math.floor(a / b) * b;
}

/** Return an array of the simplest UDN possibilities for a step count in an edo. */
export function udn(steps: number, edo: number): string[] {
    // If performance becomes an issue, batch-notating an array of step or
    // cents values could save some computation over doing them separately.
    const stepClass = mod(steps, edo);
    const fifth = Math.round(702 / (1200 / edo));
    const sharp = fifth * 7 - edo * 4;
    var symbols = new Map(['F', 'C', 'G', 'D', 'A', 'E', 'B']
        .map((v, i) => [v, mod(fifth * (i - 1),  edo)]));
    const matches = [];
    while (matches.length == 0) {
        for (const [s, n] of symbols) {
            if (n == stepClass) matches.push(s);
        }
        symbols = new Map([...symbols.entries()].flatMap(([s, n]) => {
            const a: [string, number][] = [];
            if (!s.includes('♭')) a.push([s + '♯', mod(n + sharp, edo)]);
            if (!s.includes('♯')) a.push([s + '♭', mod(n - sharp, edo)]);
            if (!s.includes('v')) a.push(['^' + s, mod(n + 1, edo)]);
            if (!s.includes('^')) a.push(['v' + s, mod(n - 1, edo)]);
            return a;
        }));
    }
    function octaveOffset(symbol: string, steps: number): number {
        const accidentalSteps =
            (symbol.match(/♯/g)?.length ?? 0) * sharp -
            (symbol.match(/♭/g)?.length ?? 0) * sharp +
            (symbol.match(/\^/g)?.length ?? 0) -
            (symbol.match(/v/g)?.length ?? 0);
        return Math.floor((steps - accidentalSteps) / edo);
    }
    return matches.map(v => v + `${4 + octaveOffset(v, steps)}`);
}