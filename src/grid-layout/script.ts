// @ts-ignore
import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { integerLimitIntervals } from '../lib/limit.js';
import { parseInterval } from '../lib/scl.js';
import { udn } from '../lib/udn.js';

const step1Input = document.querySelector('#step1') as HTMLInputElement;
const step2Input = document.querySelector('#step2') as HTMLInputElement;
const rowsInput = document.querySelector('#rows') as HTMLInputElement;
const columnsInput = document.querySelector('#columns') as HTMLInputElement;
const displayInput = document.querySelector('#display') as HTMLSelectElement;
const integerLimitLabel = document.querySelector('#integerLimitLabel') as HTMLLabelElement;
const integerLimitInput = document.querySelector('#integerLimit') as HTMLInputElement;
const errorLimitLabel = document.querySelector('#errorLimitLabel') as HTMLLabelElement;
const errorLimitInput = document.querySelector('#errorLimit') as HTMLInputElement;
const alert = document.getElementById('alert') as HTMLParagraphElement;
const table = document.querySelector('table') as HTMLTableElement;

// TODO: Cell colors? Could go by primes or by UDN.

var intervals = integerLimitIntervals(integerLimitInput.valueAsNumber);
var centerX = Math.floor((rowsInput.valueAsNumber - 0.5) / 2);
var centerY = Math.floor(columnsInput.valueAsNumber / 2);

function regenIntervals() {
    intervals = integerLimitIntervals(integerLimitInput.valueAsNumber)
}

function vectors(width: number, height: number): number[][][] {
    const rows = [];
    for (var y = 0; y < height; y++) {
        const row = [];
        for (var x = 0; x < width; x++) {
            row.push([centerY - y, x - centerX]);
        }
        rows.push(row);
    }
    return rows;
}

function makeRows(step1: number, step2: number, rows: number, columns: number): number[][] {
    return vectors(rows, columns).map(row =>
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
    const errorLimit = errorLimitInput.valueAsNumber;
    return [...intervals.entries()]
        .filter(([c, _]) => Math.abs(cents - c) < errorLimit)
        .map(([_, s]) => s);
}

function formatCell(x: number, y: number, cents: number, display: string) {
    const edo = getEDO();
    var text = '';
    switch (display) {
        case 'cents':
            text = cents.toFixed(0) + '¢';
            break;
        case 'edosteps':
            if (!Number.isNaN(edo)) text = `${Math.round(cents / (1200 / edo))}\\${edo}`;
            else throw new Error("Can't display EDO data without matching EDO steps");
            break;
        case 'ji':
            text = ji(cents).slice(0, 2).join(', ');
            break;
        case 'udn':
            if (!Number.isNaN(edo))
                text = udn(Math.round(cents / (1200 / edo)), edo).slice(0, 2).join(', ');
            else
                throw new Error("Can't display EDO data without matching EDO steps");
            break;
    }
    return html`<td onClick=${() => { centerX = x; centerY = y; updateTable(); }}>${text}</td>`;
}

function formatRows(rows: number[][], display: string) {
    return html`${rows.map((row, y) => html`<tr>${row.map((c, x) => formatCell(x, y, c, display))}</tr>`)}`;
}

function setJIControlVisibility(visible: boolean) {
    for (const e of [integerLimitLabel, integerLimitInput, errorLimitLabel, errorLimitInput]) {
        if (visible) e.classList.remove('hidden');
        else e.classList.add('hidden');
    }
}

function updateTable() {
    try {
        const step1 = parseInterval(step1Input.value);
        const step2 = parseInterval(step2Input.value);
        const rows = rowsInput.valueAsNumber;
        const columns = columnsInput.valueAsNumber;
        const display = displayInput.value;
        setJIControlVisibility(display == 'ji');
        render(formatRows(makeRows(step1, step2, rows, columns), display), table);
        alert.textContent = '';
    } catch (e) {
        if (e instanceof Error) alert.textContent = e.message;
    }
}

integerLimitInput.addEventListener('change', regenIntervals);

for (const input of [step1Input, step2Input, rowsInput, columnsInput,
    displayInput, integerLimitInput, errorLimitInput]) {
    input.addEventListener('change', updateTable);
}

updateTable();