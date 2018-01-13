import commands from './commands';


function apiCommandListener(api, channel) {
    return function commandListener(req, sender, sendResponse) {
        if (channel && req.channel && channel !== req.channel) {
            return false;
        }
        if (req.cmd && api[req.cmd]) {
            try {
                var res = api[req.cmd].apply(api, req.args);
                if (typeof res !== 'undefined') {
                    console.log('api:request', req);
                    console.log('api:response', res);
                    sendResponse(res);
                } else {
                    console.log('api:command', req);
                }
            } catch (ex) {
                console.error('api:error', req);
                console.error(ex);
            }
        }
    }
}

function userCommandListener(command) {
    const fn = commands[command];
    if (typeof fn === 'function') {
        console.log('user:command', command);
        fn();
    }
}


export default {
    apiCommandListener: apiCommandListener,
    userCommandListener: userCommandListener,
};

