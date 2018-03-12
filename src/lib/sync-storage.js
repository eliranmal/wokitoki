import namespace from './namespace';
import SyncStoragePolyfill from './sync-storage-polyfill';



if (process.env.NODE_ENV === 'development') {
    // stub the chrome storage sync api with local storage implementation
    SyncStoragePolyfill.use();
}


const trace = (ctx, cmd) => {
    return (...args) => {
        const cb = args.pop();
        console.debug(`> sync-storage > ${cmd}`, ...args);
        args.push((...args) => {
            console.debug(`> sync-storage > ${cmd} > done`, ...args);
            const runtimeError = namespace.safeGet('chrome.runtime.lastError', global);
            if (runtimeError) {
                console.debug('> sync-storage > chrome runtime invocation failed. error message:\n' + runtimeError.message);
            }
            cb(...args);
        });
        return ctx[cmd](...args);
    };
};

const get = trace(chrome.storage.sync, 'get');
const set = trace(chrome.storage.sync, 'set');
const remove = trace(chrome.storage.sync, 'remove');
const clear = trace(chrome.storage.sync, 'clear');
const size = trace(chrome.storage.sync, 'getBytesInUse');

const changeHandler = namespace.safeGet('chrome.storage.onChanged', global);
if (changeHandler) {
    changeHandler.addListener((...args) => console.log(`> sync-storage > onChange`, ...args));
}


export default {
    get,
    set,
    remove,
    clear,
    size,
};
