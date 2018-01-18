<template>
    <form class="welcome">
        <div class="title has-text-centered">
            <span class="icon">
                <i class="fa fa-microphone fa-3x"></i>
            </span>
            <h1 class="subtitle">{{ title }}</h1>
        </div>
        <div class="field has-addons">
            <div class="control is-expanded has-icons-left">
                <input class="input is-medium" type="text" placeholder="think of a good room name"
                       v-model="roomName"/>
                <span class="icon">
                    <i class="fa fa-cube fa-sm"></i>
                </span>
            </div>
            <div class="control">
                <button class="button is-info is-medium" type="submit" v-on:click.prevent="enterRoom">enter room</button>
            </div>
        </div>
    </form>
</template>

<script>
    import storage from '../../lib/storage';

    export default {
        name: 'welcome',
        data() {
            return {
                title: 'welcome',
                roomName: null,
            };
        },
        methods: {
            enterRoom() {
                console.log('entered');
                if (this.roomName) {
                    this.$emit('enter', this.roomName);
                } else {
                    storage.get('roomName', () => {
                        console.log('got room name from storage');
                        this.$emit('enter', 'my-awesome-room');
                    });
                }
            },
        },
    }
</script>

<style scoped>

</style>
