// todo - make this into a store factory, extract all store sections into their own modules

import storage from '../lib/storage';


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
            trace(`> vuex store > mutation > key: '${key}', value: '${value}'`);
            if (key.includes('.')) {
                const seg = key.split('.');
                // naive implementation - i only have to support one use-case at the moment
                switch (seg.length) {
                    case 2:
                        state[seg[0]][seg[1]] = value;
                        break;
                }
                return;
            }
            state[key] = value;
        }
    },
};

const actions = {
    retrieve({commit}, {key, commit: doCommit = true, done = () => 1}) {
        trace(`> vuex store > action [retrieve] > key: '${key}'.`);
        storage.get(key, (value) => {
            if (value === null || typeof value === 'undefined') {
                done();
                return;
            }
            if (doCommit) {
                commit('update', {[key]: value});
            }
            done();
        });
    },
    save({commit}, {key, value, commit: doCommit = true, done = () => 1}) {
        trace(`> vuex store > action [save] > key: '${key}', value: '${value}'.`);
        storage.set({[key]: value}, () => {
            doCommit && commit('update', {[key]: value});
            done();
        });
    },
    clear({commit}, {key, commit: doCommit = true, done = () => 1}) {
        trace(`> vuex store > action [clear] > key: '${key}'.`);
        storage.remove(key, () => {
            doCommit && commit('update', {[key]: defaults[key]});
            done();
        });
    },
};

const trace = (...msg) => {
    debug && console.log(...msg);
};


export default {
    state,
    mutations,
    actions,
};
