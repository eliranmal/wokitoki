import Promise from 'bluebird';
import Logger from './logger';


const logger = Logger.get('async');


const noop = () => 1;

const all = (nodeFns, done = noop) => {
    const promises = [].concat(nodeFns).map(fn => {
        return Promise.promisify(fn)();
    });
    Promise.all(promises).then(done).catch(e => {
        logger.error(e);
    });
};


export default {
    all,
};
