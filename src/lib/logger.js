
const get = (name) => {
    return ['log', 'info', 'warn', 'error', 'debug'].reduce((accum, cmd) => {
        if (cmd === 'debug' && process.env.NODE_ENV === 'production') {
            accum[cmd] = () => void 0; // no-op
        } else {
            accum[cmd] = console[cmd].bind(console, `[${name}]`);
        }
        return accum;
    }, {});
};

export default {
    get,
};