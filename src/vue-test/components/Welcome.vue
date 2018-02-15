<template>
    <div class="welcome flexbox">
        <div class="logo"></div>
        <h1>{{ i18n.title }}</h1>
        <form class="flexbox" v-on:submit.prevent="enterRoom">
            <label for="room-name">{{ i18n.roomNameLabel }}</label>
            <div class="flexbox horizontal">
                <input id="room-name" class="big fill glue" type="text"
                       v-bind:placeholder.once="i18n.roomNamePlaceholder"
                       v-bind:minlength.once="roomMinChars" v-model="roomName"/>
                <button type="submit" class="big"
                        v-bind:disabled="!isValid">{{ i18n.enterRoomLabel }}
                </button>
            </div>
        </form>
        <p class="info">{{ helpMessage }}</p>
    </div>
</template>

<script>
    import storage from '../../lib/storage';

    export default {
        name: 'welcome',
        data() {
            const roomMinChars = 3;
            return {
                i18n: {
                    title: 'wokitoki',
                    roomNameLabel: 'pick a nice name for a new channel, or join an existing one',
                    roomNamePlaceholder: 'a nice channel name',
                    enterRoomLabel: 'open',
                    help: {
                        minChars: `${roomMinChars} characters or more :)`,
                        replacedChars: 'spaces will be replaced with dashes, ok?'
                    },
                },
                roomName: null,
                roomMinChars: roomMinChars,
            };
        },
        methods: {
            enterRoom() {
                if (this.isValid) {
                    this.$emit('enter', {
                        id: this.sanitize(this.roomName),
                        name: this.trim(this.roomName),
                    });
                }
            },
            trim(text) {
                return String(text).trim();
            },
            sanitize(text) {
                return this.trim(text).replace(/\s+/g, '-');
            },
        },
        computed: {
            isValid() {
                return this.roomName && this.trim(this.roomName).length >= this.roomMinChars;
            },
            helpMessage() {
                if (!this.isValid) {
                    return this.i18n.help.minChars;
                } else if (this.roomName && this.trim(this.roomName).includes(' ')) {
                    return this.i18n.help.replacedChars;
                }
                return '';
            },
        },
    }
</script>

<style scoped>

    form {
        position: relative;
    }

    form > i {
        position: absolute;
        top: .8rem;
        left: .8rem;
        opacity: .25;
    }

    input {
        /*background: transparent url("/assets/images/marine-radio.png") 1rem 1rem no-repeat;*/
        /*background-size: 5em;*/
    }

    h1 {
        font-weight: bold;
        color: black;
    }

    .logo {
        position: relative;
        top: 37px;
        left: calc(50% - 8px);
        /* alternate positioning above the first 'i' character */
        /*left: calc(50% - 137px);*/
        width: 100%;
        height: 70px;
        margin: 0;
        padding: 0;
        background: transparent url("/assets/images/marine-radio.png") no-repeat;
        background-size: 150px;
    }

</style>
