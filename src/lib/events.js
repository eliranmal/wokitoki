import commands from './commands';
import Logger from './logger';


const logger = Logger.get('events');

function apiCommandListener(api, channel) {
    return function commandListener(req, sender, sendResponse) {
        if (channel && req.channel && channel !== req.channel) {
            return false;
        }
        if (req.cmd && api[req.cmd]) {
            try {
                var res = api[req.cmd].apply(api, req.args);
                if (typeof res !== 'undefined') {
                    logger.log('api:request', req);
                    logger.log('api:response', res);
                    sendResponse(res);
                } else {
                    logger.log('api:command', req);
                }
            } catch (ex) {
                logger.error('api:error', req);
                logger.error(ex);
            }
        }
    }
}

function userCommandListener(command) {
    const fn = commands[command];
    if (typeof fn === 'function') {
        logger.log('user:command', command);
        fn();
    }
}


export default {
    apiCommandListener: apiCommandListener,
    userCommandListener: userCommandListener,
};

