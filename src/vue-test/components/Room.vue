<template>
    <div class="room flexbox">
        <header class="flexbox horizontal">
            <h1 class="room-name fill">{{ roomName }}</h1>
            <div class="controls flexbox horizontal pull-right">
                <button type="button" class="icon"
                        v-b-tooltip.click.blur="i18n.leaveRoomHelp"
                        v-on:blur="leaveClicked = false"
                        v-on:click="leave">
                    <i class="fa fa-bicycle"></i>
                </button>
            </div>
        </header>
        <peer v-bind.sync="local"
              v-on:nickName="publishNickName($event)"
              v-on:mute="setMuteState($event)"/>
        <div id="remotes" class="flexbox">
            <peer v-for="(remote, key) in remotes" v-bind.sync="remote"/>
        </div>

        <!--todo - debugging... remove this later-->
        <pre>{{ remotes | json }}</pre>
    </div>
</template>

<script>
    import audioChat from '../../lib/audio-chat';
    import devices from '../../lib/devices';
    import Peer from './Peer';

    export default {
        components: {Peer},
        name: 'room',
        props: [
            'roomName',
            'action',
        ],
        data() {
            return {
                i18n: {
                    leaveRoomHelp: 'click again to leave',
                },
                local: {
                    isMuted: false,
                },
                remotes: {},
            }
        },
        mounted() {
            this.sniffDevices(err => {
                if (err) {
                    console.error(err);
                    return;
                }
                this.init();
            });
        },
        methods: {
            init() {
                // todo - is this redundant now? get rid of all the state inside audio-chat
                audioChat.setRoom(this.roomName);
                audioChat.init({
                    onReady: this.invokeAction,
                    onLocalStream: this.showLocal,
                    onPeerConnectionStateChanged: this.updateRemote,
                    onPeerCreated: this.addRemote,
                    onMessage: this.updatePeerDetails,
                });
                audioChat.start();
            },
            invokeAction() {
                console.log('> ready > action:', this.action);
                if (this.action) {
                    console.log('invoking action');
                    this[this.action]();
                }
            },
            create() {
                audioChat.createRoom(this.roomName, () => {
                    console.log('room created:', this.roomName);
                    this.$emit('created', this.roomName);
                });
            },
            join() {
                audioChat.joinRoom(this.roomName, () => {
                    console.log('room joined:', this.roomName);
                    if (this.local.nickName) {
                        console.log('publishing local nick:', this.local.nickName);
                        audioChat.publishNickName(this.local.nickName);
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
                delete this.roomName;
                this.$emit('leave');
            },
            publishNickName(nickName) {
                console.log('room: nickName updated:', nickName);
                audioChat.updateNick(nickName);
            },
            setMuteState() {
                audioChat.toggleLocalEnabled();
                this.local.isMuted = !audioChat.isLocalEnabled();
            },
            updateRemote(peerId, state) {
                console.log('remote peer updated', peerId, state);
                // todo - should i implement this? look for clues in the css
                // const container = document.querySelector('#container_' + peerDomId);
                // container.className = 'peerContainer p2p' +
                //     state.substr(0, 1).toUpperCase() +
                //     state.substr(1);
                switch (state) {
                    case 'connected':
                    case 'completed':
                        // todo - implement this with disabled state instead of visibility
                        // setPeerMuteVisible(peerId);
                        break;
                    case 'closed':
                        this.$delete(this.remotes, peerId);
                        break;
                }
            },
            addRemote(peerId) {
                console.log('remote peer added', peerId);

                const remote = {
                    type: 'remote',
                    id: peerId,
                };

                // todo - should i implement this?
                // mute.style.visibility = 'hidden';

                remote.onMute = () => {
                    // todo - wire audioChat.isPeerMuted to event binding on remote peer components, put it someplace better
                    // chrome.runtime.sendMessage({channel: audioChatChannel, cmd: 'togglePeerMuted', args: [peerId]});
                    audioChat.togglePeerMuted(peerId);
                    return audioChat.isPeerMuted(peerId);
                };

                this.$set(this.remotes, remote.id, remote);
            },
            updatePeerDetails(peerId, message) {
                console.log('message from peer', peerId, message);
                switch (message.type) {
                    case 'nickname':
                        this.$set(this.remotes[peerId], 'nickName', message.payload.nick);
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
            showLocal() {
                var localAudio = document.getElementById('localAudio');
                localAudio.disabled = false;
                localAudio.volume = 0;

                // todo - should i implement this?
                // document.querySelector('.local').style.display = 'block';
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

</style>
