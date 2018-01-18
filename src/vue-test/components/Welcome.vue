<template>
    <div class="hero is-fullheight">
        <div class="hero-body">
            <form class="welcome container">
                <div class="title has-text-centered">
                    <span class="icon">
                        <i class="fa fa-magic fa-3x"></i>
                    </span>
                    <h1 class="subtitle">{{ title }}</h1>
                    <label for="room-name" class="label">think of a nice name for a new room, or join an existing one</label>
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
                <p class="help is-info" v-bind:class="isValid ? 'is-invisible' : ''">
                    {{ roomMinChars }} characters or more, no spaces
                </p>
            </form>
        </div>
    </div>
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

    .welcome {
        max-width: 500px;
    }

</style>
