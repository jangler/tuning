// @ts-ignore
import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { parseInterval } from '../lib/scl.js';

const step1Input = document.querySelector('#step1') as HTMLInputElement;
const step2Input = document.querySelector('#step2') as HTMLInputElement;
const table = document.querySelector('table') as HTMLTableElement;

export function gcd(xs: number[]): number {
    if (xs.length == 0) throw Error('gcd of empty array is undefined');
    for (let i = xs[0]; i > 1; i--) {
        if (xs.every(x => x % i == 0)) return i;
    }
    return 1;
}

function integerLimitIntervals(limit: number): Map<number, string> {
    const m = new Map();
    for (var n = 1; n <= limit; n++) {
        for (var d = 1; d <= limit; d++) {
            const f = gcd([n, d]);
            m.set(1200 * Math.log(n/d) / Math.log(2), `${n/f}/${d/f}`);
        }
    }
    return m;
}

const intervals = integerLimitIntervals(16);
const errorLimit = 15;

function vectors(width: number, height: number): number[][][] {
    const rows = [];
    for (var y = 0; y < height; y++) {
        const row = [];
        for (var x = 0; x < width; x++) {
            row.push([Math.floor(height / 2) - y, x - Math.floor(width / 2)]);
        }
        rows.push(row);
    }
    return rows;
}

function rows(step1: number, step2: number): number[][] {
    return vectors(15, 15).map(row =>
        row.map(vector => vector[0] * step1 + vector[1] * step2));
}

function parseEDO(s: string): number {
    const tokens = s.split('\\');
    return tokens.length == 2 ? parseInt(tokens[1]) : NaN;
}

function getEDO(): number {
    const edos = [parseEDO(step1Input.value), parseEDO(step2Input.value)];
    return edos[0] == edos[1] ? edos[0] : NaN;
}

function mod(a: number, b: number): number {
    while (a < 0) a += b;
    return a % b;
}

// TODO: It would be nice to have octave numbers here.
function udn(cents: number, edo: number): string {
    const steps = mod(Math.round(cents / (1200 / edo)), edo);
    const fifth = Math.round(702 / (1200 / edo));
    const sharp = fifth * 7 - edo * 4;
    var symbols = new Map(['F', 'C', 'G', 'D', 'A', 'E', 'B']
        .map((v, i) => [v, mod(fifth * (i - 1),  edo)]));
    const matches = [];
    while (matches.length == 0) {
        for (const [s, n] of symbols) {
            if (n == steps) matches.push(s);
        }
        symbols = new Map([...symbols.entries()].flatMap(([s, n]) => [
            [s + '♯', mod(n + sharp, edo)],
            [s + '♭', mod(n - sharp, edo)],
            ['^' + s, mod(n + 1, edo)],
            ['v' + s, mod(n - 1, edo)],
        ]));
    }
    return matches.join(', ');
}

function ji(cents: number): string {
    const matches = [...intervals.entries()]
        .filter(([c, _]) => Math.abs(cents - c) < errorLimit)
        .map(([_, s]) => s);
    return matches.length > 0 ? `(${matches.join(', ')})` : '';
}

function formatCell(cents: number) {
    const edo = getEDO();
    return html`<td>
    ${!Number.isNaN(edo) && html`<div>${udn(cents, edo)}</div>`}
    ${html`<div>${cents.toFixed(1)}¢</div>`}
    ${html`<div>${ji(cents)}</div>`}
    </td>`;
}

function formatRows(rows: number[][]) {
    return html`${rows.map(row => html`<tr>${row.map(formatCell)}</tr>`)}`;
}

function updateTable() {
    const step1 = parseInterval(step1Input.value);
    const step2 = parseInterval(step2Input.value);
    render(formatRows(rows(step1, step2)), table);
}

for (const input of [step1Input, step2Input]) {
    input.addEventListener('change', updateTable);
}

updateTable();