var api = {
    onSniffDevices: onSniffDevices,
    onNickInput: onNickInput,
    onLeaveRoom: onLeaveRoom,
    onSetRoom: onSetRoom,
    onCreateRoom: onCreateRoom,
    getRoom: getRoom,
    // setPeerMuteState: setPeerMuteState,
};


chrome.commands.onCommand.addListener(function (command) {
    console.log('Command:', command);
    switch (command) {
        case 'toggle-feature-foo':
            chrome.runtime.sendMessage({foo: 'bar'}, function (res) {
                if (!res && chrome.runtime.lastError) {
                    alert('message send failed. error:\n' + chrome.runtime.lastError.message);
                    return;
                }
                alert('message send succeed. response:\n' + res);
            });
            break;
    }
});


chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
    if (req.cmd) {
        try {
            var response = api[req.cmd].apply(api, req.args);
            console.log('success:' + req.cmd);
            if (typeof response !== 'undefined') {
                sendResponse(response);
            }
        } catch (ex) {
            console.error('error:' + req.cmd);
            console.error(ex);
        }
    }
});


var room;
var nick;
var avatar;
var webrtc;
// var hasCameras = false;
// var queryGum = false;

// for simplistic metrics gathering
function track(name, info) {
    if (webrtc && webrtc.connection) {
        webrtc.connection.emit('metrics', name, info || {});
    }
}

// function setRoom(name) {
//     if (document.querySelector('form#createRoom')) {
//         document.querySelector('form#createRoom').remove();
//         // todo - make it reversible, something like:
//         // document.querySelector('form#createRoom').disabled = true;
//     }
//     // document.getElementById('subtitle').textContent =  'Link to join: ' + getJoinLink(name);
//     document.getElementById('subtitle').textContent = 'Room name: ' + name;
//     localStorage.setItem('roomName', name);
// }

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
        // var newUrl = (framed ? document.referrer : window.parent.location.pathname) + '?' + room;
        if (!err) {
            // if (!framed) window.parent.history.replaceState({foo: 'bar'}, null, newUrl);
            // setRoom(room);
            chrome.runtime.sendMessage({cmd: 'setRoom', args: [room]});
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


    // todo - it appears that SimpleWebRTC must live in the browser

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

    // webrtc.on('localStream', function (stream) {
    //     var localAudio = document.getElementById('localAudio');
    //     localAudio.disabled = false;
    //     localAudio.volume = 0;
    //     //localAudio.srcObject = stream;
    //     if (hasCameras) {
    //         document.querySelector('.local-controls').style.visibility = 'visible';
    //     }
    //
    //     var track = stream.getAudioTracks()[0];
    //     var btn = document.querySelector('.local .button-mute');
    //     btn.style.visibility = 'visible';
    //     btn.onclick = function () {
    //         track.enabled = !track.enabled;
    //         btn.className = 'button button-small button-mute' + (track.enabled ? '' : ' muted');
    //     };
    // });
    webrtc.on('localStream', function (stream) {
        chrome.runtime.sendMessage({cmd: 'webrtcOnLocalStream', args: [stream]});
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

    // working around weird simplewebrtc behaviour
    webrtc.on('videoAdded', function (video, peer) {
        // document.querySelector('#container_' + webrtc.getDomId(peer) + '>div.remote-details').appendChild(video);
        chrome.runtime.sendMessage({cmd: 'webrtcOnVideoAdded', args: [video, webrtc.getDomId(peer)]});
    });
    // called when a peer is created
    webrtc.on('createdPeer', function (peer) {
        // var remotes = document.getElementById('remotes');
        // if (!remotes) return;
        //
        // var container = document.createElement('div');
        // container.className = 'peerContainer';
        // container.id = 'container_' + webrtc.getDomId(peer);
        //
        // // inner container
        // var d = document.createElement('div');
        // d.className = 'remote-details';
        // container.appendChild(d);
        //
        // // nickname
        // var nickname = document.createElement('div');
        // nickname.className = 'nick';
        // d.appendChild(nickname);
        //
        // // avatar image
        // var avatar = document.createElement('img');
        // avatar.className = 'avatar';
        // avatar.src = 'img/avatar-default.png';
        // d.appendChild(avatar);
        //
        // // audio element
        // // inserted later
        //
        // // mute button
        // var mute = document.createElement('a');
        // mute.className = 'button button-small button-mute';
        // mute.appendChild(document.createTextNode('Mute'));
        // mute.style.visibility = 'hidden';
        // d.appendChild(mute);
        //
        // mute.onclick = function () {
        //     if (peer.videoEl.muted) { // unmute
        //         mute.className = 'button button-small button-mute';
        //     } else { // mute
        //         mute.className = 'button button-small button-mute muted';
        //     }
        //     peer.videoEl.muted = !peer.videoEl.muted;
        // };
        //
        if (peer && peer.pc) {
            peer.firsttime = true;
            peer.pc.on('iceConnectionStateChange', function (event) {
                var state = peer.pc.iceConnectionState;
                // container.className = 'peerContainer p2p' +
                //     state.substr(0, 1).toUpperCase() +
                //     state.substr(1);
                chrome.runtime.sendMessage({cmd: 'setPeerContainerState', args: [webrtc.getDomId(peer), state]});

                switch (state) {
                    case 'connected':
                    case 'completed':
                        //audio.srcObject = peer.stream;
                        // mute.style.visibility = 'visible';
                        chrome.runtime.sendMessage({cmd: 'setPeerMuteVisible', args: [webrtc.getDomId(peer)]});

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
                        // container.remove();
                        chrome.runtime.sendMessage({cmd: 'detachPeerContainer', args: [webrtc.getDomId(peer)]});

                        break;
                }
            });
        }
        // remotes.appendChild(container);
        chrome.runtime.sendMessage({cmd: 'webrtcOnCreatedPeer', args: [peer, webrtc.getDomId(peer)]});
    });

    webrtc.connection.on('message', function (message) {
        var peers = self.webrtc.getPeers(message.from, message.roomType);
        if (!peers && peers.length > 0) return;
        var peer = peers[0];

        // FIXME: also send current avatar and nick to newly joining participants
        // var container = document.getElementById('container_' + webrtc.getDomId(peer));
        // if (message.type === 'nickname') {
        //     container.querySelector('.nick').textContent = message.payload.nick;
        // } else if (message.type === 'avatar') {
        //     container.querySelector('.avatar').src = message.payload.avatar;
        // } else if (message.type === 'offer') {
        if (message.type === 'offer') {
            // update things
            if (nick) {
                peer.send('nickname', {nick: nick});
            }
            if (avatar) {
                peer.send('avatar', {avatar: avatar});
            }
        }

        chrome.runtime.sendMessage({cmd: 'webrtcOnMessage', args: [message, webrtc.getDomId(peer)]});

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

    // if (!(navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.RTCPeerConnection)) {
    //     // FIXME: show "sorry, get a modern browser" (recommending Edge)
    //     document.getElementById('supportWarning').style.display = 'block';
    //     document.querySelector('form#createRoom>button').disabled = true;
    // } else if (navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    //     navigator.mediaDevices.enumerateDevices()
    //         .then(function (devices) {
    //             var cameras = devices.filter(function (device) {
    //                 return device.kind === 'videoinput';
    //             });
    //             hasCameras = cameras.length;
    //             var mics = devices.filter(function (device) {
    //                 return device.kind === 'audioinput';
    //             });
    //             if (mics.length) {
    //                 document.getElementById('requirements').style.display = 'none';
    //                 if (queryGum) webrtc.startLocalVideo();
    //             } else {
    //                 document.getElementById('microphoneWarning').style.display = 'block';
    //                 document.querySelector('form#createRoom>button').disabled = true;
    //             }
    //         });
    // }
    // chrome.runtime.sendMessage({cmd: 'sniffDevices', args: [queryGum]});
}

function onSniffDevices(data) {
    if (data.hasMics && data.queryGum) webrtc.startLocalVideo();
}


room = localStorage.getItem('roomName');


// update nickname
// document.getElementById('nickInput').onkeydown = function (e) {
//     if (e.keyCode !== 13) return;
//     var el = document.getElementById('nickInput');
//     el.disabled = true;
//     nick = el.value;
//     nick = sanitize(nick);
//     webrtc.sendToAll('nickname', {nick: nick});
//     return false;
// };
function onNickInput(value) {
    nick = value;
    nick = sanitize(nick);
    webrtc.sendToAll('nickname', {nick: nick});
}

// var buttonLeaveRoom = document.querySelector('.button-leave-room');
// // buttonLeaveRoom.style.visibility = 'hidden';
// buttonLeaveRoom.onclick = function (e) {
//     doLeave();
//     removeRoom();
//     room = null;
//     return false;
// };

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


GUM();


