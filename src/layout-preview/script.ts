// @ts-ignore
import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { parseInterval } from '../lib/scl.js';

const step1Input = document.querySelector('#step1') as HTMLInputElement;
const step2Input = document.querySelector('#step2') as HTMLInputElement;
const showCentsInput = document.querySelector('#showCents') as HTMLInputElement;
const showUDNInput = document.querySelector('#showUDN') as HTMLInputElement;
const showJIInput = document.querySelector('#showJI') as HTMLInputElement;
const table = document.querySelector('table') as HTMLTableElement;

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

function stepsAreEDO(): boolean {
    return step1Input.value.includes('\\') && step2Input.value.includes('\\');
}

function formatCell(cents: number) {
    return html`<td>
    ${showCentsInput.checked && html`<div>${cents.toFixed(1)}</div>`}
    ${showUDNInput.checked && stepsAreEDO() && html`<div>TODO: UDN</div>`}
    ${showJIInput.checked && html`<div>TODO: JI</div>`}
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

for (const input of [step1Input, step2Input, showCentsInput, showUDNInput, showJIInput]) {
    input.addEventListener('change', updateTable);
}

updateTable();