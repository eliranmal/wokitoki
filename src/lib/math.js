const avg = (arr) => arr.reduce((accum, val, i) => {
    accum += val;
    if (i === arr.length - 1) {
        accum = accum / arr.length;
    }
    return accum;
}, 0);

export default {
    avg,
};
