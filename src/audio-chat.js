import dom from './popup/dom';
import SimpleWebRTC from 'simplewebrtc';


function AudioChat(channel) {

    var api;
    var room;
    var nick;
    var avatar;
    var webrtc;

    function track(name, info) {
        if (webrtc && webrtc.connection) {
            webrtc.connection.emit('metrics', name, info || {});
        }
    }

    function onSetRoom(roomName) {
        localStorage.setItem('roomName', roomName);
    }

    function generateRoomName() {
        var adjectives = ['autumn', 'hidden', 'bitter', 'misty', 'silent', 'empty', 'dry', 'dark', 'summer', 'icy', 'delicate', 'quiet', 'white', 'cool', 'spring', 'winter', 'patient', 'twilight', 'dawn', 'crimson', 'wispy', 'weathered', 'blue', 'billowing', 'broken', 'cold', 'falling', 'frosty', 'green', 'long', 'late', 'lingering', 'bold', 'little', 'morning', 'muddy', 'old', 'red', 'rough', 'still', 'small', 'sparkling', 'shy', 'wandering', 'withered', 'wild', 'black', 'young', 'holy', 'solitary', 'fragrant', 'aged', 'snowy', 'proud', 'floral', 'restless', 'divine', 'polished', 'ancient', 'purple', 'lively', 'nameless'];

        var nouns = ['waterfall', 'river', 'breeze', 'moon', 'rain', 'wind', 'sea', 'morning', 'snow', 'lake', 'sunset', 'pine', 'shadow', 'leaf', 'dawn', 'glitter', 'forest', 'hill', 'cloud', 'meadow', 'sun', 'glade', 'bird', 'brook', 'butterfly', 'bush', 'dew', 'dust', 'field', 'fire', 'flower', 'firefly', 'feather', 'grass', 'haze', 'mountain', 'night', 'pond', 'darkness', 'snowflake', 'silence', 'sound', 'sky', 'shape', 'surf', 'thunder', 'violet', 'water', 'wildflower', 'wave', 'water', 'resonance', 'sun', 'wood', 'dream', 'cherry', 'tree', 'fog', 'frost', 'voice', 'paper', 'frog', 'smoke', 'star'];

        var verbs = ['shakes', 'drifts', 'has stopped', 'struggles', 'hears', 'has passed', 'sleeps', 'creeps', 'flutters', 'fades', 'is falling', 'trickles', 'murmurs', 'warms', 'hides', 'jumps', 'is dreaming', 'sleeps', 'falls', 'wanders', 'waits', 'has risen', 'stands', 'dying', 'is drawing', 'singing', 'rises', 'paints', 'capturing', 'flying', 'lies', 'picked up', 'gathers in', 'invites', 'separates', 'eats', 'plants', 'digs into', 'has fallen', 'weeping', 'facing', 'mourns', 'tastes', 'breaking', 'shaking', 'walks', 'builds', 'reveals', 'piercing', 'craves', 'departing', 'opens', 'falling', 'confronts', 'keeps', 'breaking', 'is floating', 'settles', 'reaches', 'illuminates', 'closes', 'leaves', 'explodes', 'drawing'];

        var preps = ['on', 'beside', 'in', 'beneath', 'above', 'under', 'by', 'over', 'against', 'near'];

        var random = function (arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        };

        var prep = random(preps);
        var adjective = random(adjectives);
        var noun = random(nouns);
        return [
            prep,
            'a',
            adjective,
            noun
        ].join('-')
            .replace(/\s/g, '-')
            .replace(/-a-(a|e|i|o|u)/, '-an-$1');
    }

    function doJoin(room) {
        webrtc.startLocalVideo();
        webrtc.createRoom(room, function (err, name) {
            if (!err) {
                // chrome.runtime.sendMessage({cmd: 'setRoom', args: [room]});
                dom.setRoom(room);
            } else {
                console.log('error', err, room);
                if (err === 'taken') {
                    room = generateRoomName();
                    doJoin(room);
                }
            }
        });
    }

    function doLeave() {
        webrtc.leaveRoom();
        webrtc.stopLocalVideo()
    }

    function removeRoom() {
        localStorage.removeItem('roomName');
    }

    function sanitize(str) {
        return str.toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
    }

    function GUM() {

        room = localStorage.getItem('roomName');

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

        webrtc.on('localStream', function (stream) {
            var track = stream.getAudioTracks()[0];
            api.muteLocal = function () {
                track.enabled = !track.enabled;
                return track.enabled;
            };
            // chrome.runtime.sendMessage({cmd: 'webrtcOnLocalStream'});
            dom.webrtcOnLocalStream();
        });

        webrtc.on('readyToCall', function () {
            if (room) {
                webrtc.joinRoom(room, function (err, res) {
                    if (err) return;
                    window.setTimeout(function () {
                        if (avatar) {
                            webrtc.sendToAll('avatar', {avatar: avatar});
                        }
                        if (nick) {
                            webrtc.sendToAll('nickname', {nick: nick});
                        }
                    }, 1000);
                });
            }
        });
        // todo - see if this is really necessary
        // // working around weird simplewebrtc behaviour
        // webrtc.on('videoAdded', function (video, peer) {
        //     // document.querySelector('#container_' + webrtc.getDomId(peer) + '>div.remote-details').appendChild(video);
        //     chrome.runtime.sendMessage({cmd: 'webrtcOnVideoAdded', args: [video, webrtc.getDomId(peer)]});
        // });
        // called when a peer is created
        webrtc.on('createdPeer', function (peer) {
            if (peer && peer.pc) {
                peer.firsttime = true;
                peer.pc.on('iceConnectionStateChange', function (event) {
                    var state = peer.pc.iceConnectionState;
                    // chrome.runtime.sendMessage({
                    //     cmd: 'setPeerContainerState',
                    //     args: [webrtc.getDomId(peer), state]
                    // });
                    dom.setPeerContainerState(webrtc.getDomId(peer), state);

                    switch (state) {
                        case 'connected':
                        case 'completed':
                            // chrome.runtime.sendMessage({cmd: 'setPeerMuteVisible', args: [webrtc.getDomId(peer)]});
                            dom.setPeerMuteVisible(webrtc.getDomId(peer));

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
                            // chrome.runtime.sendMessage({cmd: 'detachPeerContainer', args: [webrtc.getDomId(peer)]});
                            dom.detachPeerContainer(webrtc.getDomId(peer));

                            break;
                    }
                });
            }

            // chrome.runtime.sendMessage({cmd: 'webrtcOnCreatedPeer', args: [webrtc.getDomId(peer), peer.id]});
            dom.webrtcOnCreatedPeer(webrtc.getDomId(peer), peer.id);
        });

        webrtc.connection.on('message', function (message) {
            var peers = webrtc.getPeers(message.from, message.roomType);
            if (!peers && peers.length > 0) return;
            var peer = peers[0];

            // FIXME: also send current avatar and nick to newly joining participants
            if (message.type === 'offer') {
                // update things
                if (nick) {
                    peer.send('nickname', {nick: nick});
                }
                if (avatar) {
                    peer.send('avatar', {avatar: avatar});
                }
            }

            // chrome.runtime.sendMessage({cmd: 'webrtcOnMessage', args: [message, webrtc.getDomId(peer)]});
            dom.webrtcOnMessage(message, webrtc.getDomId(peer));

        });

        // local p2p/ice failure
        webrtc.on('iceFailed', function (peer) {
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
        webrtc.on('connectivityError', function (peer) {
            console.log('remote fail', peer.sid);
            track('iceFailed', {
                source: 'remote',
                session: peer.sid,
                peerprefix: peer.browserPrefix,
                prefix: webrtc.capabilities.prefix,
                version: webrtc.capabilities.browserVersion
            });
        });

    }

    function onSniffDevices(data) {
        if (data.hasMics && data.queryGum) webrtc.startLocalVideo();
    }

    function onNickInput(value) {
        nick = value;
        nick = sanitize(nick);
        webrtc.sendToAll('nickname', {nick: nick});
    }

    function onLeaveRoom() {
        doLeave();
        removeRoom();
        room = null;
    }

    function onCreateRoom(roomName) {
        room = sanitize(roomName || generateRoomName());
        doJoin(room);
    }

    function getRoom() {
        return room;
    }

    function isPeerMuted(peerId) {
        var peer = webrtc.getPeers(peerId).shift();
        return peer.videoEl.muted;
    }

    function togglePeerMuted(peerId) {
        var peer = webrtc.getPeers(peerId).shift();
        peer.videoEl.muted = !peer.videoEl.muted;
    }

    // window.onload = (function (fn) {
    //     return function () {
    //         GUM();
    //         fn && fn.apply(Object.create(null), arguments);
    //     };
    // })(window.onload);

    GUM();

    api = {
        onSniffDevices: onSniffDevices,
        onNickInput: onNickInput,
        onLeaveRoom: onLeaveRoom,
        onSetRoom: onSetRoom,
        onCreateRoom: onCreateRoom,
        getRoom: getRoom,
        isPeerMuted: isPeerMuted,
        togglePeerMuted: togglePeerMuted,
        getChannel: function () {
            return channel;
        },
    };

    // chrome.runtime.onMessage.addListener(
    //     window.wokitokiEvents.apiCommandListener(api, channel)
    // );

    return api;
}

export default AudioChat;
