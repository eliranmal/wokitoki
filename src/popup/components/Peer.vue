<template>
    <div class="peerContainer"
         v-bind:class="type">
        <div class="flexbox horizontal details">
            <div class="avatar icon round"
                 v-on:click="toggleAvatarSpin"
                 v-bind:class="isAvatarSpinning ? 'spin' : ''"
                 v-bind:style="avatarStyle">
                <icon v-bind="avatarIcon"/>
            </div>
            <output class="fill"
                    v-if="isRemote"
                    v-text="remoteNickText"
                    v-bind:style="remoteNickStyle"></output>
            <editable class="nick fill"
                      v-else
                      v-bind:disabled="nickDisabled"
                      v-bind:style="nickInputStyle"
                      v-bind:placeholder="i18n.nickNamePlaceholder"
                      v-model="nick"
                      v-on:blur="updateNickName($event)"/>
            <button type="button" class="icon" id="mute-button"
                    v-bind:disabled="muteDisabled"
                    v-b-tooltip.hover.html="muteButtonTooltip"
                    v-on:click="muteClicked">
                <icon v-bind="muteIcon"/>
            </button>
        </div>
        <audio controls oncontextmenu="return false;" style="display: none;"
               v-if="isLocal" ref="localAudio"></audio>
    </div>
</template>

<script>

    import Logger from '../../lib/logger';
    import icons from '../../lib/icons';
    import colors from '../../lib/colors';
    import Icon from './Icon';
    import Editable from './Editable';

    const logger = Logger.get('peer');

    export default {
        name: 'peer',
        components: {
            Icon,
            Editable,
        },
        props: {
            id: String,
            type: String,
            nickName: String,
            isMuted: Boolean,
            nickDisabled: Boolean,
            muteDisabled: Boolean,
            audioDisabled: Boolean,
        },
        data() {
            return {
                i18n: {
                    nickNamePlaceholder: 'find a cool nick name',
                    anonymousRemote: 'anonymous',
                    unknownRemote: 'unknown',
                    muted: 'click to unmute',
                    unmuted: 'click to mute',
                },
                nick: this.nickName,
                muted: this.isMuted,
                isAvatarSpinning: false,
            };
        },
        mounted() {
            logger.debug('mounted > this.audioDisabled:', this.audioDisabled);
            this.setAudioDisabled(this.audioDisabled);
        },
        computed: {
            isLocal() {
                return this.type === 'local';
            },
            isRemote() {
                return this.type === 'remote';
            },
            isDark() {
                return colors.isDark(this.color);
            },
            color() {
                if (this.nickDisabled) {
                    return '#555555';
                }
                return this.nick ? colors.fromText(this.nick) : '#555555';
            },
            icon() {
                if (this.nickDisabled) {
                    if (this.isRemote) {
                        return 'flaticon/nerd/050-nerd';
                    }
                    return '';
                }
                // todo - get a proper icon for the anonymous mode? or stick with this one? i dunno.
                return this.nick ? icons.fromText(this.nick) : 'flaticon/nerd/039-nerd-1';
                // return this.nick ? icons.fromText(this.nick) : 'flaticon/nerd/050-nerd';
            },
            remoteNickText() {
                if (this.nickDisabled) {
                    return this.i18n.unknownRemote;
                }
                if (this.nick === '') {
                    return this.i18n.anonymousRemote;
                }
                return this.nick;
            },
            remoteNickStyle() {
                if (this.nickDisabled || this.nick === '') {
                    return {
                        color: '#aaa',
                        fontStyle: 'italic',
                    };
                }
                return {};
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
                    theme: this.isDark ? 'dark' : 'light',
                    name: this.icon
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
                    theme: 'dark',
                };
            },
            muteButtonTooltip() {
                return this.muted ? this.i18n.muted : this.i18n.unmuted;
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
            audioDisabled(newValue, oldValue) {
                this.setAudioDisabled(newValue);
            },
        },
        methods: {
            muteClicked() {
                this.$root.$emit('bv::hide::tooltip', 'mute-button');
                this.$emit('update:isMuted', !this.muted);
            },
            toggleMute(state) {
                this.muted = state;
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
            setAudioDisabled(state) {
                const localAudio = this.$refs.localAudio;
                if (!localAudio) {
                    return;
                }
                logger.debug(`setAudioDisabled > new value: ${!!state}, old value: ${localAudio.disabled}.`);
                localAudio.disabled = !!state;
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
        margin-right: 1rem;
    }

    /* todo - create a tiles mode, and enable to toggle tiles/list */
    /*.details .avatar.icon {*/
    /*width: 5.4em;*/
    /*height: 5.4em;*/
    /*padding: calc((5.4em - 3.817em) / 2 + 5px);*/
    /*}*/

    .local .details {
        border-bottom: 1px solid #ddd;
        padding-bottom: 2rem;
        margin-bottom: .666rem;
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
