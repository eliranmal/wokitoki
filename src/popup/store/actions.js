import storage from "../../lib/sync-storage";
import namespace from "../../lib/namespace";
import state from "./state";
import Logger from '../../lib/logger';


const logger = Logger.get('store: actions');

const defaults = JSON.parse(JSON.stringify(state));

export default {
    retrieve({commit}, {key, commit: doCommit = true, done = () => 1}) {
        logger.debug(`[retrieve] key: '${key}'.`);
        const defaultValue = namespace.get(key, defaults);
        storage.get({[key]: defaultValue}, (data) => {
            logger.debug(`[retrieve: done] response:`, data);
            // chrome sync storage might return undefined on errors. avoid the commit if so
            if (doCommit && typeof data[key] !== 'undefined') {
                commit('update', {[key]: data[key]});
            }
            done();
        });
    },
    save({commit}, {key, value, commit: doCommit = true, done = () => 1}) {
        logger.debug(`[save] key: '${key}', value: '${value}'.`);
        storage.set({[key]: value}, () => {
            logger.debug(`[save: done] key: '${key}', value: '${value}'`);
            doCommit && commit('update', {[key]: value});
            done();
        });
    },
    clear({commit}, {key, commit: doCommit = true, done = () => 1}) {
        logger.debug(`[clear] key: '${key}'.`);
        const defaultValue = namespace.get(key, defaults);
        storage.remove(key, () => {
            logger.debug(`[clear: done] key: '${key}'`);
            doCommit && commit('update', {[key]: defaultValue});
            done();
        });
    },
};
