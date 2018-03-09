import math from './math';
import array from './array';


const typeMap = new Map(Object.entries({
    hex: {
        formatter(n) {
            return (n % 256).toString(16).padStart(2, '0');
        },
        render(colors) {
            return `#${colors.join('')}`;
        },
        parse(color) {
            // todo - can i get rid of the custom splitter, and just invoke asPairs() ?
            return color.replace(/#/, '').split({
                [Symbol.split](str, limit) {
                    return array.asPairs(str.split(''));
                }
            });
        },
    },
    rgb: {
        formatter(n) {
            return (n % 256).toString(10);
        },
        render(colors) {
            return `rgb(${colors.join(',')})`;
        },
        parse(color) {
            return color.replace(/rgb\(|\)/, '').split(',');
        },
    },
}));

const hexToRgb = (colors) => {
    return colors.map(n => Number.parseInt(n, 16))
};

const parse = (color) => {
    if (color.startsWith('#')) {
        return typeMap.get('hex').parse(color);
    } else if (color.startsWith('rgb')) {
        return typeMap.get('rgb').parse(color);
    }
};

const fromText = (str = '', format = 'hex', raw = false) => {
    const colors = Array.from(str)
    // text to numbers
        .map(v => v.charCodeAt(0))
        // scatter: group and sum
        .reduce((accum, val, i) => {
            accum[i % 3] += val;
            return accum;
        }, Array(3).fill(0))
        // gather: lower bit-depth to hex-color range and stringify
        .map(typeMap.get(format).formatter);

    if (raw) {
        return colors;
    }
    return typeMap.get(format).render(colors);
};

const isDark = (color) => {
    let colors = parse(color);
    colors = hexToRgb(colors);
    const avg = math.avg(colors);
    return avg < 160;
};


export default {
    fromText,
    isDark,
};
