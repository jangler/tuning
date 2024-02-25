"use strict";
// The first number is steps NE; the second is steps E. This is for an Exquis
// in standard tuning, meaning that the two outermost "columns" of pads are
// duplicate notes. The SW corner of the non-duplicate area is unison.
const vectors = [
    [0, 0], [0, 1], [0, 2], [0, 3],
    [1, 0], [1, 1], [1, 2],
    [2, -1], [2, 0], [2, 1], [2, 2],
    [3, -1], [3, 0], [3, 1],
    [4, -2], [4, -1], [4, 0], [4, 1],
    [5, -2], [5, -1], [5, 0],
    [6, -3], [6, -2], [6, -1], [6, 0],
    [7, -3], [7, -2], [7, -1],
    [8, -4], [8, -3], [8, -2], [8, -1],
    [9, -4], [9, -3], [9, -2],
    [10, -5], [10, -4], [10, -3], [10, -2],
];
function scaleNotes(stepNE, stepE) {
    return vectors.map(v => v[0] * stepNE + v[1] * stepE);
}
function buildScl(description, notes) {
    const lines = [];
    lines.push(`! ${description}.scl`);
    lines.push('!');
    lines.push(description);
    lines.push(vectors.length.toString());
    lines.push('!');
    lines.push(...notes.map(x => x.toFixed(5)));
    lines.push('');
    return lines.join('\r\n');
}
const resultParagraph = document.querySelector('#result');
const descriptionInput = document.querySelector('#description');
const step1Input = document.querySelector('#step1');
const step2Input = document.querySelector('#step2');
function regenerateScale() {
    const description = descriptionInput.value;
    const step1 = step1Input.valueAsNumber;
    const step2 = step2Input.valueAsNumber;
    resultParagraph.innerText = buildScl(description, scaleNotes(step1, step2));
}
descriptionInput.addEventListener('change', regenerateScale);
step1Input.addEventListener('change', regenerateScale);
step2Input.addEventListener('change', regenerateScale);
regenerateScale();
