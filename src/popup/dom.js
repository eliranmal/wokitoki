import audioChat from '../lib/audio-chat';


var hasCameras = false;
var queryGum = false;

function setRoom(name) {
    if (document.getElementById('createRoom')) {
        document.getElementById('createRoom').style.display = 'none';
    }
    if (document.querySelector('.button-leave-room')) {
        document.querySelector('.button-leave-room').style.display = 'block';
    }
    document.getElementById('subtitle').textContent = 'Room name: ' + name;

    // chrome.runtime.sendMessage({channel: audioChatChannel, cmd: 'onSetRoom', args: [name]});
    audioChat.onSetRoom(name);
}

function removeRoom() {
    if (document.getElementById('createRoom')) {
        document.getElementById('createRoom').style.display = 'block';
    }
    if (document.querySelector('.button-leave-room')) {
        document.querySelector('.button-leave-room').style.display = 'none';
    }
    document.getElementById('subtitle').textContent = '';

    // chrome.runtime.sendMessage({channel: audioChatChannel, cmd: 'onLeaveRoom'});
    audioChat.onLeaveRoom();
}

function webrtcOnLocalStream() {
    var localAudio = document.getElementById('localAudio');
    localAudio.disabled = false;
    localAudio.volume = 0;
    if (hasCameras) {
        document.querySelector('.local-controls').style.visibility = 'visible';
    }

    var btn = document.querySelector('.local .button-mute');
    btn.style.visibility = 'visible';
    btn.onclick = function () {
        // chrome.runtime.sendMessage({channel: audioChatChannel, cmd: 'muteLocal'}, function (trackEnabled) {
        //     btn.className = 'button button-small button-mute' + (trackEnabled ? '' : ' muted');
        // });
        var trackEnabled = audioChat.muteLocal();
        btn.className = 'button button-small button-mute' + (trackEnabled ? '' : ' muted');
    };
}

// todo - see if this is really necessary
// function webrtcOnVideoAdded(video, peerDomId) {
//     document.querySelector('#container_' + peerDomId + '>div.remote-details').appendChild(video);
// }

function webrtcOnCreatedPeer(peerDomId, peerId) {
    var remotes = document.getElementById('remotes');
    if (!remotes) return;

    var container = document.createElement('div');
    container.className = 'peerContainer';
    container.id = 'container_' + peerDomId;

    // inner container
    var d = document.createElement('div');
    d.className = 'remote-details';
    container.appendChild(d);

    // nickname
    var nickname = document.createElement('div');
    nickname.className = 'nick';
    d.appendChild(nickname);

    // avatar image
    var avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.src = 'img/avatar-default.png';
    d.appendChild(avatar);

    // audio element
    // inserted later

    // mute button
    var mute = document.createElement('a');
    mute.className = 'button button-small button-mute';
    mute.appendChild(document.createTextNode('Mute'));
    mute.style.visibility = 'hidden';
    mute.id = 'mute_' + peerDomId;
    d.appendChild(mute);

    mute.onclick = function () {
        // chrome.runtime.sendMessage({
        //     channel: audioChatChannel,
        //     cmd: 'isPeerMuted',
        //     args: [peerId]
        // }, function (muted) {
        //     if (muted) { // unmute
        //         mute.className = 'button button-small button-mute';
        //     } else { // mute
        //         mute.className = 'button button-small button-mute muted';
        //     }
        // });
        var muted = audioChat.isPeerMuted(peerId);
        if (muted) { // unmute
            mute.className = 'button button-small button-mute';
        } else { // mute
            mute.className = 'button button-small button-mute muted';
        }
        // chrome.runtime.sendMessage({channel: audioChatChannel, cmd: 'togglePeerMuted', args: [peerId]});
        audioChat.togglePeerMuted(peerId);
    };

    // todo - this may affect event binding order.. take it out to its own command so its called after what happens in the audio-chat module?
    remotes.appendChild(container);
}

function setPeerContainerState(peerDomId, state) {
    var container = document.querySelector('#container_' + peerDomId);
    container.className = 'peerContainer p2p' +
        state.substr(0, 1).toUpperCase() +
        state.substr(1);
}

function setPeerMuteVisible(peerDomId) {
    var mute = document.querySelector('#mute_' + peerDomId);
    mute.style.visibility = 'visible';
}

function detachPeerContainer(peerDomId) {
    var container = document.querySelector('#container_' + peerDomId);
    container.remove();
}


function webrtcOnMessage(message, peerDomId) {
    var container = document.getElementById('container_' + peerDomId);
    if (message.type === 'nickname') {
        container.querySelector('.nick').textContent = message.payload.nick;
    } else if (message.type === 'avatar') {
        container.querySelector('.avatar').src = message.payload.avatar;
    }
}

function preLoad(room) {
    if (room) {
        setRoom(room);
        queryGum = true;
    } else {
        document.querySelector('form#createRoom>button').disabled = false;
        document.getElementById('createRoom').onsubmit = function () {
            // fixme - this should be the button element
            document.getElementById('createRoom').disabled = true;
            // document.querySelector('form#createRoom>button').textContent = 'Creating conference...';
            var roomName = document.querySelector('form#createRoom>input').value;
            // chrome.runtime.sendMessage({channel: audioChatChannel, cmd: 'onCreateRoom', args: [roomName]});
            audioChat.onCreateRoom(roomName);
            return false;
        };
    }
}

function sniffDevices() {
    if (!(navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.RTCPeerConnection)) {
        // FIXME: show "sorry, get a modern browser" (recommending Edge)
        document.getElementById('supportWarning').style.display = 'block';
        document.querySelector('form#createRoom>button').disabled = true;
    } else if (navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        navigator.mediaDevices.enumerateDevices()
            .then(function (devices) {
                var cameras = devices.filter(function (device) {
                    return device.kind === 'videoinput';
                });
                var mics = devices.filter(function (device) {
                    return device.kind === 'audioinput';
                });
                hasCameras = cameras.length;
                var hasMics = mics.length;
                if (hasMics) {
                    document.getElementById('requirements').style.display = 'none';
                } else {
                    document.getElementById('microphoneWarning').style.display = 'block';
                    document.querySelector('form#createRoom>button').disabled = true;
                }
                // chrome.runtime.sendMessage({
                //     channel: audioChatChannel, cmd: 'onSniffDevices', args: [
                //         {
                //             hasMics: hasMics,
                //             queryGum: queryGum,
                //         }
                //     ]
                // });
                audioChat.onSniffDevices({
                    hasMics: hasMics,
                    queryGum: queryGum,
                });
            });
    }
}


function initNicknameInput() {
    var nickInput = document.getElementById('nickInput');
    nickInput.onkeydown = function (e) {
        if (e.keyCode !== 13) return;
        var el = document.getElementById('nickInput');
        el.disabled = true;
        // chrome.runtime.sendMessage({channel: audioChatChannel, cmd: 'onNickInput', args: [el.value]});
        audioChat.onNickInput(el.value);
        return false;
    };
}

function initLeaveRoomButton() {
    var buttonLeaveRoom = document.querySelector('.button-leave-room');
    buttonLeaveRoom.style.display = 'none';
    buttonLeaveRoom.onclick = function (e) {
        removeRoom();
        return false;
    };
}

function init() {
    initNicknameInput();
    initLeaveRoomButton();
    // chrome.runtime.sendMessage({channel: _audioChatChannel, cmd: 'getRoom'}, preLoad);
    var room = audioChat.getRoom();
    preLoad(room);
    sniffDevices();
}


export default {
    init: init,
    preLoad: preLoad,
    setRoom: setRoom,
    webrtcOnMessage: webrtcOnMessage,
    webrtcOnLocalStream: webrtcOnLocalStream,
    // webrtcOnVideoAdded: webrtcOnVideoAdded,
    webrtcOnCreatedPeer: webrtcOnCreatedPeer,
    setPeerContainerState: setPeerContainerState,
    setPeerMuteVisible: setPeerMuteVisible,
    detachPeerContainer: detachPeerContainer,
    sniffDevices: sniffDevices,
};

