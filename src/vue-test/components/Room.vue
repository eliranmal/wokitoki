<template>
    <div class="room">
        <div class="title has-text-centered">
            <span class="icon">
                <i class="fa fa-cube fa-3x"></i>
            </span>
            <h1 class="subtitle">{{ title }}</h1>
        </div>
        <div class="peerContainer local">
            <div class="local-details">
                <div class="field has-addons is-fullwidth">
                    <div class="control is-expanded has-icons-left">
                        <input class="input is-medium" type="text" placeholder="find a cool nick name"
                               v-model="nickName"/>
                        <span class="icon">
                            <i class="fa fa-asterisk fa-sm"></i>
                        </span>
                    </div>
                    <div class="control">
                        <button class="button is-medium is-info" type="button" v-on:click="mute">got it</button>
                    </div>
                </div>
                <div class="field has-addons has-addons-right is-fullwidth">
                    <div class="control">
                        <button class="button is-medium" type="button" v-on:click="mute">
                            <span>{{ muteLabel }}</span>
                            <span class="icon">
                                <i class="fa fa-sm" v-bind:class="isMuted ? 'fa-microphone-slash' : 'fa-microphone'"></i>
                            </span>
                        </button>
                    </div>
                    <div class="control">
                        <button class="button is-medium" type="button" v-on:click="leave">
                            <span>leave</span>
                            <span class="icon">
                                <i class="fa fa-bicycle fa-sm"></i>
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
            mute() {
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

</style>
