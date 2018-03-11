// todo - make this into a store factory, extract all store sections into their own modules

import storage from '../lib/syncStorage';
import namespace from '../lib/namespace';


const debug = process.env.NODE_ENV === 'development';

const state = {
    roomName: '',
    roomAction: 'join',
    local: {
        id: '',
        type: 'local',
        isMuted: true,
        nickName: '',
    },
    remotes: {},
};

const defaults = Object.freeze(Object.assign({}, state));

const mutations = {
    update(state, payload) {
        for (let [key, value] of Object.entries(payload)) {
            trace(`> store > mutation > key: '${key}', value: '${value}'`);
            const oldValue = namespace.get(key, state);
            if (namespace.get(key, state) !== value) {
                namespace.set(key, value, state);
                trace(`> store > mutation done > key: '${key}', old value: '${oldValue}', new value: '${namespace.get(key, state)}'`);
            }
        }
    },
};

const actions = {
    retrieve({commit}, {key, commit: doCommit = true, done = () => 1}) {
        trace(`> store > action [retrieve] > key: '${key}'.`);
        const defaultValue = namespace.get(key, defaults);
        storage.get({[key]: defaultValue}, (data) => {
            trace(`> store > action [retrieve] done > response:`, data);
            // chrome sync storage might return undefined on errors. avoid the commit if so
            if (doCommit && typeof data[key] !== 'undefined') {
                commit('update', {[key]: data[key]});
            }
            done();
        });
    },
    save({commit}, {key, value, commit: doCommit = true, done = () => 1}) {
        trace(`> store > action [save] > key: '${key}', value: '${value}'.`);
        storage.set({[key]: value}, () => {
            trace(`> store > action [save] done > key: '${key}', value: '${value}'`);
            doCommit && commit('update', {[key]: value});
            done();
        });
    },
    clear({commit}, {key, commit: doCommit = true, done = () => 1}) {
        trace(`> store > action [clear] > key: '${key}'.`);
        const defaultValue = namespace.get(key, defaults);
        storage.remove(key, () => {
            trace(`> store > action [clear] done > key: '${key}'`);
            doCommit && commit('update', {[key]: defaultValue});
            done();
        });
    },
};

const trace = (...msg) => {
    debug && console.debug(...msg);
};


export default {
    state,
    mutations,
    actions,
};
