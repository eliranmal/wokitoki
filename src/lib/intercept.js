/**
 * intercepts all method calls on the passed target object, with the passed interceptor function.
 * this function will be invoked after the original function was invoked, and with the context of 
 * the original function.
 *
 * @param {object|class} target - the object or class to be intercepted.
 * @param {interceptor} interceptor - a function to be invoked on any method
 * invocation of the target.
 * @returns {object} a proxy wrapper around the target.
 */
const methods = (target, interceptor) => new Proxy(target, {
    get(target, key) {
        console.log('>>>>>>>> handler get', target, key);
        const originalValue = target[key];
        if (typeof originalValue !== 'function') {
            return Reflect.get(target, key);
        }
        return function (...args) {
            const result = originalValue.apply(this, args);
            interceptor.apply(this, [result].concat(args));
            return result;
        };
    }
});

/**
 * @name interceptor
 * @function 
 * @type function
 * @param {object} result - the result of the original function.
 * @param {...any} args - the original function's passed parameters, spread as the rest of the arguments.
 * @return undefined
 */

export default {
    methods,
};