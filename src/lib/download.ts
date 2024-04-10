// https://stackoverflow.com/questions/19327749/
export function download(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('style', 'display: none');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
}