<template>
    <div class="room flexbox">
        <header class="flexbox horizontal">
            <h1 class="room-name fill">{{ roomName }}</h1>
            <div class="controls flexbox horizontal pull-right">
                <button type="button" class="icon"
                        v-b-tooltip.click.blur="leaveButtonTooltip"
                        v-on:blur="leaveClicked = false"
                        v-on:click="leave">
                    <i class="fa fa-bicycle"></i>
                </button>
            </div>
        </header>
        <peer v-on:nickName="saveNickname($event)" />
        <div id="remotes" class="flexbox">
            <peer v-for="(remote, index) in remotes" v-bind:user="remote" v-bind:index="index" />
        </div>
    </div>
</template>

<script>
    import storage from '../../lib/storage';
    import Peer from './Peer';

    export default {
        components: {Peer},
        name: 'room',
        props: [
            'roomId',
            'roomName',
        ],
        data() {
            return {
                i18n: {
                    leaveRoomHelp: 'click again to leave',
                    nickNamePlaceholder: 'find a cool nick name'
                },
                // todo - plug in real remotes (use vuex?)
                remotes: [
                    {
                        nickName: 'a very very very very very very very very very long nickname',
                        isMuted: false,
                        // avatarColor: '#feb438',
                    },
                    {
                        nickName: 'monochrome',
                        isMuted: false,
                        avatarColor: '#feb438',
                    },
                    {
                        nickName: 'eliahu bagbagon harelshvili ha-rishon',
                        isMuted: false,
                        avatarColor: '#206ead',
                    },
                    {
                        nickName: 'banana',
                        isMuted: false,
                        avatarColor: '#21e1e1',
                    },
                ],
            }
        },
        methods: {
            leave() {
                if (!this.leaveClicked) {
                    this.leaveClicked = true;
                    return;
                }
                this.leaveClicked = false;
                storage.remove('roomId', () => {
                    console.log('room id removed from storage');
                    storage.remove('roomName', () => {
                        console.log('room name removed from storage');
                        this.$emit('leave');
                    });
                });
            },
            leaveButtonTooltip() {
                return this.i18n.leaveRoomHelp;
            },
            saveNickname(nickName) {
                storage.set({ nickName }, () => {
                    console.log('nick name saved to storage')
                });
            },
        },
    }
</script>

<style scoped>

    h1.room-name {
        text-align: left;
        line-height: 3rem;
    }

</style>
