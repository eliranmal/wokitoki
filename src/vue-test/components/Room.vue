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
                        <button class="button is-medium" type="button" v-on:click="mute">got it</button>
                    </div>
                </div>
                <div class="field has-addons has-addons-right is-fullwidth">
                    <div class="control">
                        <button class="button is-medium" type="button" v-on:click="mute">
                            <span class="icon">
                                <!-- todo - toggle mic classname by muted state -->
                                <i class="fa fa-microphone-slash fa-sm"></i>
                            </span>
                            <span>mute</span>
                        </button>
                    </div>
                    <div class="control">
                        <button class="button is-medium" type="button" v-on:click="leave">
                            <span class="icon">
                                <i class="fa fa-bicycle fa-sm"></i>
                            </span>
                            <span>leave</span>
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
            }
        },
        methods: {
            leave() {
                this.$emit('leave');
            },
            mute() {
                this.$emit('mute');
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
