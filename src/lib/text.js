
import icons from './icons';


const asIcon = (str = '') => {
    const charCodeSum = Array.from(str)
    // text to numbers
        .map(v => v.charCodeAt(0))
        // sum all of them
        .reduce((accum, val) => {
            accum += val;
            return accum;
        }, 0);
    const iconIndex = charCodeSum % icons.length;
    return icons[iconIndex];
};

const asHexColor = (str = '') => {
    const hex = Array.from(str)
    // text to numbers
        .map(v => v.charCodeAt(0))
        // scatter: group and sum
        .reduce((accum, val, i) => {
            accum[i % 6] += val;
            return accum;
        }, Array(6).fill(0))
        // gather: lower bit-depth to hex range and stringify
        .map(n => {
            return (n % 16).toString(16);
        })
        .join('');
    return `#${hex}`;
};


export default {
    asIcon,
    asHexColor,
};
