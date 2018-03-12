
const safe = (fn) => {
    return (...args) => {
        let res;
        try {
            res = fn(...args);
        } catch (ex) {
            // don't judge me. i want to return undefined here
        }
        return res;
    };
};

const get = (key, obj) => {
    if (key.includes('.')) {
        const ns = key.split('.');
        switch (ns.length) {
            case 2:
                return obj[ns[0]][ns[1]];
            case 3:
                return obj[ns[0]][ns[1]][ns[2]];
        }
    } else {
        return obj[key];
    }
};

const set = (key, val, obj) => {
    if (key.includes('.')) {
        const ns = key.split('.');
        switch (ns.length) {
            case 2:
                obj[ns[0]][ns[1]] = val;
                break;
            case 3:
                obj[ns[0]][ns[1]][ns[2]] = val;
                break;
        }
    } else {
        obj[key] = val;
    }
};

const ensure = (key, obj) => {
    if (key.includes('.')) {
        const ns = key.split('.');
        return ns.reduce((ac, k, i) => {
            const val = ac[k];
            if (typeof val === 'undefined' || !(val instanceof Object)) {
                ac[k] = {};
            }
            ac = ac[k];
            return ac;
        }, obj);
    }
};


export default {
    get,
    set,
    ensure,
    safeGet: safe(get),
};
