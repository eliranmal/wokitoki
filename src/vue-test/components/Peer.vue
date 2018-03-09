<template>
    <div class="peerContainer"
         v-bind:class="type">
        <!-- todo - it might make sense to make the avatar/input/buttons big when peer is local -->
        <div class="flexbox horizontal details">
            <div class="avatar icon round"
                 v-on:click="toggleAvatarSpin"
                 v-bind:class="isAvatarSpinning ? 'spin' : ''"
                 v-bind:style="avatarStyle"
                 v-b-tooltip.hover.html="avatarTooltip">
                <svgicon v-bind="avatarIcon" v-bind:style="avatarIconStyle"/>
            </div>
            <output class="fill"
                    v-if="isRemote">{{ nick }}</output>
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
                <svgicon v-bind="muteIcon"/>
            </button>
        </div>
        <!--todo - don't use id like that, it could be duplicated-->
        <audio id="localAudio" controls oncontextmenu="return false;" disabled style="display: none;"
               v-if="isLocal"></audio>
    </div>
</template>

<script>

    import icons from '../../lib/icons';
    import colors from '../../lib/colors';
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
            isLocal() {
                return this.type === 'local';
            },
            isRemote() {
                return this.type === 'remote';
            },
            color() {
                if (this.nickDisabled) {
                    return '#555555';
                }
                return this.nick ? colors.fromText(this.nick) : '#555555';
            },
            icon() {
                if (this.nickDisabled) {
                    return 'empty';
                }
                // todo - get a proper icon for the anonymous mode
                return this.nick ? icons.fromText(this.nick) : 'flaticon/nerd/039-nerd-1';
                // return this.nick ? icons.fromText(this.nick) : 'flaticon/nerd/050-nerd';
            },
            isDark() {
                return colors.isDark(this.color);
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
            avatarIcon() {
                return {
                    name: this.icon
                };
            },
            avatarIconStyle() {
                return {
                    fill: this.isDark ? '#ffffff' : '#000000',
                    stroke: this.isDark ? '#000000' : '#ffffff',
                };
            },
            muteIcon() {
                let name;
                if (this.isRemote) {
                    name = this.muted ? 'flaticon/misc/007-music' : 'flaticon/misc/008-audio-volume';
                } else {
                    name = this.muted ? 'flaticon/misc/010-technology-3' : 'flaticon/misc/009-voice-recording';
                }
                return {
                    name,
                    width: '26',
                    height: '26',
                };
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
                this.$emit('muteToggled', {
                    id: this.id,
                    muted: this.muted,
                });
            },
            updateNickName(nickName) {
                this.nick = nickName;
                this.$emit('update:nickName', nickName);
            },
            toggleAvatarSpin() {
                this.isAvatarSpinning = !this.isAvatarSpinning;
            },
            avatarTooltip() {
                // tooltips are good for debugging, and more things
                return `<pre style="color: #fff; text-align: left; white-space: pre-wrap; font-size: 12px; padding: .5em;">
   id: ${this.id}
 type: ${this.type}
 nick: ${this.nick}
 mute: ${!!this.muted}
 spin: ${this.isAvatarSpinning}
 icon: ${this.icon}
color: ${this.color}
</pre>`;
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
