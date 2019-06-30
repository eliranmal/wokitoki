<template>
    <div class="room flexbox">
        <header class="flexbox horizontal">
            <h1 class="fill">{{ name }}</h1>
            <div class="controls flexbox horizontal">
                <button type="button" class="icon leave"
                        v-b-tooltip.click.blur="i18n.leaveRoomHelp"
                        v-on:blur="leaveCalled = false"
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
    import intercept from '../../lib/intercept';
    import audioChat from '../../lib/audio-chat';
    import audioChatStoreAdapter from '../store/adapters/audio-chat';
    import Config from '../../../config';
    import Logger from '../../lib/logger';
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

            this.init();
        },
        computed: {
            remotesLoader() {
                return {
                    isLoading: this.isRemotesEmpty,
                    text: this.isRemotesEmpty ? this.remotesLoaderText : null,
                };
            },
            isRemotesEmpty() {
                return !Object.keys(this.remotes).length;
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
                    this.updateLocalMuteState(newValue);
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
                
                // todo - make a store adapter for event-based apis, use it on audio-chat, 
                // todo - and rely on reactivity and state changes instead of binding listeners
                // todo - (bind them inside the adapter instead)
                // todo - move all the audio-chat code there.
                // todo - possible problem: when to fire the init() ?
                
                
                // take 1: (not working... good night)

                intercept.methods(audioChat, audioChatStoreAdapter);




                audioChat.init({
                    onReady: this.open,
                    onConnectionReady: this.setupConnection,
                    onLocalStream: this.setupLocal,
                    onPeerCreated: this.addRemote,
                    onPeerMessage: this.updateRemoteDetails,
                    onPeerConnectionStateChanged: this.updateRemoteState,
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
                this[this.action](this.onOpened);
            },

            onOpened() {
                if (!this.isRemotesEmpty) {
                    return;
                }
                this.remotesLoaderText = this.i18n.remotesLoader.wait;
                this.queueRemotesLookupExpiry();
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
                if (!this.leaveCalled) {
                    this.leaveCalled = true;
                    return;
                }
                this.leaveCalled = false;

                audioChat.leaveRoom();
                this.$emit('leave');
            },

            queueRemotesLookupExpiry() {
                logger.debug('open > setting remotes timer, timeout (ms):', Config.remotesLookupTimeout);
                setTimeout(() => {
                    logger.debug('open > remotes timer callback');
                    this.remotesLoaderText = this.i18n.remotesLoader.lookupFailed;
                }, Config.remotesLookupTimeout);
            },

            publishNickName(nickName) {
                logger.debug('publishing nickName:', nickName);
                audioChat.updateNick(nickName);
            },

            updateLocalMuteState(state) {
                logger.debug('updating local mute state:', state);
                audioChat.setLocalEnabled(!state);
            },

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
                    
                    // todo - move this back into audio-chat, it's his job
                    isMuted: audioChat.isPeerMuted(peerId),
                    nickDisabled: true,
                    muteDisabled: true,
                };

                this.$set(this.remotes, remote.id, remote);
            },

            updateRemoteState(peerId, state) {
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

            updateRemoteDetails(peerId, message) {
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

            setupConnection(sessionId) {
                logger.debug('setupConnection > session id:', sessionId);
                // the local peer id is the same as the session id
                this.$set(this.local, 'id', sessionId);
            },

            setupLocal(stream) {
                logger.debug('setupLocal > stream:', stream);
                this.$set(this.local, 'audioDisabled', false);
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
