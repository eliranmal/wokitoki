<template>
    <div class="app flexbox horizontal pack">
        <loader v-bind:is-loading="isLoading"/>
        <room v-if="showRoom"
              v-bind:action="roomAction"
              v-bind:name="roomName"
              v-on:created="roomCreated"
              v-on:leave="leaveRoom"/>
        <welcome v-else
                 v-on:enter="enterRoom"/>
    </div>
</template>

<script>
    import {mapState} from 'vuex';
    import async from '../lib/async';
    import Loader from './components/Loader';
    import Welcome from './components/Welcome';
    import Room from './components/Room';

    export default {
        name: 'app',
        components: {
            Loader,
            Welcome,
            Room,
        },
        data() {
            return {
                isLoading: false,
            };
        },
        mounted() {
            this.withLoader([
                done => this.$store.dispatch('retrieve', {
                    key: 'roomAction',
                    done,
                }),
                done => this.$store.dispatch('retrieve', {
                    key: 'roomName',
                    done,
                }),
            ]);
        },
        computed: {
            showRoom() {
                return !this.isLoading && this.roomAction && this.roomName;
            },
            ...mapState([
                'roomName',
                'roomAction',
            ]),
        },
        methods: {
            enterRoom({name, action}) {
                const fns = [];
                if (action) {
                    fns.push(done => this.$store.dispatch('save', {
                        key: 'roomAction',
                        value: action,
                        done,
                    }));
                }
                if (name) {
                    fns.push(done => this.$store.dispatch('save', {
                        key: 'roomName',
                        value: name,
                        done,
                    }));
                }
                if (fns.length) {
                    this.withLoader(fns);
                }
            },
            leaveRoom() {
                this.withLoader([
                    done => this.$store.dispatch('clear', {
                        key: 'roomName',
                        done,
                    }),
                    done => this.$store.dispatch('clear', {
                        key: 'roomAction',
                        done,
                    }),
                ]);
            },
            roomCreated() {
                this.$store.dispatch('save', {
                    key: 'roomAction',
                    value: 'join',
                });
            },
            withLoader(nodeFns) {
                this.isLoading = true;
                async.all(nodeFns, () => this.isLoading = false);
            },
        },
    };
</script>

<style>

    .app {
        overflow: hidden;
        min-height: 100vh;
        padding: 4rem;
        transition: padding 300ms;
    }

    .app > * {
        min-width: 40rem;
    }

    @media screen and (max-width: 800px) {
        .app > * {
            flex-grow: 1;
        }
    }

    @media screen and (max-width: 600px) {
        .app {
            padding: 3rem;
        }
    }

    @media screen and (max-width: 400px) {
        .app {
            padding: 2rem;
        }
    }

    @media screen and (orientation: portrait) {
        .app > * {
            min-width: 80%;
        }
    }

</style>
