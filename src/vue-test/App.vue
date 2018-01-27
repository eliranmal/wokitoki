<template>
    <div class="app">
        <div v-show="isLoading" class="loader centered-content">
            <i class="fa fa-cog fa-spin fa-2x"></i>
        </div>
        <room v-if="roomName" v-bind:room-name="roomName" v-on:leave="setRoom"/>
        <welcome v-else v-on:enter="setRoom"/>
    </div>
</template>

<script>
    import storage from '../lib/storage';
    import Welcome from './components/Welcome';
    import Room from './components/Room';

    export default {
        name: 'app',
        components: {
            Welcome,
            Room,
        },
        data() {
            return {
                roomName: null,
                isLoading: true,
            };
        },
        methods: {
            setRoom(name) {
                console.log('setting room to ', name);
                this.isLoading = true;
                this.roomName = name;
                storage.set({ roomName: name }, () => {
                    console.log('saved room name to storage');
                    this.isLoading = false;
                });
            },
        },
        mounted() {
            this.isLoading = true;
            storage.get('roomName', (roomName) => {
                console.log('got room name from storage', roomName);
                // roomName = 'my-awesome-audio-chat-room';
                if (roomName) {
                    this.roomName = roomName;
                }
                this.isLoading = false;
            });
        },
    };
</script>

<style>

    .app {
        display: flex;
        justify-content: center;
        min-height: 100vh;
        padding: 60px;
    }

    .loader {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1;
        background-color: #fafafa;
    }

</style>
