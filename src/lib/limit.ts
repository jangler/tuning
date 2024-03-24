function gcd(xs: number[]): number {
    if (xs.length == 0) throw Error('gcd of empty array is undefined');
    for (let i = xs[0]; i > 1; i--) {
        if (xs.every(x => x % i == 0)) return i;
    }
    return 1;
}

/** Return a map of cents values to ratio strings. */
export function integerLimitIntervals(limit: number): Map<number, string> {
    const m = new Map();
    for (var n = 1; n <= limit; n++) {
        for (var d = 1; d <= limit; d++) {
            const f = gcd([n, d]);
            m.set(1200 * Math.log(n / d) / Math.log(2), `${n / f}/${d / f}`);
        }
    }
    return m;
}