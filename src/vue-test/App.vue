<template>
    <div class="app"
         v-bind:class="wrapperClassName">
        <loader v-bind:is-loading="isLoading"/>
        <room v-if="showRoom"
              v-bind:action="roomAction"
              v-bind:room-name="roomName"
              v-on:created="roomCreated"
              v-on:leave="leaveRoom"/>
        <welcome v-else
                 v-on:enter="enterRoom"/>
    </div>
</template>

<script>
    import storageMixin from './mixins/storage';
    import Loader from './components/Loader';
    import Welcome from './components/Welcome';
    import Room from './components/Room';

    export default {
        name: 'app',
        mixins: [
            storageMixin
        ],
        components: {
            Loader,
            Welcome,
            Room,
        },
        data() {
            return {
                roomName: null,
                roomAction: null,
                isLoading: true,
            };
        },
        mounted() {
            this.retrieve('roomAction');
            this.retrieve('roomName');
        },
        computed: {
            showRoom() {
                return this.roomAction && this.roomName;
            },
            wrapperClassName() {
                return this.showRoom ? '' : 'flexbox horizontal pack';
            },
        },
        methods: {
            enterRoom({name, action}) {
                if (action) {
                    this.save('roomAction', action);
                }
                if (name) {
                    this.save('roomName', name);
                }
            },
            leaveRoom() {
                this.clear('roomName');
                this.clear('roomAction');
            },
            roomCreated() {
                this.save('roomAction', 'join');
            }
        },
    };
</script>

<style>

    .app {
        overflow: hidden;
        min-height: 100vh;
        padding: 4rem;
    }

</style>
