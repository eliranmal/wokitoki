
const get = chrome.storage.sync.get;

const set = chrome.storage.sync.set;

const remove = chrome.storage.sync.remove;

const size = chrome.storage.sync.getBytesInUse;

const clear = chrome.storage.sync.clear;


export default {
    get,
    set,
    remove,
    clear,
    size,
};
