<template>
    <div id="app">
        <room v-if="roomName" v-bind:room-name="roomName" v-on:leave="setRoom">room container</room>
        <welcome v-else v-on:enter="setRoom">room form</welcome>
    </div>
</template>

<script>
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
            };
        },
        methods: {
            setRoom(name) {
                console.log('setting room to ', name);
                this.roomName = name;
            },
        },
    };
</script>

<style>

    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
    }

</style>
