
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

const get = (key, obj = global) => {
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


export default {
    get,
    set,
    safeGet: safe(get),
    safeSet: safe(set),
};
