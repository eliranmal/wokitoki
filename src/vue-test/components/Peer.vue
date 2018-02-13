<template>
    <div class="peerContainer"
         v-bind:class="type">
        <div class="flexbox horizontal details">
            <div class="avatar icon round"
                 v-bind:style="getAvatarStyle()">
                <i class="fa"
                   v-bind:class="getAvatarIconClass()"></i>
            </div>
            <output class="fill"
                    v-if="isRemote()">{{ nick }}
            </output>
            <editable class="fill"
                      v-else
                      v-bind:style="nickInputStyle"
                      v-bind:placeholder="i18n.nickNamePlaceholder"
                      v-on:update="nick = $event"/>
            <button type="button" class="icon"
                    v-b-tooltip.hover.html="getMuteLabel()" v-on:click="toggleMute()">
                <i class="fa" v-bind:class="isMuted ? 'fa-microphone-slash' : 'fa-microphone'"></i>
            </button>
        </div>
        <audio controls oncontextmenu="return false;" disabled style="display: none;"
               v-if="!isRemote()"></audio>
    </div>
</template>

<script>
    import icons from '../../lib/icons';
    import Editable from './Editable';

    export default {
        name: 'peer',
        components: {Editable},
        props: {
            user: Object,
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
            // isNickValid() {
            //     return this.nick && this.nick.length > 0;
            // },
            getMuteLabel() {
                return `<div style="padding: 0 0 .5em; 0">${this.isMuted ? 'unmute' : 'mute'}<br/><kbd>Cmd</kbd>+<kbd>M</kbd></div>`;
            },
            hexColorFromCharCode(str = '') {
                const hex = Array.from(str)
                // text to numbers
                    .map(v => v.charCodeAt(0))
                    // scatter: group and sum
                    .reduce((accum, val, i) => {
                        accum[i % 6] += val;
                        return accum;
                    }, Array(6).fill(0))
                    // gather: lower bit-depth to hex range and stringify
                    .map(n => {
                        return (n % 16).toString(16);
                    })
                    .join('');
                return `#${hex}`;
            },
            iconFromCharCode(str = '') {
                const charCodeSum = Array.from(str)
                // text to numbers
                    .map(v => v.charCodeAt(0))
                    // sum all of them
                    .reduce((accum, val) => {
                        accum += val;
                        return accum;
                    }, 0);
                const iconIndex = charCodeSum % icons.length;
                return icons[iconIndex];
            },
            // todo - move to computed
            getAvatarStyle() {
                return {
                    borderColor: this.color,
                    backgroundColor: this.color,
                };
            },
            // todo - move to computed
            getAvatarIconClass() {
                return this.icon ? `fa-${this.icon}` : 'fa-star-o';
            },
            toggleMute() {
                const state = !this.isMuted;
                this.isMuted = state;
                this.$emit('mute', {
                    isMuted: state,
                    user: this,
                });
            },
            isRemote() {
                return !!this.user;
            }
        },
        computed: {
            nickInputStyle() {
                return {
                    borderColor: this.color,
                };
            },
            color() {
                return (this.user || {}).avatarColor || this.hexColorFromCharCode(this.nick);
            },
            icon() {
                return (this.user || {}).icon || this.iconFromCharCode(this.nick);
            },
            type() {
                return this.isRemote() ? 'remote' : 'local';
            },
        },
        // watch: {
        //     // todo - debounce the operation, and emit an event
        //     nick(newValue) {
        //         this.color = this.hexColorFromCharCode(newValue);
        //     },
        // },
    }
</script>

<style scoped>

    .details .avatar {
        margin-right: 1.5rem;
    }

    .local .details {
        border-bottom: 1px solid #ddd;
        padding-bottom: 2rem;
    }

    .local .details input,
    .local .details .avatar {
        transition-property: border-color, background-color;
        transition-duration: 330ms;
    }

    .local .details input {
        background-color: transparent;
    }

    .local .details input:focus {
        background-color: #fff;
    }

    .local .details button,
    .remote .details button {
        border-color: #555;
        background-color: #555;
    }

</style>
