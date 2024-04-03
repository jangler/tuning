// @ts-ignore
import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { integerLimitIntervals, primeFactors } from "../lib/limit.js";

// TODO: Better page layout. The current layout is too long and narrow.
// TODO: Neutral circle of fifths notation, with demisharps and demiflats.

const maxAccidentals = 4;

const edosInput = document.querySelector('#edos') as HTMLInputElement;
const subgroupInput = document.querySelector('#subgroup') as HTMLInputElement;
const integerLimitInput = document.querySelector('#integerLimit') as HTMLInputElement;
const arrowRatioInput = document.querySelector('#arrowRatio') as HTMLInputElement;
const alert = document.querySelector('#alert')!;
const table = document.querySelector('table')!;
const tbody = document.querySelector('tbody')!;

let intervals: number[][];

function edoMapping(prime: number, edo: number): number {
    const stepSize = 1200/edo;
    const cents = 1200 * Math.log(prime) / Math.log(2);
    return Math.round(cents / stepSize);
}

function edoSteps(ratio: number[], edo: number): number {
    return primeFactors(ratio[0]).map(p => edoMapping(p, edo)).reduce((a, b) => a + b, 0)
        - primeFactors(ratio[1]).map(p => edoMapping(p, edo)).reduce((a, b) => a + b, 0);
}

function multiplyRatio(a: number[], b: number[]): number[] {
    return [a[0] * b[0], a[1] * b[1]];
}

function notateInterval(ratio: number[], edos: number[], arrow: number[]): string {
    let symbols = new Map([
        ['1', [1, 1]],
        ['5', [3, 2]],
        ['4', [4, 3]],
        ['2', [9, 8]],
        ['7', [243, 128]],
        ['6', [27, 16]],
        ['3', [81, 64]],
        ['8', [2, 1]],
        ['9', [9, 4]],
        ['-2', [8, 9]],
    ]);
    const matches: string[] = [];
    for (let layer = 0; matches.length == 0 && layer <= maxAccidentals; layer++) {
        for (const [k, v] of symbols) {
            if (edos.every(edo => edoSteps(ratio, edo) == edoSteps(v, edo)) && !matches.includes(k))
                matches.push(k);
        }
        symbols = new Map([...symbols.entries()].flatMap(([s, r]) => {
            const a: [string, number[]][] = [];
            if (!s.includes('♭')) a.push([s.slice(0, -1) + '♯' + s.slice(-1), multiplyRatio(r, [2187, 2048])]);
            if (!s.includes('♯')) a.push([s.slice(0, -1) + '♭' + s.slice(-1), multiplyRatio(r, [2048, 2187])]);
            if (!s.includes('v')) a.push(['^' + s, multiplyRatio(r, arrow)]);
            if (!s.includes('^')) a.push(['v' + s, multiplyRatio(r, [arrow[1], arrow[0]])]);
            return a;
        }))
    }
    return matches.length > 0 ? matches.join(', ') : '?';
}

function maxFraction(rs: number[][]): number {
    return Math.max(...rs.map(r => r[0]/r[1]));
}

function updateTable() {
    if (!edosInput.value) return;
    try {
        const edos = edosInput.value.match(/\d+/g)?.map(s => parseInt(s));
        if (!edos) throw Error('Could not parse EDOs');
        const arrow = arrowRatioInput.value ? arrowRatioInput.value.match(/(\d+)[:/](\d+)/)?.slice(1).map(s => parseInt(s)) : [1, 1];
        if (!arrow) throw Error('Could not parse arrow ratio');
        const notation = new Map<string, number[][]>();
        for (const interval of intervals) {
            const n = notateInterval(interval, edos, arrow);
            if (!notation.has(n)) notation.set(n, []);
            notation.get(n)?.push(interval);
        }
        const rows = [...notation.entries()]
            .sort(([k1, v1], [k2, v2]) => maxFraction(v1) - maxFraction(v2))
            .map(([k, v]) => html`
        <tr><td>${k}</td><td>${v.map(r => r.join('/')).join(', ')}</td></tr>
        `)
        render(rows, tbody);
        alert.textContent = '';
        table.classList.remove('hidden');
    } catch (e) {
        if (e instanceof Error) {
            alert.textContent = e.message;
            table.classList.add('hidden');
        }
    }
}

function updateIntervals() {
    const limit = integerLimitInput.valueAsNumber;
    const subgroup = subgroupInput.value.match(/\d+/g)?.map(s => parseInt(s));
    intervals = [...integerLimitIntervals(limit, subgroup).entries()]
        .filter(([k, _]) => k > 0 && k < 1200)
        .map(([_, v]) => v.match(/\d+/g)!.map(s => parseInt(s)));
    updateTable();
}

updateIntervals();

edosInput.addEventListener('change', updateTable);
subgroupInput.addEventListener('change', updateIntervals);
integerLimitInput.addEventListener('change', updateIntervals);
arrowRatioInput.addEventListener('change', updateTable);