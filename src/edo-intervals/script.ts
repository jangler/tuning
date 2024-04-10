// @ts-ignore
import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js';
import { integerLimitIntervals } from '../lib/limit.js';
import { udn } from '../lib/udn.js';
import { download } from '../lib/download.js';

const c4_note = 60;

const edoInput = document.querySelector('#edo') as HTMLInputElement;
const integerLimitInput = document.querySelector('#integerLimit') as HTMLInputElement;
const errorLimitInput = document.querySelector('#errorLimit') as HTMLInputElement;
const alert = document.getElementById('alert') as HTMLParagraphElement;
const tbody = document.querySelector('tbody') as HTMLTableSectionElement;
const reaperButton = document.querySelector('#reaperButton') as HTMLButtonElement;

// TODO: Cell colors? Could go by primes or by UDN.

var intervals = integerLimitIntervals(integerLimitInput.valueAsNumber);

integerLimitInput.addEventListener('change', () => {
    intervals = integerLimitIntervals(integerLimitInput.valueAsNumber);
});

function approximatedIntervals(cents: number, errorLimit: number): string[] {
    return [...intervals.entries()]
        .filter(([c, _]) => Math.abs(cents - c) <= errorLimit)
        .map(([_, s]) => s);
}

function updateTable() {
    try {
        const edo = edoInput.valueAsNumber;
        const errorLimit = errorLimitInput.valueAsNumber;
        const stepSize = 1200 / edo;
    
        const rows = [];
        for (var i = 1; i < edo; i++) {
            rows.push(html`
            <tr>
            <td>${i}</td>
            <td>${udn(i, edo).map(s => s.slice(0, s.length - 1)).join(', ')}</td>
            <td>${approximatedIntervals(i * stepSize, errorLimit).join(', ')}</td>
            </tr>`);
        }
        console.log(rows);
    
        render(html`${rows}`, tbody);
        alert.textContent = '';
    } catch (e) {
        if (e instanceof Error) alert.textContent = e.message;
    }
}

for (const input of [edoInput, integerLimitInput, errorLimitInput]) {
    input.addEventListener('change', updateTable);
}

updateTable();

function downloadReaperNames() {
    const edo = edoInput.valueAsNumber;
    const lines = ['# MIDI note/CC name map'];
    for (let note = 0; note <= 127; note++) {
        lines.push(`${note} ${udn(note - c4_note, edo).map(s => s.slice(0, s.length - 1)).join('/')}`);
    }
    download(new Blob([lines.map(s => s + '\r\n').join('')]), `${edo}edo.txt`);
}

reaperButton.addEventListener('click', downloadReaperNames)