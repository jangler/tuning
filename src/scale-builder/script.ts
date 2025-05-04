// @ts-ignore
import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { gcd } from "../lib/limit.js";

const edoInput = document.querySelector('#edo') as HTMLInputElement;
const scaleDiv = document.querySelector('#scale')!;
const suggestionsDiv = document.querySelector('#suggestions')!;
const prevModeButton = document.querySelector('#prevMode')!;
const nextModeButton = document.querySelector('#nextMode')!;

const errorLimit = 18;

type Ratio = [number, number];

function ratios(limit: number): Ratio[] {
    const s = new Set<number>();
    const a = new Array<Ratio>();
    for (let n = 1; n <= limit; n++) {
        for (let d = Math.ceil(n / 2); d < n; d++) {
            const k = n/d;
            if (!s.has(k)) {
                s.add(k);
                a.push(simplify([n, d]));
            }
        }
    }
    return a;
}

const limit = 27;
const ratioPool = ratios(limit);
let edo = edoInput.valueAsNumber;

function height(r: Ratio): number {
    return r[0] * r[1];
}

function bestMapping(r: Ratio, et: number): number {
    return Math.round(et * Math.log2(r[0] / r[1]) / Math.log2(2));
}

function approximates(n: number, et: number, r: Ratio): boolean {
    const justCents = 1200 * Math.log2(r[0]/r[1]) / Math.log2(2);
    const edoCents = 1200 * n / et;
    return Math.abs(justCents - edoCents) < errorLimit;
}

function detemper(n: number): Ratio | null {
    if (n === 0) {
        return [1, 1];
    }
    const matchedRatios = ratioPool
        .filter(r => bestMapping(r, edo) == n && approximates(n, edo, r));
    matchedRatios.sort((a, b) => height(a) - height(b));
    return matchedRatios[0]; // TODO
}

function stepScore(n: number): number {
    const r = detemper(n);
    if (r) {
        return height(r);
    } else {
        return limit * limit;
    }
}

let stepScores: number[] = [...Array(edo).keys()].map(stepScore);
let scaleIntervals: number[] = [0, bestMapping([3, 2], edo)];

// TODO: export to .scl

function simplify(r: Ratio): Ratio {
    const f = gcd(r);
    return [r[0] / f, r[1] / f];
}

let relative = 0;

function viewRelative(n: number) {
    relative = n;
    renderScale();
}

function addInterval(n: number) {
    scaleIntervals.push(n);
    scaleIntervals.sort((a, b) => a - b);
    viewRelative(0);
    renderNonScale();
    updateDiagnostics();
}

function removeInterval(n: number) {
    if (n == 0) return;
    scaleIntervals = scaleIntervals.filter(x => x != n);
    viewRelative(0);
    renderNonScale();
    updateDiagnostics();
}

function mean(xs: number[]): number {
    return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function complexity(n: number, scale: number[]): number {
    const result = mean(scale.map(x => stepScores[Math.abs(n - x)], 2));
    return result;
}

function formatRatio(r: Ratio | null): string {
    if (r) {
        return `${r[0]}/${r[1]}`;
    } else {
        return '?';
    }
}

function renderScale() {
    render(html`${scaleIntervals.map(n => html`
        <button class="note" onClick=${() => removeInterval(n)}
            onmouseenter=${() => viewRelative(n)} onmouseleave=${() => viewRelative(0)}
            style="background-color: hsl(${360*n/edo} 80 97);">
            ${n - relative}
            <div class="approx">
                ${formatRatio(detemper(Math.abs(n - relative)))}
            </div>
        </button>`)
    }`,
    scaleDiv);
}

function renderNonScale() {
    const nonChordIntervals = [...Array(edo).keys()]
        .filter(x => !scaleIntervals.includes(x));
    nonChordIntervals.sort((a, b) =>
        complexity(a, scaleIntervals) - complexity(b, scaleIntervals));
    render(html`${nonChordIntervals.map(n => html`
        <button class="note" onClick=${() => addInterval(n)}
            onmouseenter=${() => viewRelative(n)} onmouseleave=${() => viewRelative(0)}
            style="background-color: hsl(${360*n/edo} 80 97);">
            ${n}
            <div class="approx">${formatRatio(detemper(n))}</div>
        </button>`)
    }`,
    suggestionsDiv);
}

function updateDiagnostics() {
    // TODO
}

renderScale();
renderNonScale();
updateDiagnostics();

edoInput.addEventListener('change', () => {
    const newEdo = edoInput.valueAsNumber;
    scaleIntervals = [...new Set(scaleIntervals.map(x => {
        const r = detemper(x);
        if (r) {
            return bestMapping(r, newEdo);
        } else {
            return 0;
        }
    }))];
    edo = newEdo;
    stepScores = [...Array(edo).keys()].map(stepScore);
    renderScale();
    renderNonScale();
});

prevModeButton.addEventListener('click', () => {
    if (scaleIntervals.length > 1) {
        const root = edo - scaleIntervals.pop()!;
        scaleIntervals = scaleIntervals.map(x => x + root);
        scaleIntervals.unshift(0);
        renderScale();
        renderNonScale();
    }
});

nextModeButton.addEventListener('click', () => {
    if (scaleIntervals.length > 1) {
        const root = scaleIntervals[1];
        scaleIntervals = scaleIntervals.map(x => x - root);
        scaleIntervals.push(edo + scaleIntervals.shift()!);
        renderScale();
        renderNonScale();
    }
});