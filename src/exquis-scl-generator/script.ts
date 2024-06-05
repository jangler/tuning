import { parseInterval } from "../lib/scl.js";

// The first number is steps NE; the second is steps E.
// The SW corner is unison.
const vectors: [number, number][] = [
    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
    [1, 0], [1, 1], [1, 2], [1, 3], [1, 4],
    [2, -1], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
    [3, -1], [3, 0], [3, 1], [3, 2], [3, 3],
    [4, -2], [4, -1], [4, 0], [4, 1], [4, 2], [4, 3],
    [5, -2], [5, -1], [5, 0], [5, 1], [5, 2],
    [6, -3], [6, -2], [6, -1], [6, 0], [6, 1], [6, 2],
    [7, -3], [7, -2], [7, -1], [7, 0], [7, 1],
    [8, -4], [8, -3], [8, -2], [8, -1], [8, 0], [8, 1],
    [9, -4], [9, -3], [9, -2], [9, -1], [9, 0],
    [10, -5], [10, -4], [10, -3], [10, -2], [10, -1], [10, 0],
];

function scaleNotes(stepNE: number, stepE: number): number[] {
    return vectors.map(v => v[0] * stepNE + v[1] * stepE);
}

function buildScl(description: string, notes: number[]): string {
    const lines: string[] = [];
    lines.push(`! ${description}.scl`);
    lines.push('!');
    lines.push(description);
    lines.push(vectors.length.toString());
    lines.push('!');
    lines.push(...notes.map(x => x.toFixed(5)));
    lines.push('');
    return lines.join('\r\n');
}

const resultParagraph = document.querySelector('#result') as HTMLParagraphElement;
const descriptionInput = document.querySelector('#description') as HTMLInputElement;
const step1Input = document.querySelector('#step1') as HTMLInputElement;
const step2Input = document.querySelector('#step2') as HTMLInputElement;

function regenerateScale() {
    const description = descriptionInput.value;

    // Convert steps from (up-left, up-right) to (up-right, right).
    const step1 = parseInterval(step2Input.value);
    const step2 = parseInterval(step2Input.value) - parseInterval(step1Input.value);

    resultParagraph.innerText = buildScl(description, scaleNotes(step1, step2));
}

descriptionInput.addEventListener('change', regenerateScale);
step1Input.addEventListener('change', regenerateScale);
step2Input.addEventListener('change', regenerateScale);

regenerateScale();