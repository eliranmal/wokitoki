<template>
    <div class="room flexbox">
        <header class="flexbox horizontal">
            <h1 class="fill">{{ name }}</h1>
            <div class="controls flexbox horizontal pull-right">
                <button type="button" class="icon leave"
                        v-b-tooltip.click.blur="i18n.leaveRoomHelp"
                        v-on:blur="leaveClicked = false"
                        v-on:click="leave">
                    <icon name="flaticon/misc/011-bicycle" width="36" height="36" theme="dark"/>
                </button>
            </div>
        </header>
        <peer v-bind.sync="local"/>
        <div id="remotes" class="flexbox fill remotes">
            <loader v-bind="remotesLoader"/>
            <peer v-for="(remote, id) in remotes"
                  v-bind.sync="remote"
                  v-bind:key="id"
                  v-on:muteToggled="setRemoteMuteState"/>
        </div>
    </div>
</template>

<script>
    import {mapState} from 'vuex';
    import Config from '../../../config';
    import Logger from '../../lib/logger';
    import audioChat from '../../lib/audio-chat';
    import devices from '../../lib/devices';
    import Icon from '../components/Icon';
    import Peer from '../components/Peer';
    import Loader from '../components/Loader';

    const logger = Logger.get('room');

    export default {
        name: 'room',
        components: {
            Loader,
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
                    remotesLoader: {
                        initialize: 'connecting...',
                        join: 'joining room...',
                        create: 'creating room...',
                        wait: 'waiting for peers...',
                        lookupFailed: [
                            'no one seems to be here.',
                            'ask someone to join, or refresh the page'
                        ],
                    },
                },
                remotes: {},
                remotesLookupTimeout: false,
                remotesLoaderText: null,
            };
        },
        mounted() {
            // todo - there's a library for all of the stuff below, look it up on github

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
                    logger.error(err);
                    return;
                }
                this.init();
            });
        },
        computed: {
            remotesLoader() {
                return {
                    isLoading: !Object.keys(this.remotes).length,
                    text: this.remotesLoaderText,
                };
            },
            ...mapState({
                local: 'local',
                action: 'roomAction',
            }),
        },
        watch: {
            'local.nickName': {
                handler(newValue, oldValue) {
                    this.publishNickName(newValue);
                    if (newValue === oldValue) {
                        return;
                    }
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
                    if (newValue === oldValue) {
                        return;
                    }
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
                logger.debug('init');
                audioChat.init({
                    onReady: this.open,
                    onConnectionReady: this.setupConnection,
                    onLocalStream: this.showLocal,
                    onPeerConnectionStateChanged: this.updateRemote,
                    onPeerCreated: this.addRemote,
                    onMessage: this.updatePeerDetails,
                });
                audioChat.start();

                this.remotesLoaderText = this.i18n.remotesLoader.initialize;
            },

            open() {
                logger.debug(`open > action:`, this.action);
                if (!this.action) {
                    logger.warn(`open > no action, aborting`);
                    return;
                }

                this.remotesLoaderText = this.i18n.remotesLoader[this.action];

                logger.log(`open > invoking ${this.action}()`);
                this[this.action](() => {
                    this.remotesLoaderText = this.i18n.remotesLoader.wait;
                    this.queueRemotesLookupExpiry();
                });
            },

            create(done = () => 1) {
                logger.debug('create');
                audioChat.createRoom(this.name, (...args) => {
                    logger.log('create done > name:', this.name);
                    logger.debug('create done > args:', ...args);
                    this.$emit('created', this.name);
                    // fixme - the join() call was an attempt to fix the state when a newly created room
                    // fixme - was not connected. try and figure out if the problem is somewhere else
                    // this.join(this.name);
                    done();
                });
            },

            join(done = () => 1) {
                logger.debug('join');
                audioChat.joinRoom(this.name, (...args) => {
                    logger.log('join done > name:', this.name);
                    logger.debug('join done > args:', ...args);
                    if (typeof this.local.nickName === 'string') {
                        this.publishNickName(this.local.nickName);
                    }
                    done();
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

            queueRemotesLookupExpiry() {
                logger.debug('open > setting remotes timer, timeout (ms):', Config.remotesLookupTimeout);
                setTimeout(() => {
                    logger.debug('open > remotes timer called');
                    this.remotesLoaderText = this.i18n.remotesLoader.lookupFailed;
                }, Config.remotesLookupTimeout);
            },

            publishNickName(nickName) {
                logger.debug('publishing nickName:', nickName);
                audioChat.updateNick(nickName);
            },

            setMuteState(state) {
                logger.debug('setting mute state:', state);
                audioChat.setLocalEnabled(!state);
            },

            // fixme - why is this fired twice?
            setRemoteMuteState({id, muted}) {
                logger.debug('updating remote mute state', id, muted);
                audioChat.setPeerMuted(id, muted);
            },

            addRemote(peerId) {
                logger.debug('remote peer added', peerId);

                if (peerId === this.local.id) {
                    logger.debug('added remote has the same id as local, aborting');
                    return;
                }

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
                logger.debug('remote peer updated', peerId, state);
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
                logger.debug('message from peer', peerId, message);
                switch (message.type) {
                    case 'nickname':
                        if (this.remotes[peerId].nickDisabled) {
                            this.$set(this.remotes[peerId], 'nickDisabled', false);
                        }
                        this.$set(this.remotes[peerId], 'nickName', message.payload.nick);
                        break;
                }
            },

            sniffDevices(done) {
                // todo - move this to App
                if (!devices.hasBrowserSupport()) {
                    // fixme - show 'sorry, get a modern browser'
                    logger.error('no bananas. get a better browser!');
                    return done(new Error('no support'));
                }
                devices.hasMics((err, hasMics) => {
                    logger.log('has mics:', hasMics);
                    // todo - implement this
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

            setupConnection(sessionId) {
                this.setLocalId(sessionId);
            },

            showLocal(stream) {
                logger.debug('local stream', stream);

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
    };
</script>

<style scoped>

    h1 {
        padding-right: 4rem;
        line-height: 3rem;
        text-align: left;
        word-break: break-word;
        word-wrap: break-word;
    }

    .remotes {
        /* confinement for the hosted loader */
        position: relative;
    }

    pre {
        font-size: 14px;
    }

    .leave {
        /* make room for the big icon */
        padding: 0;
    }

    @media screen and (max-width: 800px) {
        h1 {
            padding-right: 1.333rem;
        }
    }

    @media screen and (max-width: 600px) {
        h1 {
            padding-right: .666rem;
        }
    }

    @media screen and (max-width: 400px) {
        .room {
            flex-grow: 1;
        }

        h1 {
            padding-right: 0;
        }
    }

</style>
