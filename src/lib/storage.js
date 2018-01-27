
if (process.env.NODE_ENV === 'development') {

    if (!chrome || !chrome.storage || !chrome.storage.sync) {
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
                        args = [key, data[key]];
                        // assume there is a single entry
                        break;
                    }
                }
            }
            cb(localStorage[syncToLocalFnMap[cmd]](...args));
        }, 1000);
        window.chrome = window.chrome || {};
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
