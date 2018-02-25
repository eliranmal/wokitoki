
const store = {
    debug: process.env.NODE_ENV === 'development',
    state: {
        action: 'join',
    },
    get(key) {
        trace(this.debug, `get triggered. key: ${key}, result value: ${this.state[key]}`);
        return this.state[key];
    },
    set(key, value) {
        trace(this.debug, `set triggered. key: ${key}, value: ${value}`);
        this.state[key] = value;
    },
    clear(key) {
        trace(this.debug, `clear triggered. key: ${key}`);
        this.state[key] = null;
    },
    toggle(key, value1, value2) {
        trace(this.debug, `toggle triggered. key: ${key}, value 1: ${value1}, value 2: ${value2}`);
        this.state[key] = this.state[key] === value1 ? value2 : value1;
    },
};

const trace = (debug, ...msg) => {
    if (debug) {
        console.log(...msg);
    }
};


export default store;
