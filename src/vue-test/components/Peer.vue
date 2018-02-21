<template>
    <div class="peerContainer"
         v-bind:class="type">
        <div class="flexbox horizontal details">
            <div class="avatar icon round"
                 v-on:click="toggleAvatarRotation"
                 v-bind:class="isAvatarRotating ? 'fa-spin' : ''"
                 v-bind:style="avatarStyle">
                <i class="fa"
                   v-bind:class="avatarIconClass"></i>
            </div>
            <output class="fill"
                    v-if="isRemote">{{ nick }}
            </output>
            <!--fixme - get two way binding on the model AND an initial value for the editable.
                fixme - find out why how to avoid v-bind:content.once="nick" - it breaks stuff-->
            <editable class="nick fill"
                      v-else
                      v-bind:style="nickInputStyle"
                      v-bind:placeholder="i18n.nickNamePlaceholder"
                      v-bind:content.once="nick"
                      v-model="nick"
                      v-on:blur="saveNickName($event)"/>
            <button type="button" class="icon"
                    v-b-tooltip.hover.html="muteButtonTooltip"
                    v-on:click="toggleMute()">
                <!--todo - remote peer icon should be a speaker-->
                <i class="fa" v-bind:class="isMuted ? 'fa-microphone-slash' : 'fa-microphone'"></i>
            </button>
        </div>
        <audio id="localAudio" controls oncontextmenu="return false;" disabled style="display: none;"
               v-if="isLocal"></audio>
    </div>
</template>

<script>

    // todo - make all this color/icon change on input typing into an independent app of an association game:
    // todo - you type in words, and press enter to push them to the list on the bottom and select all the input text, so next typing will clear the input

    import text from '../../lib/text';
    import storage from '../../lib/storage';
    import Editable from './Editable';

    export default {
        name: 'peer',
        components: {Editable},
        props: {
            type: {
                type: String,
                default: 'local',
            },
            id: String,
            nickName: String,
            isMuted: {
                type: Boolean,
                default: false,
            },
            avatarColor: String,
            avatarIcon: String,
            onMute: Function,
        },
        data() {
            return {
                i18n: {
                    nickNamePlaceholder: 'find a cool nick name'
                },
                nick: this.nickName,
                isAvatarRotating: false,
            };
        },
        mounted() {
            if (this.isLocal && !this.nickName) {
                storage.get('nickName', (name) => {
                    console.log('got nick name from storage:', name);
                    if (name) {
                        this.nick = name;
                    }
                });
            }
        },
        methods: {
            toggleMute() {
                // fixme - onMute is not a function, obviously
                const isMuted = this.onMute();
                this.isMuted = isMuted;
                this.$emit('mute', {
                    isMuted: isMuted,
                });
            },
            saveNickName(nickName) {
                this.$emit('nickName', nickName);
                storage.set({nickName}, () => {
                    console.log('nick name saved to storage:', nickName)
                });
            },
            toggleAvatarRotation() {
                this.isAvatarRotating = !this.isAvatarRotating;
            },
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
            avatarIconClass() {
                return this.icon ? `fa-${this.icon}` : 'fa-star-o';
            },
            nickInputStyle() {
                return {
                    borderColor: this.color,
                };
            },
            muteButtonTooltip() {
                return this.isMuted ? 'unmute' : 'mute';
//                 return `
// <div style="padding: .2em .2em .5em .2em; line-height: 2;">
//     ${this.isMuted ? 'unmute' : 'mute'}<br/>
//     <kbd>CMD</kbd>+<kbd>M</kbd>${typeof this.index !== 'undefined' ? '+<kbd>' + (this.index + 1) + '</kbd>' : ''}
// </div>
// `;
            },
        },
        watch: {
            nickName(newValue, oldValue) {
                console.log('nickName updated:', newValue);
                this.nick = newValue;
            },
        },
    }
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
