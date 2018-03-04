<template>
    <div class="peerContainer"
         v-bind:class="type">
        <div class="flexbox horizontal details">
            <div class="avatar icon round"
                 v-on:click="toggleAvatarSpin"
                 v-bind:class="isAvatarSpinning ? 'fa-spin' : ''"
                 v-bind:style="avatarStyle"
                 v-b-tooltip.hover="id"
            >
                <i class="fa"
                   v-bind:class="avatarIconClassName"></i>
            </div>
            <output class="fill"
                    v-if="isRemote">{{ nick }}
            </output>
            <editable class="nick fill"
                      v-else
                      v-bind:disabled="nickDisabled"
                      v-bind:style="nickInputStyle"
                      v-bind:placeholder="i18n.nickNamePlaceholder"
                      v-model="nick"
                      v-on:blur="updateNickName($event)"/>
            <button type="button" class="icon"
                    v-bind:disabled="muteDisabled"
                    v-b-tooltip.hover.html="muteButtonTooltip"
                    v-on:click="toggleMute()">
                <i class="fa" v-bind:class="muteClassName"></i>
            </button>
        </div>
        <!--todo - don't use id like that, it could be duplicated-->
        <audio id="localAudio" controls oncontextmenu="return false;" disabled style="display: none;"
               v-if="isLocal"></audio>
    </div>
</template>

<script>

    import text from '../../lib/text';
    import Editable from './Editable';

    export default {
        name: 'peer',
        components: {
            Editable,
        },
        props: {
            id: String,
            type: String,
            nickName: String,
            isMuted: Boolean,
            nickDisabled: Boolean,
            muteDisabled: Boolean,
        },
        data() {
            return {
                i18n: {
                    nickNamePlaceholder: 'find a cool nick name'
                },
                nick: this.nickName,
                muted: this.isMuted,
                isAvatarSpinning: false,
            };
        },
        computed: {
            color() {
                if (this.nickDisabled) {
                    return '#555555';
                }
                return this.nick ? text.asHexColor(this.nick) : '#555555';
            },
            icon() {
                if (this.nickDisabled) {
                    return '';
                }
                return this.nick ? text.asIcon(this.nick) : 'user-secret';
            },
            isLocal() {
                return this.type === 'local';
            },
            isRemote() {
                return this.type === 'remote';
            },
            avatarStyle() {
                return {
                    borderColor: this.color,
                    backgroundColor: this.color,
                };
            },
            nickInputStyle() {
                return {
                    borderColor: this.color,
                };
            },
            avatarIconClassName() {
                return this.icon ? `fa-${this.icon}` : '';
            },
            muteClassName() {
                // todo - remote peer icon should be a speaker, but volume-off does not look like 'off' state.
                // todo - uncomment this after i have a proper icon (perhaps when switching to font-awesome 5)
                // if (this.isRemote) {
                //     return this.muted ? 'fa-volume-off' : 'fa-volume-up';
                // }
                return this.muted ? 'fa-microphone-slash' : 'fa-microphone';
            },
            muteButtonTooltip() {
                return this.muted ? 'unmute' : 'mute';
//                 return `
// <div style="padding: .2em .2em .5em .2em; line-height: 2;">
//     ${this.muted ? 'unmute' : 'mute'}<br/>
//     <kbd>CMD</kbd>+<kbd>M</kbd>${typeof this.index !== 'undefined' ? '+<kbd>' + (this.index + 1) + '</kbd>' : ''}
// </div>
// `;
            },
        },
        watch: {
            nickName(newValue, oldValue) {
                this.updateNickName(newValue);
            },
            isMuted(newValue, oldValue) {
                this.toggleMute(newValue);
            },
        },
        methods: {
            toggleMute(state = !this.muted) {
                this.muted = state;
                this.$emit('update:isMuted', this.muted);
            },
            updateNickName(nickName) {
                this.nick = nickName;
                this.$emit('update:nickName', nickName);
            },
            toggleAvatarSpin() {
                this.isAvatarSpinning = !this.isAvatarSpinning;
            },
        },
    };
</script>

<style scoped>

    .details button {
        border-color: #555;
        background-color: #555;
    }

    .details .avatar {
        margin-right: 1.5rem;
    }

    .details .avatar i {
        pointer-events: none;
    }

    .local .details {
        border-bottom: 1px solid #ddd;
        padding-bottom: 2rem;
    }

    .local .details .nick,
    .local .details .avatar {
        transition-property: border-color, background-color;
        transition-duration: 330ms;
    }

    .local .details .nick {
        background-color: transparent;
    }

    .local .details .nick:focus {
        background-color: #fff;
    }

</style>
