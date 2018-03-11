import Promise from 'bluebird';


const noop = () => 1;

const all = (nodeFns, done = noop) => {
    const promises = [].concat(nodeFns).map(fn => {
        return Promise.promisify(fn)();
    });
    Promise.all(promises).then(done).catch(e => {
        console.error(e);
    });
};


export default {
    all,
};
