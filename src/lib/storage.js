window.chrome = window.chrome || {};

if (process.env.NODE_ENV === 'development') {

    // stub the chrome storage sync api with local storage implementation

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
            const req = args.shift();
            let lsArgs;
            if (typeof req === 'object') {
                // assume there is a single entry
                lsArgs = Object.entries(req)[0];
                switch (cmd) {
                    case 'get':
                        lsArgs.pop();
                        break;
                    case 'set':
                        const value = lsArgs[1];
                        if (typeof value !== 'string') {
                            lsArgs[1] = JSON.stringify(value);
                        }
                        break;
                }
            } else {
                lsArgs = req;
            }
            console.debug(`invoking localStorage.${syncToLocalFnMap[cmd]}(${JSON.stringify(lsArgs)})`);
            let result = localStorage[syncToLocalFnMap[cmd]](...lsArgs);
            console.debug('   result:', result);
            let data, res;
            if (cmd === 'get') {
                try {
                    data = JSON.parse(result);
                } catch (ex) {
                    data = result;
                }
                if (typeof data === 'undefined') {
                    data = lsArgs[1];
                }
                res = {
                    [lsArgs[0]]: data,
                }
            }
            console.debug('   response:', res);
            cb(res);
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
