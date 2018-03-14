/*
 stub the chrome storage sync api with local storage implementation
 */

import namespace from './namespace';


const cmdMap = {
    get: 'getItem',
    set: 'setItem',
    remove: 'removeItem',
    size: 'length',
    clear: 'clear',
};

const buildCommand = (cmd) => (...args) => setTimeout(() => {
    const cb = args.pop();
    const request = args.shift();

    const lsReqArgs = resolveLocalStorageArgs(cmd, request);
    console.debug(`> sync-storage-polyfill > invoking local storage ${cmdMap[cmd]}() with args:`, lsReqArgs);

    let result = localStorage[cmdMap[cmd]](...lsReqArgs);
    if (result) {
        console.debug('> sync-storage-polyfill > result:', result);
    }

    const response = buildResponse(cmd, request, result);
    console.debug('> sync-storage-polyfill > calling callback with response:', response);
    cb(response);
}, 300);

const resolveLocalStorageArgs = (cmd, request) => {
    let key, val;

    switch (typeof request) {
        case 'object':
            // assume there is a single entry
            key = Object.keys(request)[0];
            val = Object.values(request)[0];
            if (cmd === 'set') {
                if (typeof val !== 'string') {
                    val = JSON.stringify(val);
                }
            }
            break;
        case 'string':
            key = request;
            // no need to set the value here, the only use case for a string request
            // is the remove operation, which does not have a value.
            break;
    }

    const lsReqArgs = [key];
    if (val) {
        lsReqArgs.push(val);
    }
    return lsReqArgs;
};

const buildResponse = (cmd, request, lsResult) => {
    let key, val, response;

    if (cmd === 'get') {
        try {
            val = JSON.parse(lsResult);
        } catch (ex) {
            val = lsResult;
        }
        if (typeof request === 'object') {
            key = Object.keys(request)[0];
            if (typeof val === 'undefined' || val === null) {
                // request object has a default value as the property value, use it
                val = Object.values(request)[0];
            }
        }
        response = {
            [key]: val,
        }
    }

    return response;
};

const use = () => {
    if (namespace.safeGet('chrome.storage.sync', global)) {
        console.debug('> sync-storage-polyfill > chrome sync storage found, no need to fake it');
        return;
    }
    console.debug('> sync-storage-polyfill > chrome sync storage not found, faking it with local storage');
    namespace.ensure('chrome.storage.sync', global);
    Object.keys(cmdMap).forEach(fnName => {
        chrome.storage.sync[fnName] = buildCommand(fnName);
    });
};


export default {
    use,
};
