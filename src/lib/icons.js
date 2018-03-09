import svgicon from 'vue-svgicon';


const icons = Object.keys(svgicon.icons)
    .filter(icon => icon !== 'empty');

const fromText = (str = '') => {
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

const random = () => {
    const iconIndex = Math.floor(Math.random() * icons.length);
    return icons[iconIndex];
};


export default {
    fromText,
    random,
};
