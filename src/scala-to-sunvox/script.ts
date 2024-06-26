// front-end

import { parseScl } from '../lib/scl.js';
import { parseKbm, defaultMap } from './kbm.js';
import { generateCurve } from './curve.js';
import { download } from '../lib/download.js';

const sclInput =
    document.querySelector('#sclInput') as HTMLInputElement;
const kbmInput =
    document.querySelector('#kbmInput') as HTMLInputElement;
const centsInput =
    document.querySelector('#centsInput') as HTMLInputElement;
const convertButton =
    document.querySelector('#convertButton') as HTMLButtonElement;
const messageArea =
    document.querySelector('#messageArea') as HTMLParagraphElement;

function reportError(err: Error) {
    messageArea.setAttribute('style', 'display: block;');
    messageArea.innerText = err.message + '.';
}

function clearError() {
    messageArea.setAttribute('style', 'display: none;')
}

convertButton.addEventListener('click', (event) => {
    const scl = sclInput.files?.item(0);
    const kbm = kbmInput.files?.item(0);
    const offset = centsInput.valueAsNumber;
    if (isNaN(offset)) {
        reportError(new Error('Invalid cents offset'));
    } else if (scl) {
        scl.text().then((sclText) => {
            const scale = parseScl(sclText);
            if (kbm) {
                kbm.text().then((kbmText) => {
                    const keymap = parseKbm(kbmText);
                    const buf = generateCurve(scale, keymap, offset);
                    finish(buf, scl.name);
                }).catch((err) => {
                    reportError(err);
                });
            } else {
                const keymap = defaultMap(scale.notes.length);
                const buf = generateCurve(scale, keymap, offset);
                finish(buf, scl.name);
            }
        }).catch((err) => {
            reportError(err);
        });
    } else {
        reportError(new Error('No scale selected'));
    }
});

function finish(buf: Uint8Array, filename: string) {
    clearError();
    try {
        const blob = new Blob([buf], { type: 'application/octet-stream' });
        download(blob, filename.replace('.scl', '.curve16bit'));
    } catch (err) {
        reportError(err as Error);
    }
}
