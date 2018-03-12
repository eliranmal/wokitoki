import namespace from './namespace';


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
    console.debug(`> sync-storage-polyfill > invoking localStorage.${syncToLocalFnMap[cmd]}(${JSON.stringify(lsReqArgs)})`);
    let result = localStorage[syncToLocalFnMap[cmd]](...lsReqArgs);
    console.debug('> sync-storage-polyfill > result:', result);

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

    console.debug('> sync-storage-polyfill > calling callback with response:', response);
    cb(response);
}, 300);

const use = () => {
    if (!namespace.safeGet('chrome.storage.sync', global)) {
        console.debug('> sync-storage-polyfill > chrome sync storage not found, faking it with local storage');
        namespace.ensure('chrome.storage.sync', global);
        for (let fnName in syncToLocalFnMap) {
            if (syncToLocalFnMap.hasOwnProperty(fnName)) {
                chrome.storage.sync[fnName] = buildCommand(fnName);
            }
        }
    }
};


export default {
    use,
};
