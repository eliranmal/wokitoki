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
                        v-bind:disabled="!isValid">{{ enterRoomLabel }}
                </button>
            </div>
        </form>
        <p class="info"
           v-if="!isValid">{{ helpMessage }}</p>
        <a href="#" class="info"
           v-if="isValid"
           v-on:click.prevent="toggleAction">{{ actionMessage }}</a>
    </div>
</template>

<script>
    import Config from '../../../conf';

    export default {
        name: 'welcome',
        data() {
            return {
                i18n: {
                    title: 'wokitoki',
                    roomNameLabel: 'join an existing channel, or pick a nice name for a new one',
                    roomNamePlaceholder: 'a nice channel name',
                    createRoomLabel: 'create',
                    joinRoomLabel: 'join',
                    action: {
                        join: 'i want to join an existing channel',
                        create: 'i want to create a new channel',
                    },
                    help: {
                        minChars: `${Config.roomNameMinChars} characters or more :)`,
                    },
                },
                action: 'join',
                roomName: null,
                roomMinChars: Config.roomNameMinChars,
            };
        },
        computed: {
            isValid() {
                return this.roomName && this.trim(this.roomName).length >= this.roomMinChars;
            },
            enterRoomLabel() {
                return this.action === 'create' ? this.i18n.createRoomLabel : this.i18n.joinRoomLabel;
            },
            helpMessage() {
                return this.i18n.help.minChars;
            },
            actionMessage() {
                return this.action === 'create' ? this.i18n.action.join : this.i18n.action.create;
            },
        },
        methods: {
            enterRoom() {
                if (this.isValid) {
                    this.$emit('enter', {
                        name: this.trim(this.roomName),
                        action: this.action,
                    });
                }
            },
            trim(text) {
                return String(text).trim();
            },
            toggleAction() {
                this.action = this.action === 'create' ? 'join' : 'create';
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
        top: .6rem;
        left: .6rem;
        opacity: .25;
    }

    h1 {
        font-weight: bold;
        color: black;
    }

    a.info {
        align-self: center;
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
        background: transparent url("../../../assets/images/marine-radio.png") no-repeat;
        background-size: 150px;
    }

</style>
