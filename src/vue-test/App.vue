<template>
    <div class="app">
        <div v-show="isLoading" class="loader centered-content">
            <i class="fa fa-cog fa-spin fa-2x"></i>
        </div>

        <!--fixme - no need to set room on both-->
        <room v-if="room && room.id" v-bind:room-name="room.name" v-bind:room-id="room.id" v-on:leave="setRoom"/>
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
                room: {
                    id: null,
                    name: null,
                },
                isLoading: true,
            };
        },
        methods: {
            setRoom(room) {
                // todo - find the bug here - why do i save an undefined value ?
                console.log('setting room to ', room);
                this.isLoading = true;
                this.room = room;
                if (room) {
                    // todo - remove the nested calls when working with chrome sync storage
                    storage.set({roomId: room.id}, () => {
                        console.log('saved room id to storage');
                        storage.set({roomName: room.name}, () => {
                            console.log('saved room name to storage');
                            this.isLoading = false;
                        });
                    });
                } else {
                    this.isLoading = false;
                }
            },
        },
        mounted() {
            this.isLoading = true;
            // todo - remove the nested calls when working with chrome sync storage
            storage.get('roomId', (id) => {
                console.log('got room id from storage', id);
                if (id) {
                    this.room.id = id;
                }
                storage.get('roomName', (name) => {
                    console.log('got room name from storage', name);
                    if (name) {
                        this.room.name = name;
                    }
                    this.isLoading = false;
                });
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
        padding: 60px;
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
