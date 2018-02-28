<template>
    <div class="peerContainer"
         v-bind:class="type">
        <div class="flexbox horizontal details">
            <div class="avatar icon round"
                 v-on:click="toggleAvatarRotation"
                 v-bind:class="isAvatarRotating ? 'fa-spin' : ''"
                 v-bind:style="avatarStyle">
                <i class="fa"
                   v-bind:class="avatarIconClassName"></i>
            </div>
            <output class="fill"
                    v-if="isRemote">{{ nick }}
            </output>
            <editable class="nick fill"
                      v-else
                      v-bind:style="nickInputStyle"
                      v-bind:placeholder="i18n.nickNamePlaceholder"
                      v-model="nick"
                      v-on:blur="updateNickName($event)"/>
            <button type="button" class="icon"
                    v-b-tooltip.hover.html="muteButtonTooltip"
                    v-on:click="toggleMute()">
                <!--todo - remote peer icon should be a speaker-->
                <i class="fa" v-bind:class="muteClassName"></i>
            </button>
        </div>
        <audio id="localAudio" controls oncontextmenu="return false;" disabled style="display: none;"
               v-if="isLocal"></audio>
    </div>
</template>

<script>

    // todo - make all this color/icon change on input typing into an independent app of an association game:
    // todo - you type in words, and press enter to push them to the list on the bottom and select all the input text, so next typing will clear the input

    // todo - pass avatar icon explicitly to peers to ignore issues with different nickname due text-sanitation

    import text from '../../lib/text';
    import storageMixin from '../mixins/storage';
    import Editable from './Editable';

    export default {
        name: 'peer',
        components: {Editable},
        mixins: [storageMixin],
        props: {
            id: String,
            type: {
                type: String,
                default: 'local',
            },
            nickName: String,
            isMuted: {
                type: Boolean,
                default: false,
            },
            avatarColor: String,
            avatarIcon: String,
        },
        data() {
            return {
                i18n: {
                    nickNamePlaceholder: 'find a cool nick name'
                },
                nick: this.nickName,
                muted: this.isMuted,
                isAvatarRotating: false,
            };
        },
        mounted() {
            console.log('> mounted. this.nickName:', this.nickName);
            if (this.isLocal && !this.nickName) {
                this.retrieve('nickName', (name) => {
                    if (name) {
                        this.nick = name;
                        this.$emit('update:nickName', name);
                    }
                });
            }
        },
        computed: {
            color() {
                return this.avatarColor || this.nick ? text.asHexColor(this.nick) : '#555555';
            },
            icon() {
                return this.avatarIcon || this.nick ? text.asIcon(this.nick) : 'user-secret';
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
                return this.icon ? `fa-${this.icon}` : 'fa-star-o';
            },
            muteClassName() {
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
                console.log('> nickName updated:', newValue);
                this.nick = newValue;
                this.$emit('update:nickName', newValue);
            },
        },
        methods: {
            toggleMute() {
                this.muted = !this.muted;
                this.$emit('update:isMuted', this.muted, () => void 0);
            },
            updateNickName(nickName) {
                this.$emit('update:nickName', nickName);
                this.save('nickName', nickName, () => void 0);
            },
            toggleAvatarRotation() {
                this.isAvatarRotating = !this.isAvatarRotating;
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
