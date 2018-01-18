<template>
    <div class="room">
        <div class="section field is-grouped is-fullwidth">
            <h1 class="control title is-expanded">
                <span class="icon is-large">
                    <i class="fa fa-cube fa-md"></i>
                </span>
                <span>{{ title }}</span>
            </h1>
            <div class="control">
                <button class="button is-large is-dark" type="button" title="leave" v-on:click="leave">
                    <span class="icon">
                        <i class="fa fa-bicycle fa-sm"></i>
                    </span>
                </button>
            </div>
        </div>
        <div class="peerContainer local">
            <div class="local-details">
                <div class="section field is-grouped is-fullwidth">
                    <div class="control has-icons-left is-expanded">
                        <input class="input is-large" type="text" placeholder="find a cool nick name"
                               v-model="nickName"/>
                        <span class="icon is-left">
                            <i class="fa fa-user-circle-o fa-sm"></i>
                        </span>
                    </div>
                    <div class="control">
                        <button class="button is-large is-info" type="button"
                                v-bind:title="muteLabel" v-on:click="toggleMute">
                            <span class="icon">
                                <i class="fa fa-sm" v-bind:class="isMuted ? 'fa-microphone-slash' : 'fa-microphone'"></i>
                            </span>
                        </button>
                    </div>
                </div>
                <audio id="localAudio" controls oncontextmenu="return false;" disabled></audio>
            </div>
        </div>
        <div id="remotes"></div>
    </div>
</template>

<script>
    export default {
        name: 'room',
        props: [
            'roomName',
        ],
        data() {
            return {
                title: this.roomName,
                nickName: null,
                isMuted: false,
            }
        },
        methods: {
            leave() {
                this.$emit('leave');
            },
            toggleMute() {
                this.isMuted = !this.isMuted;
                this.$emit('mute', this.isMuted);
            },
        },
        computed: {
            muteLabel() {
                return this.isMuted ? 'unmute' : 'mute';
            },
        },
        // todo - add watcher for nickName, debounce it and emit an event
    }
</script>

<style scoped>

    audio {
        display: none;
    }

    .button {
        border-radius: 50% !important;
    }

    .local {
        margin-top: 3em;
    }
</style>
