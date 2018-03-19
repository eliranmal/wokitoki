import namespace from './namespace';
import SyncStoragePolyfill from './sync-storage-polyfill';
import Logger from './logger';


const logger = Logger.get('sync-storage');


SyncStoragePolyfill.use();


const trace = (ctx, cmd) => {
    return (...args) => {
        const cb = args.pop();
        logger.debug(`${cmd}`, ...args);
        args.push((...args) => {
            logger.debug(`${cmd} > done`, ...args);
            const runtimeError = namespace.safeGet('chrome.runtime.lastError', global);
            if (runtimeError) {
                logger.debug('chrome runtime invocation failed. error message:\n' + runtimeError.message);
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
    changeHandler.addListener((...args) => logger.log(`onChange`, ...args));
}


export default {
    get,
    set,
    remove,
    clear,
    size,
};
