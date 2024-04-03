export function gcd(xs: number[]): number {
    if (xs.length == 0) throw Error('gcd of empty array is undefined');
    for (let i = xs[0]; i > 1; i--) {
        if (xs.every(x => x % i == 0)) return i;
    }
    return 1;
}

export function isPrime(n: number): boolean {
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i == 0) return false;
    }
    return true;
}

export function primeFactors(n: number): number[] {
    const factors = [];
    while (n > 1) {
        for (let i = 2; i <= n; i++) {
            if (n % i == 0 && isPrime(i)) {
                factors.push(i);
                n /= i;
                break;
            }
        }
    }
    return factors;
}

/** Return true if all prime factors of n and d are included in subgroup. */
function inSubgroup(n: number, d: number, subgroup: number[]): boolean {
    if (d == 1) return primeFactors(n).every(f => subgroup.includes(f));
    return inSubgroup(n, 1, subgroup) && inSubgroup(d, 1, subgroup);
}

/** Return a map of cents values to ratio strings. */
export function integerLimitIntervals(limit: number, subgroup: number[] | undefined = undefined): Map<number, string> {
    const m = new Map();
    for (let n = 1; n <= limit; n++) {
        for (let d = 1; d <= limit; d++) {
            if (!subgroup || inSubgroup(n, d, subgroup)) {
                const f = gcd([n, d]);
                m.set(1200 * Math.log(n / d) / Math.log(2), `${n / f}/${d / f}`);
            }
        }
    }
    return m;
}