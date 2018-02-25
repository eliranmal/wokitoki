
import storage from '../../lib/storage';

const mixin = {
    methods: {
        save(key, value, done) {
            this.isLoading = true;
            storage.set({[key]: value}, () => {
                console.log('saved to storage', key, value);
                if (done) {
                    done();
                } else {
                    this[key] = value;
                }
                this.isLoading = false;
            });
        },
        retrieve(key, done) {
            this.isLoading = true;
            storage.get(key, (value) => {
                console.log('got from storage', key, value);
                if (done) {
                    done(value);
                } else {
                    this[key] = value;
                }
                this.isLoading = false;
            });
        },
        clear(key, done) {
            this.isLoading = true;
            storage.remove(key, () => {
                console.log('removed from storage', key);
                if (done) {
                    done();
                } else {
                    this[key] = null;
                }
                this.isLoading = false;
            });
        },
    },
};

export default mixin;
