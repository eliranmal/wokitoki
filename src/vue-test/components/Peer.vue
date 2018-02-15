<template>
    <div class="peerContainer"
         v-bind:class="type">
        <div class="flexbox horizontal details">
            <div class="avatar icon round"
                 v-on:click="toggleAvatarRotation"
                 v-bind:style="avatarStyle">
                <i class="fa"
                   v-bind:class="avatarIconClass"></i>
            </div>
            <output class="fill"
                    v-if="isRemote">{{ nick }}
            </output>
            <editable class="nick fill"
                      v-else
                      v-bind:style="nickInputStyle"
                      v-bind:placeholder="i18n.nickNamePlaceholder"
                      v-on:input="nick = $event"
                      v-on:blur="publishNickName($event)"/>
            <button type="button" class="icon"
                    v-b-tooltip.hover.html="muteButtonTooltip"
                    v-on:click="toggleMute()">
                <i class="fa" v-bind:class="isMuted ? 'fa-microphone-slash' : 'fa-microphone'"></i>
            </button>
        </div>
        <audio controls oncontextmenu="return false;" disabled style="display: none;"
               v-if="!isRemote"></audio>
    </div>
</template>

<script>

    // todo - make all this color/icon change on input typing into an independent app of an association game:
    // todo - you type in words, and press enter to push them to the list on the bottom and select all the input text, so next typing will clear the input

    import text from '../../lib/text';
    import Editable from './Editable';

    export default {
        name: 'peer',
        components: {Editable},
        props: {
            user: Object,
            index: Number,
        },
        data() {
            const defaultData = {
                i18n: {
                    nickNamePlaceholder: 'find a cool nick name'
                },
                isMuted: false,
                nick: (this.user || {}).nickName,
            };
            return Object.assign(defaultData, this.user);
        },
        methods: {
            toggleMute() {
                this.isMuted = !this.isMuted;
                this.$emit('mute', {
                    isMuted: this.isMuted,
                    user: this.user,
                });
            },
            publishNickName(name) {
                this.$emit('nickName', name);
            },
            toggleAvatarRotation(e) {
                const el = e.target;
                if (this.isAvatarRotating) {
                    el.classList.remove('fa-spin');
                    this.isAvatarRotating = false;
                } else {
                    el.classList.add('fa-spin');
                    this.isAvatarRotating = true;
                }
            },
        },
        computed: {
            color() {
                return (this.user || {}).avatarColor || text.asHexColor(this.nick);
            },
            icon() {
                return (this.user || {}).icon || text.asIcon(this.nick);
            },
            type() {
                return this.isRemote ? 'remote' : 'local';
            },
            isRemote() {
                return !!this.user;
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
