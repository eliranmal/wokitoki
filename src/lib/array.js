
const asPairs = (arr) => {
    return arr.reduce((ac, v, i) => {
        if (i % 2) {
            let index = Math.floor(i / 2);
            ac[index] = ac[index] + v;
        } else {
            ac.push(v);
        }
        return ac;
    }, []);
};

export default {
    asPairs,
};
