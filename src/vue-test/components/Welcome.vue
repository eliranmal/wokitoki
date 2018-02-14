<template>
    <div class="welcome flexbox">
        <div class="logo"></div>
        <h1>{{ i18n.title }}</h1>
        <label for="room-name">{{ i18n.roomNameLabel }}</label>
        <form class="flexbox horizontal"
              v-on:submit.prevent="enterRoom">
            <!--<i class="fa fa-wifi fa-2x"></i>-->
            <!--<i class="logo-icon"></i>-->
            <input id="room-name" class="big fill glue" type="text"
                   v-bind:placeholder.once="i18n.roomNamePlaceholder"
                   v-bind:minlength.once="roomMinChars" v-model="roomName"/>
            <!-- todo - if input is empty, change button text -->
            <button type="submit" class="big"
                    v-bind:disabled="!isValid">{{ i18n.enterRoomLabel }}
            </button>
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
                console.log('entered');
                console.log('isValid', this.isValid);

                if (this.isValid) {
                    this.$emit('enter', this.sanitize(this.roomName));
                }
            },
            sanitize(text) {
                return String(text).trim().replace(/\s+/g, '-');
            },
        },
        computed: {
            isValid() {
                return this.roomName && String(this.roomName).trim().length >= this.roomMinChars;
            },
            helpMessage() {
                if (!this.isValid) {
                    return this.i18n.help.minChars;
                } else if (this.roomName && this.roomName.includes(' ')) {
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
        /*padding: 0 1em 0 5rem;*/
        padding: 0 1em;
        border-right: 0 none;
        /*background: transparent url("../../../../../Downloads/marine-radio.png") 1rem 1rem no-repeat;*/
        /*background-size: 5em;*/
    }

    h1 {
        font-weight: bold;
        color: black;
    }

    .logo,
    .logo-icon {
        background: transparent url("../../../../../Downloads/marine-radio.png") no-repeat;
    }

    .logo {
        position: relative;
        top: 37px;
        left: calc(50% - 8px);
        /*left: calc(50% - 137px);*/
        width: 100%;
        height: 70px;
        margin: 0;
        padding: 0;
        background-size: 150px;
    }

    .logo-icon {
        width: 3rem;
        height: 3rem;
        background-size: 200%;
    }

</style>
