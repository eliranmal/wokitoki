import ns from './namespace';


window.chrome = window.chrome || {};

const trace = (ctx, cmd) => {
    return (...args) => {
        const cb = args.pop();
        console.debug(`> storage > ${cmd}`, ...args);
        args.push((...args) => {
            console.debug(`> storage > ${cmd} > done`, ...args);
            if (ns.safeGet('chrome.runtime.lastError')) {
                console.debug('> storage > chrome runtime invocation failed. error message:\n' + chrome.runtime.lastError.message);
            }
            cb(...args);
        });
        return ctx[cmd](...args);
    };
};

if (process.env.NODE_ENV === 'development') {

    // stub the chrome storage sync api with local storage implementation

    if (!ns.safeGet('chrome.storage.sync')) {

        console.debug('> storage > chrome sync storage not found, faking it with local storage');

        const syncToLocalFnMap = {
            get: 'getItem',
            set: 'setItem',
            remove: 'removeItem',
            size: 'length',
            clear: 'clear',
        };

        const buildCommand = (cmd) => (...args) => setTimeout(() => {
            const cb = args.pop();
            const request = args.shift();
            let key;
            let setValue;
            if (typeof request === 'object') {
                // assume there is a single entry
                key = Object.keys(request)[0];
                setValue = Object.values(request)[0];
                if (cmd === 'set') {
                    if (typeof setValue !== 'string') {
                        setValue = JSON.stringify(setValue);
                    }
                }
            } else if (typeof request === 'string') {
                key = request;
                // no need to set the value here, the only use case for a string request
                // is the remove operation, which does not have a value.
            }

            const lsReqArgs = [key];
            if (setValue) {
                lsReqArgs.push(setValue);
            }
            console.debug(`> storage > invoking localStorage.${syncToLocalFnMap[cmd]}(${JSON.stringify(lsReqArgs)})`);
            let result = localStorage[syncToLocalFnMap[cmd]](...lsReqArgs);
            console.debug('> storage > result:', result);

            let resValue, response;
            if (cmd === 'get') {
                try {
                    resValue = JSON.parse(result);
                } catch (ex) {
                    resValue = result;
                }
                if (typeof request === 'object') {
                    if (typeof resValue === 'undefined' || resValue === null) {
                        // request object has a default value as the property value, use it
                        resValue = Object.values(request)[0];
                    }
                }
                response = {
                    [key]: resValue,
                }
            }
            console.debug('> storage > calling callback with response:', response);
            cb(response);
        }, 300);

        window.chrome.storage = window.chrome.storage || {};
        window.chrome.storage.sync = window.chrome.storage.sync || {};
        for (let fnName in syncToLocalFnMap) {
            if (syncToLocalFnMap.hasOwnProperty(fnName)) {
                window.chrome.storage.sync[fnName] = buildCommand(fnName);
            }
        }
    }
}

const get = trace(chrome.storage.sync, 'get');
const set = trace(chrome.storage.sync, 'set');
const remove = trace(chrome.storage.sync, 'remove');
const clear = trace(chrome.storage.sync, 'clear');
const size = trace(chrome.storage.sync, 'getBytesInUse');

if (ns.safeGet('chrome.storage.onChanged')) {
    chrome.storage.onChanged.addListener((...args) => console.log(`> storage > onChange`, ...args));
}


export default {
    get,
    set,
    remove,
    clear,
    size,
};
