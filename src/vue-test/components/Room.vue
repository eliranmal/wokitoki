<template>
    <div class="room flexbox">
        <h1>
            <!--<i class="fa fa-wifi"></i>-->
            {{ i18n.title }}
        </h1>
        <!--<button type="button" class="big"-->
        <!--v-bind:title="muteLabel" v-on:click="toggleMute">-->
        <!--&lt;!&ndash;<i class="fa" v-bind:class="isMuted ? 'fa-microphone-slash' : 'fa-microphone'"></i>&ndash;&gt;-->
        <!--<i class="fa" v-bind:class="isMuted ? 'fa-user-secret' : 'fa-microphone'"></i>-->
        <!--<span>{{ muteLabel }}</span>-->
        <!--</button>-->
        <div class="flexbox horizontal controls pull-right">
            <!--<i class="fa fa-podcast fa-3x"></i>-->
            <!--<i class="fa fa-wifi fa-3x"></i>-->
            <button type="button"
                    v-bind:title.once="i18n.leaveRoomLabel"
                    v-on:click="leave">
                <i class="fa fa-bicycle"></i>
                <span>{{ i18n.leaveRoomLabel }}</span>
            </button>
        </div>
        <div class="peerContainer local">
            <div class="flexbox horizontal local-details">
                <!--<div class="avatar"-->
                <!--v-bind:style="nickButtonStyle"-->
                <!--v-on:click="refreshAvatarColor"></div>-->
                <!-- todo - avatar will be just a color circle. make it so the color is generated using the nickname as a seed (if nickname is given) -->
                <input type="text" class="fill"
                       v-bind:style="nickInputStyle"
                       v-bind:placeholder.once="i18n.nickNamePlaceholder"
                       v-model="nickName"/>
                <button type="button"
                        v-bind:style="nickButtonStyle"
                        v-on:click="refreshAvatarColor">ok
                </button>
                <button type="button"
                        v-bind:title="muteLabel" v-on:click="toggleMute">
                    <i class="fa" v-bind:class="isMuted ? 'fa-microphone-slash' : 'fa-microphone'"></i>
                    <!--<i class="fa" v-bind:class="isMuted ? 'fa-user-secret' : 'fa-microphone'"></i>-->
                    <!--<span>{{ muteLabel }}</span>-->
                </button>
            </div>
            <audio id="localAudio" controls oncontextmenu="return false;" disabled></audio>
        </div>
        <div id="remotes" class="flexbox">
            <!--todo - this is a fake remote for dev-->
            <div class="flexbox horizontal remote-details">
                <output class="fill"
                        v-bind:style="nickInputStyle">{{ nickName }}
                </output>
                <button type="button"
                        v-bind:title="muteLabel" v-on:click="toggleMute">
                    <i class="fa" v-bind:class="isMuted ? 'fa-microphone-slash' : 'fa-microphone'"></i>
                    <!--<i class="fa" v-bind:class="isMuted ? 'fa-user-secret' : 'fa-microphone'"></i>-->
                    <!--<span>{{ muteLabel }}</span>-->
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import storage from '../../lib/storage';

    export default {
        name: 'room',
        props: [
            'roomName',
        ],
        data() {

            return {
                i18n: {
                    title: this.roomName,
                    leaveRoomLabel: 'leave',
                    nickNamePlaceholder: 'find a cool nick name'
                },
                nickName: null,
                isMuted: false,
                avatarColor: '#555',
            }
        },
        methods: {
            leave() {
                const isConfirmed = window.confirm('really?');
                if (!isConfirmed) {
                    return;
                }
                this.$emit('leave');
                storage.remove('roomName', () => {
                    console.log('room name removed from storage')
                });
            },
            toggleMute() {
                this.isMuted = !this.isMuted;
                this.$emit('mute', this.isMuted);
            },
            randomHexColor() {
                return `#${[...Array(3)].map(v => (Math.floor(Math.random() * 255)).toString(16)).join('')}`;
            },
            refreshAvatarColor() {
                this.avatarColor = this.randomHexColor();
            },
        },
        computed: {
            muteLabel() {
                return this.isMuted ? 'unmute' : 'mute';
                // return this.isMuted ? 'hush' : 'speak';
            },
            nickInputStyle() {
                return {
                    borderColor: this.avatarColor,
                };
            },
            nickButtonStyle() {
                return {
                    borderColor: this.avatarColor,
                    backgroundColor: this.avatarColor,
                };
            },
        },
        // todo - add watcher for nickName, debounce it and emit an event
    }
</script>

<style scoped>

    audio {
        display: none;
    }

    h1 > i {
        opacity: .25;
    }

    .controls button,
    .avatar {
        width: 2.2em;
        height: 2.2em;
        line-height: 2.2;
        margin: 0 .5em;
        padding: 0;
        border-radius: 50%;
    }

    /*.avatar {*/
    /*margin: 0 .5em;*/
    /*}*/

    /*button.big {*/
    /*margin-bottom: 5rem;*/
    /*}*/

    input {
        /*line-height: calc(2.2em - 2px);*/
    }

    .local-details,
    .remote-details {
        /*margin-top: 3em;*/
    }

    .remote-details {
    }

    .local-details {
        border-bottom: 1px solid #ccc;
        padding-bottom: 2rem;
    }

    .controls {
        position: absolute;
        top: 1rem;
        right: 1rem;
        border-bottom: 0 none;

        padding-bottom: 3rem;
        margin-bottom: 2rem;
    }

    .controls button:last-of-type {
        margin-right: 0;
    }

</style>
