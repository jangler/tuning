// @ts-ignore
import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { gcd } from "../lib/limit.js";

const commasInput = document.querySelector('#commas') as HTMLInputElement;
const seriesBox = document.querySelector('#series')!;
const dyadsBox = document.querySelector('#dyads')!;
const chordDiv = document.querySelector('#chord')!;
const suggestionsDiv = document.querySelector('#suggestions')!;

type Ratio = [number, number];

let commas: Ratio[] = [];
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
    // TODO: Simplify using commas.
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

function integerLimitRatios(limit: number): Ratio[] {
    const s = new Set<number>();
    const a = new Array<Ratio>();
    for (let n = 1; n <= limit; n++) {
        for (let d = Math.ceil(n / 4); d < n; d++) {
            const k = n/d;
            if (!s.has(k)) {
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

function dyadicComplexity(r: Ratio, chord: Ratio[]): number {
    return chord.map(x => tenneyHeight(dyad(r, x))).reduce((a, b) => a + b, 0);
}

function renderChord() {
    render(html`${chordIntervals.map(r =>
        html`<span class="ratio" onClick=${() => removeInterval(r)}>${r.join('/')}</span>`)
    }`,
    chordDiv);
    const nonChordIntervals = integerLimitRatios(27)
        .filter(r => !chordIntervals.some(x => x[0] == r[0] && x[1] == r[1]));
    console.log(nonChordIntervals);
    const complexities = new Map(nonChordIntervals.map(r => [r, dyadicComplexity(r, chordIntervals)]));
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

function updateCommas() {
    const matches = commasInput.value.match(/\d+[/:]\d+/g);
    if (matches) {
        commas = matches.map(s => s.match(/\d+/g)!.map(s => parseInt(s)) as Ratio);
        updateDiagnostics();
    }
}

renderChord();
updateDiagnostics();
commasInput.addEventListener('input', updateCommas);
updateCommas();