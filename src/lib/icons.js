import {icons as svgicons} from 'vue-svgicon';


const names = Object.keys(svgicons)
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
    const iconIndex = charCodeSum % names.length;
    return names[iconIndex];
};

const random = () => {
    const iconIndex = Math.floor(Math.random() * names.length);
    return names[iconIndex];
};


export default {
    names,
    fromText,
    random,
};
