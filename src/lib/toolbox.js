/**
 * @param {number} num
 */
export function sizeofFmt(num, suffix = 'B') {
    const units = ['', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi'];
    for (let unit of units) {
        if (Math.abs(num) < 1024.0) {
            return `${num.toFixed(1)} ${unit}${suffix}`;
        }
        num /= 1024.0;
    }
    return `${num.toFixed(1)}Yi${suffix}`;
}

/**
 * @param {string} value
 */
export function round(value, digits = 4) {
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toFixed(digits);
}
