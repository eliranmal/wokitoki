<template>
    <div class="room flexbox">
        <header class="flexbox horizontal">
            <h1 class="room-name fill">{{ name }}</h1>
            <div class="controls flexbox horizontal pull-right">
                <button type="button" class="icon"
                        v-b-tooltip.click.blur="i18n.leaveRoomHelp"
                        v-on:blur="leaveClicked = false"
                        v-on:click="leave">
                    <icon name="flaticon/misc/011-bicycle" width="36" height="36" />
                </button>
            </div>
        </header>
        <peer v-bind.sync="local"/>
        <div id="remotes" class="flexbox">
            <peer v-for="(remote, id) in remotes"
                  v-bind.sync="remote"
                  v-bind:key="id"
                  v-on:muteToggled="setRemoteMuteState"/>
        </div>
    </div>
</template>

<script>
    import {mapState} from 'vuex';
    import audioChat from '../../lib/audio-chat';
    import devices from '../../lib/devices';
    import Icon from './Icon';
    import Peer from './Peer';

    export default {
        name: 'room',
        components: {
            Icon,
            Peer,
        },
        props: [
            'name',
        ],
        data() {
            return {
                i18n: {
                    leaveRoomHelp: 'click again to leave',
                },
            }
        },
        mounted() {
            // todo - think about moving all the retrieve operations to app load time, to do it all at once.
            // todo - create a new method in the store to refresh the persisted state from storage (will retrieve
            // todo - everything at once using async.all)
            this.$set(this.local, 'nickDisabled', true);
            this.$store.dispatch('retrieve', {
                key: 'local.nickName',
                done: () => this.$set(this.local, 'nickDisabled', false),
            });
            this.$set(this.local, 'muteDisabled', true);
            this.$store.dispatch('retrieve', {
                key: 'local.isMuted',
                done: () => this.$set(this.local, 'muteDisabled', false),
            });

            this.sniffDevices(err => {
                if (err) {
                    console.error(err);
                    return;
                }
                this.init();
            });
        },
        computed: {
            ...mapState({
                local: 'local',
                remotes: 'remotes',
                action: 'roomAction',
            }),
        },
        watch: {
            'local.nickName': {
                handler(newValue, oldValue) {
                    if (newValue === oldValue) {
                        return;
                    }
                    this.publishNickName(newValue);
                    this.$store.dispatch('save', {
                        key: 'local.nickName',
                        value: newValue,
                        commit: false,
                    });
                },
                deep: true,
            },
            'local.isMuted': {
                handler(newValue, oldValue) {
                    this.setMuteState(newValue);
                    this.$store.dispatch('save', {
                        key: 'local.isMuted',
                        value: newValue,
                        commit: false,
                    });
                },
                deep: true,
            },
        },
        methods: {
            init() {
                audioChat.init({
                    onReady: this.open,
                    onConnectionReady: this.setLocalId,
                    onLocalStream: this.showLocal,
                    onPeerConnectionStateChanged: this.updateRemote,
                    onPeerCreated: this.addRemote,
                    onMessage: this.updatePeerDetails,
                });
                audioChat.start();
            },
            open() {
                if (this.action) {
                    console.log(`invoking ${this.action}()`);
                    this[this.action]();
                }
            },
            create() {
                audioChat.createRoom(this.name, () => {
                    console.log('room created:', this.name);
                    this.$emit('created', this.name);
                });
            },
            join() {
                audioChat.joinRoom(this.name, () => {
                    console.log('room joined:', this.name);
                    if (this.local.nickName) {
                        this.publishNickName(this.local.nickName);
                    }
                });
            },
            leave() {
                if (!this.leaveClicked) {
                    this.leaveClicked = true;
                    return;
                }
                this.leaveClicked = false;

                audioChat.leaveRoom();
                this.$emit('leave');
            },
            publishNickName(nickName) {
                console.log('> publishing nickName:', nickName);
                audioChat.updateNick(nickName);
            },
            setMuteState(state) {
                console.log('> setting mute state:', state);
                audioChat.setLocalEnabled(!state);
            },
            setRemoteMuteState({id, muted}) {
                console.log(' > updating remote mute state', id, muted);
                audioChat.setPeerMuted(id, muted);
            },
            addRemote(peerId) {
                console.log('> remote peer added', peerId);

                const remote = {
                    id: peerId,
                    type: 'remote',
                    isMuted: audioChat.isPeerMuted(peerId),
                    nickDisabled: true,
                    muteDisabled: true,
                };

                // todo - should i implement this?
                // mute.style.visibility = 'hidden';

                this.$set(this.remotes, remote.id, remote);
            },
            updateRemote(peerId, state) {
                console.log('> remote peer updated', peerId, state);
                // todo - should i implement this? look for clues in the css
                // const container = document.querySelector('#container_' + peerDomId);
                // container.className = 'peerContainer p2p' +
                //     state.substr(0, 1).toUpperCase() +
                //     state.substr(1);
                switch (state) {
                    case 'connected':
                    case 'completed':
                        this.$set(this.remotes[peerId], 'muteDisabled', false);
                        break;
                    case 'closed':
                        this.$delete(this.remotes, peerId);
                        break;
                }
            },
            updatePeerDetails(peerId, message) {
                console.log('message from peer', peerId, message);
                switch (message.type) {
                    case 'nickname':
                        this.$set(this.remotes[peerId], 'nickName', message.payload.nick);
                        if (this.remotes[peerId].nickDisabled) {
                            this.$set(this.remotes[peerId], 'nickDisabled', false);
                        }
                        break;
                }
            },
            sniffDevices(done) {
                // todo - move this to App
                if (!devices.hasBrowserSupport()) {
                    // fixme - show 'sorry, get a modern browser'
                    console.error('no bananas. get a better browser!');
                    return done(new Error('no support'));
                }
                devices.hasMics((err, hasMics) => {
                    console.log('hasMics:', hasMics);
                    // todo - implement this in the app view
                    // if (hasMics) {
                    //     document.getElementById('requirements').style.display = 'none';
                    // } else {
                    //     document.getElementById('microphoneWarning').style.display = 'block';
                    //     document.querySelector('form#createRoom>button').disabled = true;
                    // }
                    if (!hasMics) {
                        return done(new Error('no mics'));
                    }
                    done();
                });
            },

            showLocal(stream) {
                console.log('> local stream', stream);

                var localAudio = document.getElementById('localAudio');
                localAudio.disabled = false;
                localAudio.volume = 0;

                // todo - should i implement this?
                // document.querySelector('.local').style.display = 'block';
            },

            setLocalId(sessionId) {
                this.$set(this.local, 'id', sessionId);
            },
        },
    }
</script>

<style scoped>

    h1.room-name {
        margin-top: -1rem;
        line-height: 4.5rem;
        text-align: left;
        word-break: break-word;
        word-wrap: break-word;
    }

    pre {
        font-size: 14px;
    }

</style>
