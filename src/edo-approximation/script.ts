// @ts-ignore
import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { parseInterval } from '../lib/scl.js';

const maxResults = 10;
const decimalDigits = 3;

const intervalsInput = document.getElementById('intervals') as HTMLInputElement;
const edoLimitInput = document.getElementById('edo-limit') as HTMLInputElement;
const sortedByInput = document.getElementById('sorted-by') as HTMLSelectElement;
const alert = document.getElementById('alert') as HTMLParagraphElement;
const table = document.querySelector('table') as HTMLTableElement;
const tbody = document.querySelector('tbody') as HTMLTableSectionElement;

// Return intervals as cents values.
function parseIntervals(): number[] {
    return intervalsInput.value.split(/[,; ]+/).filter(s => s != '').map(parseInterval);
}

// Return an array of integer values in the range [start, end).
function range(start: number, end: number): number[] {
    return [...Array(end - start).keys()].map(x => x + start);
}

function mean(xs: number[]): number {
    return xs.reduce((sum, a) => sum + a, 0) / xs.length;
}

function edoError(edo: number, c: number): number {
    const stepSize = 1200 / edo;
    return Math.round(c / stepSize) * stepSize - c;
}

function getResults(intervals: number[]): number[][] {
    const compareIndex = parseInt(sortedByInput.value);
    return range(5, edoLimitInput.valueAsNumber + 1).map(edo => {
        const error = mean(intervals.map(c => Math.abs(edoError(edo, c))));
        return [edo, error, error / (1200 / edo)];
    }).sort((a, b) => Math.abs(a[compareIndex]) - Math.abs(b[compareIndex]))
        .slice(0, maxResults);
}

function updateTable() {
    var intervals: number[];
    try {
        intervals = parseIntervals();
        alert.textContent = '';
    } catch (e) {
        intervals = [];
        alert.textContent = intervalsInput.value.length ? (e as Error).message : '';
    }
    if (intervals.length > 0) {
        table.classList.remove('hidden');
        const rows = html`${getResults(intervals).map(row => html`
        <tr>${row.map((x, i) => html`<td>${i == 0 ? x : x.toFixed(decimalDigits)}</td>`)}</tr>
        `)}`;
        render(rows, tbody);
    } else {
        table.classList.add('hidden');
    }
}

for (const input of [intervalsInput, edoLimitInput, sortedByInput]) {
    input.addEventListener('change', updateTable);
}

updateTable();