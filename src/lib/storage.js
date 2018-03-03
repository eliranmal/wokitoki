
window.chrome = window.chrome || {};

if (process.env.NODE_ENV === 'development') {

    if (!chrome.storage || !chrome.storage.sync) {
        const syncToLocalFnMap = {
            get: 'getItem',
            set: 'setItem',
            remove: 'removeItem',
            size: 'length',
            clear: 'clear',
        };
        const buildCommand = (cmd) => (...args) => setTimeout(() => {
            const cb = args.pop();
            if (cmd === 'set') {
                const data = args.shift();
                for (let key in data) {
                    if (data.hasOwnProperty(key)) {
                        let value = data[key];
                        if (typeof value !== 'string') {
                            value = JSON.stringify(value);
                        }
                        args = [key, value];
                        // assume there is a single entry
                        break;
                    }
                }
            }
            let result = localStorage[syncToLocalFnMap[cmd]](...args);
            if (cmd === 'get') {
                try {
                    result = JSON.parse(result);
                } catch (ex) {
                    console.debug('failed parsing result, returning it as-is');
                }
            }
            cb(result);
        }, 300);
        window.chrome.storage = window.chrome.storage || {};
        window.chrome.storage.sync = window.chrome.storage.sync || {};
        for (let fn in syncToLocalFnMap) {
            if (syncToLocalFnMap.hasOwnProperty(fn)) {
                window.chrome.storage.sync[fn] = buildCommand(fn);
            }
        }
    }
}


const get = chrome.storage.sync.get;

const set = chrome.storage.sync.set;

const remove = chrome.storage.sync.remove;

const clear = chrome.storage.sync.clear;

const size = chrome.storage.sync.getBytesInUse;


export default {
    get,
    set,
    remove,
    clear,
    size,
};
