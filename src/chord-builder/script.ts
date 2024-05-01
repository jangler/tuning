// @ts-ignore
import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { gcd, inSubgroup } from "../lib/limit.js";

const integerLimitInput = document.querySelector('#integerLimit') as HTMLInputElement;
const subgroupInput = document.querySelector('#subgroup') as HTMLInputElement;
const octavesBelowInput = document.querySelector('#octavesBelow') as HTMLInputElement;
const octavesAboveInput = document.querySelector('#octavesAbove') as HTMLInputElement;
const seriesBox = document.querySelector('#series')!;
const dyadsBox = document.querySelector('#dyads')!;
const chordDiv = document.querySelector('#chord')!;
const suggestionsDiv = document.querySelector('#suggestions')!;

type Ratio = [number, number];

let integerLimit = integerLimitInput.valueAsNumber;
let subgroup = subgroupInput.value.match(/\d+/g)?.map(s => parseInt(s)) as number[];
let octavesBelow = octavesBelowInput.valueAsNumber;
let octavesAbove = octavesAboveInput.valueAsNumber;
let chordIntervals: Ratio[] = [[1, 1], [5, 4], [3, 2]];

function lcm(xs: number[]): number {
    let i = Math.max(...xs);
    while (true) {
        if (xs.every(x => i % x == 0)) return i;
        i++;
    }
}

function series(chord: Ratio[]): number[] {
    const f = lcm(chord.map(r => r[1]));
    return chord.map(r => r[0] * f / r[1]);
}

function simplify(r: Ratio): Ratio {
    const f = gcd(r);
    return [r[0] / f, r[1] / f];
}

function dyad(a: Ratio, b: Ratio): Ratio {
    if (a[0]/a[1] < b[0]/b[1]) {
        const c = a;
        a = b;
        b = c;
    }
    return simplify([a[0] * b[1], a[1] * b[0]]);
}

function dyads(chord: Ratio[]): Ratio[] {
    const ds = new Array<Ratio>();
    for (let i = 0; i < chord.length; i++) {
        for (let j = i + 1; j < chord.length; j++) {
            ds.push(dyad(chord[i], chord[j]));
        }
    }
    return ds;
}

function addInterval(r: Ratio) {
    chordIntervals.push(r);
    chordIntervals.sort((a, b) => a[0]/a[1] - b[0]/b[1]);
    renderChord();
    updateDiagnostics();
}

function removeInterval(r: Ratio) {
    if (r.every(x => x == 1)) return;
    chordIntervals = chordIntervals.filter(x => !(x[0] == r[0] && x[1] == r[1]));
    renderChord();
    updateDiagnostics();
}

function ratios(limit: number, subgroup: number[]): Ratio[] {
    const s = new Set<number>();
    const a = new Array<Ratio>();
    for (let n = 1; n <= limit; n++) {
        for (let d = Math.ceil(n / 2**octavesAbove); d < n * 2**octavesBelow; d++) {
            const k = n/d;
            if (!s.has(k) && (subgroup === undefined || inSubgroup(n, d, subgroup))) {
                s.add(k);
                a.push(simplify([n, d]));
            }
        }
    }
    return a;
}

function tenneyHeight(r: Ratio): number {
    return Math.log2(r[0] * r[1]);
}

function mean(xs: number[]): number {
    return xs.reduce((a, b) => a + b, 0) / xs.length;
}

// Dyadic complexity, series complexity, and critical band penalty are all
// scaled such that typical values will be in the range 0-1. Not supposed to be
// scientific, just a helpful heuristic.

function dyadicComplexity(r: Ratio, chord: Ratio[]): number {
    return mean(chord.map(x => tenneyHeight(dyad(r, x)))) / 10;
}

function seriesComplexity(chord: Ratio[]): number {
    return mean(series(chord)) / 64;
}

function criticalBandPenalty(r: Ratio, chord: Ratio[]): number {
    return mean(chord.map(x => {
        const d = dyad(r, x);
        return Math.max(0, 8 * (9/8 - d[0]/d[1]));
    }));
}

function renderChord() {
    render(html`${chordIntervals.map(r =>
        html`<span class="ratio" onClick=${() => removeInterval(r)}>${r.join('/')}</span>`)
    }`,
    chordDiv);
    const nonChordIntervals = ratios(integerLimit, subgroup)
        .filter(r => !chordIntervals.some(x => x[0] == r[0] && x[1] == r[1]));
    console.log(nonChordIntervals);
    // TODO: Factor series height and critical band into this.
    const complexities = new Map(nonChordIntervals.map(r =>
        [r, dyadicComplexity(r, chordIntervals) + seriesComplexity([...chordIntervals, r]) + criticalBandPenalty(r, chordIntervals)]));
    nonChordIntervals.sort((a, b) => complexities.get(a)! - complexities.get(b)!);
    render(html`${nonChordIntervals.map(r =>
        html`<span class="ratio" onClick=${() => addInterval(r)}>${r.join('/')}</span>`)
    }`,
    suggestionsDiv);
}

function updateDiagnostics() {
    seriesBox.textContent = series(chordIntervals).join(':');
    dyadsBox.textContent = dyads(chordIntervals)
        .sort((a, b) => tenneyHeight(a) - tenneyHeight(b))
        .map(r => r.join('/')).join(', ');
}

renderChord();
updateDiagnostics();

integerLimitInput.addEventListener('change', () => {
    integerLimit = integerLimitInput.valueAsNumber;
    renderChord();
});

subgroupInput.addEventListener('change', () => {
    subgroup = subgroupInput.value.match(/\d+/g)?.map(s => parseInt(s)) as number[];
    renderChord();
});

octavesBelowInput.addEventListener('change', () => {
    octavesBelow = octavesBelowInput.valueAsNumber;
    renderChord();
});

octavesAboveInput.addEventListener('change', () => {
    octavesAbove = octavesAboveInput.valueAsNumber;
    renderChord();
});