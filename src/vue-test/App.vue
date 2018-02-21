<template>
    <div class="app">
        <div v-show="isLoading" class="loader centered-content">
            <i class="fa fa-cog fa-spin fa-2x"></i>
        </div>

        <!--fixme - no need to set room on both-->
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
            setRoom(roomName) {
                console.log('setting room name to ', roomName);
                this.isLoading = true;
                this.roomName = roomName;
                if (roomName) {
                    storage.set({roomName: roomName}, () => {
                        console.log('saved room name to storage');
                        this.isLoading = false;
                    });
                } else {
                    this.isLoading = false;
                }
            },
        },
        mounted() {
            this.isLoading = true;
            storage.get('roomName', (name) => {
                console.log('got room name from storage:', name);
                if (name) {
                    this.roomName = name;
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
        overflow: hidden;
        min-height: 100vh;
        padding: 4rem;
    }

    .loader {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1;
        background-color: #f6f6f6;
    }

</style>
