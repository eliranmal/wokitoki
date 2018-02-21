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
        <peer v-bind.sync="local"
              v-on:nickName="nickNameUpdated($event)"
              v-on:mute="setMuteState($event)"/>
        <div id="remotes" class="flexbox">
            <peer v-for="(remote, key) in remotes" v-bind.sync="remote"/>
        </div>
        <pre v-if="showLogger">{{ remotes | json }}</pre>
    </div>
</template>

<script>
    import audioChat from '../../lib/audio-chat';
    import storage from '../../lib/storage';
    import Peer from './Peer';

    export default {
        components: {Peer},
        name: 'room',
        props: [
            'roomName',
        ],
        data() {
            return {
                i18n: {
                    leaveRoomHelp: 'click again to leave',
                    nickNamePlaceholder: 'find a cool nick name'
                },
                local: {
                    isMuted: false,
                },
                remotes: {},
            }
        },
        methods: {
            create(roomName) {
                if (!roomName) {
                    return;
                }
                audioChat.setRoom(roomName);
                audioChat.init({
                    onLocalStream: this.showLocalPeer,
                    onPeerConnectionStateChanged: this.updateRemotePeerContainer,
                    onPeerCreated: this.addRemotePeerContainer,
                    onMessage: this.updatePeerDetails,
                });

                audioChat.createRoom(roomName, () => {
                    console.log('room created:', roomName)
                });
                this.sniffDevices();
            },
            leave() {
                if (!this.leaveClicked) {
                    this.leaveClicked = true;
                    return;
                }
                this.leaveClicked = false;

                audioChat.onLeaveRoom();
                storage.remove('roomName', () => {
                    console.log('room name removed from storage');
                    this.$emit('leave');
                });
            },
            leaveButtonTooltip() {
                return this.i18n.leaveRoomHelp;
            },
            nickNameUpdated(nickName) {
                console.log('room: nickName updated:', nickName);
                audioChat.onNickInput(nickName);
            },
            setMuteState() {
                audioChat.toggleLocalEnabled();
                this.local.isMuted = !audioChat.isLocalEnabled();
            },
            updateRemotePeerContainer(peerDomId, state, peerId) {
                console.log('remote peer updated', peerDomId, state);
                // todo - should i implement this? look for clues in the css. or maybe simplewebrtc needs this?!
                // const container = document.querySelector('#container_' + peerDomId);
                // container.className = 'peerContainer p2p' +
                //     state.substr(0, 1).toUpperCase() +
                //     state.substr(1);
                switch (state) {
                    case 'connected':
                    case 'completed':
                        // todo - implement this with disabled state instead of visibility
                        // setPeerMuteVisible(peerDomId);
                        break;
                    case 'closed':
                        this.$delete(this.remotes, peerId);
                        break;
                }
            },
            addRemotePeerContainer(peerDomId, peerId) {
                console.log('remote peer added', peerDomId, peerId);

                // todo - should i implement this?
                // container.id = 'container_' + peerDomId;

                const remote = {
                    type: 'remote',
                    id: peerId,
                    domId: peerDomId,
                };

                // todo - should i implement this?
                // mute.style.visibility = 'hidden';
                // todo - should i implement this?
                // mute.id = 'mute_' + peerDomId;

                remote.onMute = () => {
                    // todo - wire audioChat.isPeerMuted to event binding on remote peer components, put it someplace better
                    // chrome.runtime.sendMessage({channel: audioChatChannel, cmd: 'togglePeerMuted', args: [peerId]});
                    audioChat.togglePeerMuted(peerId);
                    return audioChat.isPeerMuted(peerId);
                };

                this.$set(this.remotes, remote.id, remote);
            },
            updatePeerDetails(message, peerDomId, peerId) {
                console.log('message from peer', peerId, message);
                switch (message.type) {
                    case 'nickname':
                        this.$set(this.remotes[peerId], 'nickName', message.payload.nick);
                        break;
                }
            },
            sniffDevices() {
                if (!(navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.RTCPeerConnection)) {
                    // // FIXME: show "sorry, get a modern browser" (recommending Edge)
                    // document.getElementById('supportWarning').style.display = 'block';
                    // document.querySelector('form#createRoom>button').disabled = true;
                    console.error('no bananas. get a better browser!');
                } else if (navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                    navigator.mediaDevices.enumerateDevices()
                        .then(function (devices) {
                            var mics = devices.filter(function (device) {
                                return device.kind === 'audioinput';
                            });
                            var hasMics = mics.length;
                            console.log('mics:', hasMics);
                            // todo - implement this in the app view
                            // if (hasMics) {
                            //     document.getElementById('requirements').style.display = 'none';
                            // } else {
                            //     document.getElementById('microphoneWarning').style.display = 'block';
                            //     document.querySelector('form#createRoom>button').disabled = true;
                            // }
                            audioChat.onSniffDevices({
                                hasMics: hasMics,
                                // todo - find out why does it need to be a variable, and what to put in it
                                queryGum: true,
                            });
                        });
                }
            },
            showLocalPeer() {
                var localAudio = document.getElementById('localAudio');
                localAudio.disabled = false;
                localAudio.volume = 0;

                // todo - should i implement this?
                // document.querySelector('.local').style.display = 'block';
            },
        },
        computed: {
            showLogger() {
                return process.env.NODE_ENV === 'development';
            }
        },
        watch: {
            // todo - this could be useful if i move the audio api outside
            // roomName(newValue, oldValue) {
            //     console.log('roomName changed:', newValue);
            //     if (newValue !== oldValue) {
            //         this.create(newValue);
            //     }
            // },
        },
        mounted() {
            console.log('mounted. roomName:', this.roomName);
            this.create(this.roomName);
        },
    }
</script>

<style scoped>

    h1.room-name {
        text-align: left;
        line-height: 3rem;
    }

</style>
