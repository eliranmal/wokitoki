<template>
    <div class="app">
        <loader v-bind:is-loading="isLoading" />
        <room v-if="roomName" v-bind:room-name="roomName" v-on:leave="leave"/>
        <welcome v-else v-on:enter="enter"/>
    </div>
</template>

<script>
    import storage from '../lib/storage';
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
                roomName: null,
                isLoading: true,
                showRoom: false,
            };
        },
        mounted() {
            this.retrieveRoom();
        },
        methods: {
            enter(roomName) {
                if (!roomName) {
                    return;
                }
                this.saveRoom(roomName);
            },
            leave() {
                this.clearRoom();
            },
            saveRoom(name) {
                this.isLoading = true;
                storage.set({roomName: name}, () => {
                    console.log('saved room name to storage', name);
                    this.roomName = name;
                    this.isLoading = false;
                });
            },
            retrieveRoom() {
                this.isLoading = true;
                storage.get('roomName', (name) => {
                    console.log('got room name from storage:', name);
                    this.roomName = name;
                    this.isLoading = false;
                });
            },
            clearRoom() {
                this.isLoading = true;
                storage.remove('roomName', () => {
                    console.log('removed room name from storage');
                    this.roomName = null;
                    this.isLoading = false;
                });
            },
        },
    };
</script>

<style>

    .app {
        /* todo - i'm not sure i like this effect. decide what to do here */
        /*display: flex;*/
        /*justify-content: center;*/
        overflow: hidden;
        min-height: 100vh;
        padding: 4rem;
    }

</style>
