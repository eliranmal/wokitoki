
if (process.env.NODE_ENV === 'development') {

    /**
     * fake sync api polyfill
     */
    if (!chrome || !chrome.storage || !chrome.storage.sync) {
        const command = (...args) => setTimeout(args.pop(), 0);
        window.chrome = window.chrome || {};
        window.chrome.storage = window.chrome.storage || {};
        window.chrome.storage.sync = window.chrome.storage.sync || {
            get: command,
            set: command,
            remove: command,
            clear: command,
            size: command,
        };
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
