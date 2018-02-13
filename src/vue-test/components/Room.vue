<template>
    <div class="room flexbox">
        <h1>{{ i18n.title }}</h1>
        <div class="flexbox horizontal controls pull-right">
            <button type="button" class="icon"
                    v-b-tooltip.hover="i18n.leaveRoomLabel"
                    v-on:click="leave">
                <i class="fa fa-bicycle"></i>
            </button>
        </div>
        <peer />
        <div id="remotes" class="flexbox">
            <peer v-for="remote in remotes" v-bind:user="remote" />
        </div>
    </div>
</template>

<script>
    import storage from '../../lib/storage';
    import Peer from "./Peer";

    export default {
        components: {Peer},
        name: 'room',
        props: [
            'roomName',
        ],
        data() {
            return {
                i18n: {
                    title: this.roomName,
                    leaveRoomLabel: 'leave',
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
                const isConfirmed = window.confirm('really?');
                if (!isConfirmed) {
                    return;
                }
                this.$emit('leave');
                storage.remove('roomName', () => {
                    console.log('room name removed from storage')
                });
            },
        },
    }
</script>

<style scoped>

    .controls {
        position: absolute;
        top: 2rem;
        right: 2rem;
    }

    .controls button {
        margin: 0 1rem;
    }

    .controls button:last-of-type {
        margin-right: 0;
    }

</style>
