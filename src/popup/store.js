// todo - make this into a store factory, extract all store sections into their own modules

import storage from '../lib/sync-storage';
import namespace from '../lib/namespace';
import Logger from '../lib/logger';


const logger = Logger.get('store');

const state = {
    roomName: '',
    roomAction: 'join',
    local: {
        id: '',
        type: 'local',
        isMuted: true,
        nickName: '',
        nickDisabled: true,
        muteDisabled: true,
    },
};

const defaults = Object.freeze(Object.assign({}, state));

const mutations = {
    update(state, payload) {
        for (let [key, value] of Object.entries(payload)) {
            logger.debug(`mutation > update > key: '${key}', value: '${value}'`);
            const oldValue = namespace.get(key, state);
            if (oldValue !== value) {
                namespace.set(key, value, state);
                logger.debug(`mutation done > update > key: '${key}', old value: '${oldValue}', new value: '${namespace.get(key, state)}'`);
            }
        }
    },
    delete(state, {key}) {
        logger.debug(`mutation > delete > key: '${key}'`);
        const value = namespace.get(key, state);
        if (value) {
            namespace.remove(key, state);
            logger.debug(`mutation done > delete > key: '${key}'`);
        }
    },
};

const actions = {
    retrieve({commit}, {key, commit: doCommit = true, done = () => 1}) {
        logger.debug(`action [retrieve] > key: '${key}'.`);
        const defaultValue = namespace.get(key, defaults);
        storage.get({[key]: defaultValue}, (data) => {
            logger.debug(`action [retrieve] done > response:`, data);
            // chrome sync storage might return undefined on errors. avoid the commit if so
            if (doCommit && typeof data[key] !== 'undefined') {
                commit('update', {[key]: data[key]});
            }
            done();
        });
    },
    save({commit}, {key, value, commit: doCommit = true, done = () => 1}) {
        logger.debug(`action [save] > key: '${key}', value: '${value}'.`);
        storage.set({[key]: value}, () => {
            logger.debug(`action [save] done > key: '${key}', value: '${value}'`);
            doCommit && commit('update', {[key]: value});
            done();
        });
    },
    clear({commit}, {key, commit: doCommit = true, done = () => 1}) {
        logger.debug(`action [clear] > key: '${key}'.`);
        const defaultValue = namespace.get(key, defaults);
        storage.remove(key, () => {
            logger.debug(`action [clear] done > key: '${key}'`);
            doCommit && commit('update', {[key]: defaultValue});
            done();
        });
    },
};


export default {
    state,
    mutations,
    actions,
};
