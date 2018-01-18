<template>
    <form class="welcome">
        <div class="title has-text-centered">
            <span class="icon">
                <i class="fa fa-microphone fa-3x"></i>
            </span>
            <h1 class="subtitle">{{ title }}</h1>
            <label for="room-name" class="label">think of a good name for a new room, or join an existing one</label>
        </div>
        <div class="field has-addons">
            <div class="control is-expanded has-icons-left has-info">
                <input id="room-name" class="input is-medium" type="text" placeholder="room name"
                       v-bind:min="roomMinChars" v-model="roomName"/>
                <span class="icon">
                    <i class="fa fa-cube fa-sm"></i>
                </span>
            </div>
            <div class="control">
                <button class="button is-info is-medium" type="submit"
                        v-bind:disabled="!isValid" v-on:click.prevent="enterRoom">enter room</button>
            </div>
        </div>
        <p class="help is-info" v-show="!isValid">
            {{ roomMinChars }} characters or more, no spaces
        </p>
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
                roomMinChars: 10,
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
        computed: {
            isValid() {
                return this.roomName && this.roomName.length >= this.roomMinChars && !this.roomName.includes(' ');
            },
        },
    }
</script>

<style scoped>

</style>
