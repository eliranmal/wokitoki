
import SimpleWebRTC from 'simplewebrtc';


const noop = () => void 0;

let room;
let localTrack;
let nick;

let started;
let webrtc;

const track = (name, info) => {
    if (webrtc && webrtc.connection) {
        webrtc.connection.emit('metrics', name, info || {});
    }
};

const start = () => {
    webrtc.startLocalVideo();
    started = true;
};

const createRoom = (roomName, onCreated) => {
    // todo - put a unique prefix here (app name? tab id? hashed roomName? all together?)
    // room = 'wokitoki___' + sanitize(roomName);
    room = sanitize(roomName);
    doCreate(room, onCreated);
};

const leaveRoom = () => {
    doLeave();
    room = null;
};

const joinRoom = (roomName, done) => {
    room = sanitize(roomName);
    doJoin(room, done);
};

const doCreate = (room, done) => {
    if (!started) {
        start();
    }
    webrtc.createRoom(room, (err, name) => {
        if (!err) {
            // chrome.runtime.sendMessage({cmd: 'setRoom', args: [room]});
            done(room);
        } else {
            console.log('error', err, room);
            if (err === 'taken') {
                console.log('room taken!');
                room = `${room}_${Date.now()}`;
                doCreate(room, done);
            }
        }
    });
};

const doLeave = () => {
    webrtc.leaveRoom();
    webrtc.stopLocalVideo();
    started = false;
};

const doJoin = (room, done) => {
    if (!started) {
        start();
    }
    webrtc.joinRoom(room, (err, res) => {
        if (err) {
            done();
            return;
        }
        window.setTimeout(() => {
            done();
        }, 1000);
    });
};

const toggleLocalEnabled = () => {
    if (!localTrack) {
        return;
    }
    localTrack.enabled = !localTrack.enabled;
};

const isLocalEnabled = () => {
    if (!localTrack) {
        return;
    }
    return localTrack.enabled;
};

const setLocalEnabled = (state) => {
    if (!localTrack) {
        return;
    }
    localTrack.enabled = !!state;
};

const sanitize = (str) => {
    // todo - is sanitize necessary? it breaks the nick-name/avatar relation in remotes
    // return str.toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
    return str;
};

const setNick = (value) => {
    nick = sanitize(value);
};

const broadcastNick = () => {
    if (webrtc && nick) {
        console.log('broadcasting nickname to all peers');
        webrtc.sendToAll('nickname', {nick: nick});
    }
};

const unicastNick = (peer) => {
    if (peer && nick) {
        console.log('unicasting nickname to peer:', peer.id);
        peer.send('nickname', {nick: nick});
    }
};

const updateNick = (value) => {
    setNick(value);
    broadcastNick();
};

const setRoom = (roomName) => {
    room = roomName;
};

const isPeerMuted = (peerId) => {
    var peer = webrtc.getPeers(peerId).shift();
    return peer.videoEl.muted;
};

const togglePeerMuted = (peerId) => {
    var peer = webrtc.getPeers(peerId).shift();
    peer.videoEl.muted = !peer.videoEl.muted;
};

const GUM = ({
                 onReady = noop,
                 onLocalStream = noop,
                 onPeerConnectionStateChanged = noop,
                 onPeerCreated = noop,
                 onMessage = noop,
             }) => {

    webrtc = new SimpleWebRTC({
        // we don't do video
        localVideoEl: '',
        remoteVideosEl: '',
        autoRequestMedia: false,
        enableDataChannels: false,
        media: {
            audio: true,
            video: false
        },
        receiveMedia: { // FIXME: remove old chrome <= 37 constraints format
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 0
        },
    });

    webrtc.on('localStream', (stream) => {
        localTrack = stream.getAudioTracks()[0];
        // chrome.runtime.sendMessage({cmd: 'webrtcOnLocalStream'});
        onLocalStream();
    });

    webrtc.on('readyToCall', () => {
        onReady();
    });
    // called when a peer is created
    webrtc.on('createdPeer', (peer) => {
        if (peer && peer.pc) {
            peer.firsttime = true;
            peer.pc.on('iceConnectionStateChange', (event) => {
                var state = peer.pc.iceConnectionState;

                onPeerConnectionStateChanged(peer.id, state);

                switch (state) {
                    case 'connected':
                    case 'completed':
                        if (peer.firsttime) {
                            peer.firsttime = false;
                            track('iceSuccess', {
                                session: peer.sid,
                                peerprefix: peer.browserPrefix,
                                prefix: webrtc.capabilities.prefix,
                                version: webrtc.capabilities.browserVersion
                            });
                        }
                        break;
                    case 'closed':
                        break;
                }
            });
        }

        onPeerCreated(peer.id);
    });

    webrtc.connection.on('message', (message) => {
        var peers = webrtc.getPeers(message.from, message.roomType);
        if (!peers || !peers.length) return;
        var peer = peers[0];

        if (message.type === 'offer') {
            unicastNick(peer);
        }

        onMessage(peer.id, message);
    });

    // local p2p/ice failure
    webrtc.on('iceFailed', (peer) => {
        console.log('local fail', peer.sid);
        track('iceFailed', {
            source: 'local',
            session: peer.sid,
            peerprefix: peer.browserPrefix,
            prefix: webrtc.capabilities.prefix,
            version: webrtc.capabilities.browserVersion
        });
    });

    // remote p2p/ice failure
    webrtc.on('connectivityError', (peer) => {
        console.log('remote fail', peer.sid);
        track('iceFailed', {
            source: 'remote',
            session: peer.sid,
            peerprefix: peer.browserPrefix,
            prefix: webrtc.capabilities.prefix,
            version: webrtc.capabilities.browserVersion
        });
    });

};

const init = (options) => {
    GUM(options);
};


export default {
    init,
    start,
    createRoom,
    joinRoom,
    leaveRoom,
    setRoom,
    setNick,
    updateNick,
    isPeerMuted,
    togglePeerMuted,
    toggleLocalEnabled,
    setLocalEnabled,
    isLocalEnabled,
};

