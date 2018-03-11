
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

export default {
    get,
    set,
};
