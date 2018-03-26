import namespace from "../../lib/namespace";
import Logger from '../../lib/logger';


const logger = Logger.get('store: mutations');

export default {
    update(state, payload) {
        for (let [key, value] of Object.entries(payload)) {
            logger.debug(`[update] key: '${key}', value: '${value}'`);
            const oldValue = namespace.get(key, state);
            if (oldValue !== value) {
                namespace.set(key, value, state);
                logger.debug(`[update: done] key: '${key}', old value: '${oldValue}', new value: '${namespace.get(key, state)}'`);
            }
        }
    },
    delete(state, {key}) {
        logger.debug(`[delete] key: '${key}'`);
        const value = namespace.get(key, state);
        if (value) {
            namespace.remove(key, state);
            logger.debug(`[delete: done] key: '${key}'`);
        }
    },
};
