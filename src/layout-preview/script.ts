// @ts-ignore
import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { parseInterval } from '../lib/scl.js';
import { udn } from '../lib/udn.js';

const step1Input = document.querySelector('#step1') as HTMLInputElement;
const step2Input = document.querySelector('#step2') as HTMLInputElement;
const displayInput = document.querySelector('#display') as HTMLSelectElement;
const alert = document.getElementById('alert') as HTMLParagraphElement;
const table = document.querySelector('table') as HTMLTableElement;

// TODO: Set grid dimensions.
// TODO: Set integer limit.
// TODO: Set 1/1 point by clicking on cell?
// TODO: Cell colors? Could go by primes or by UDN.

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
            m.set(1200 * Math.log(n / d) / Math.log(2), `${n / f}/${d / f}`);
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
    return vectors(25, 8).map(row =>
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

function ji(cents: number): string[] {
    return [...intervals.entries()]
        .filter(([c, _]) => Math.abs(cents - c) < errorLimit)
        .map(([_, s]) => s);
}

function formatCell(cents: number, display: string) {
    const edo = getEDO();
    var text = '';
    switch (display) {
        case 'cents':
            text = cents.toFixed(0) + '¢';
            break;
        case 'edosteps':
            if (!Number.isNaN(edo)) text = `${Math.round(cents / (1200 / edo))}\\${edo}`;
            else throw new Error("Can't display EDO data for non-EDO steps");
            break;
        case 'ji':
            text = ji(cents).slice(0, 2).join(', ');
            break;
        case 'udn':
            if (!Number.isNaN(edo))
                text = udn(Math.round(cents / (1200 / edo)), edo).slice(0, 2).join(', ');
            else
                throw new Error("Can't display EDO data for non-EDO steps");
            break;
    }
    return html`<td>${text}</td>`;
}

function formatRows(rows: number[][], display: string) {
    return html`${rows.map(row => html`<tr>${row.map(c => formatCell(c, display))}</tr>`)}`;
}

function updateTable() {
    try {
        const step1 = parseInterval(step1Input.value);
        const step2 = parseInterval(step2Input.value);
        const display = displayInput.value;
        render(formatRows(rows(step1, step2), display), table);
        alert.textContent = '';
    } catch (e) {
        if (e instanceof Error) alert.textContent = e.message;
    }
}

for (const input of [step1Input, step2Input, displayInput]) {
    input.addEventListener('change', updateTable);
}

updateTable();