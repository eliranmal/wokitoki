import audioChat from '../lib/audio-chat';
import storage from '../lib/storage';


var queryGum = false;

function setRoom(name) {
    if (document.getElementById('createRoom')) {
        document.getElementById('createRoom').style.display = 'none';
    }
    if (document.querySelector('.button-leave-room')) {
        document.querySelector('.button-leave-room').style.display = 'block';
    }
    document.getElementById('subtitle').textContent = 'Room name: ' + name;

    storage.set({roomName: name}, () => console.log('saved room name to storage'));
}

function removeRoom() {
    if (document.getElementById('createRoom')) {
        document.getElementById('createRoom').style.display = 'block';
    }
    if (document.querySelector('.button-leave-room')) {
        document.querySelector('.button-leave-room').style.display = 'none';
    }
    document.getElementById('subtitle').textContent = '';

    audioChat.onLeaveRoom();
    storage.remove('roomName', () => console.log('removed room name from storage'));
}

function showLocalPeer() {
    var localAudio = document.getElementById('localAudio');
    localAudio.disabled = false;
    localAudio.volume = 0;

    document.querySelector('.local').style.display = 'block';

    var btn = document.querySelector('.local .button-mute');
    btn.style.visibility = 'visible';
    btn.onclick = function () {
        audioChat.toggleLocalEnabled();
        var trackEnabled = audioChat.isLocalEnabled();
        btn.className = 'button button-small button-mute' + (trackEnabled ? '' : ' muted');
    };
}

// todo - see if this is really necessary
// function webrtcOnVideoAdded(video, peerDomId) {
//     document.querySelector('#container_' + peerDomId + '>div.remote-details').appendChild(video);
// }

function addRemotePeerContainer(peerDomId, peerId) {
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

function updateRemotePeerContainer(peerDomId, state) {
    var container = document.querySelector('#container_' + peerDomId);
    container.className = 'peerContainer p2p' +
        state.substr(0, 1).toUpperCase() +
        state.substr(1);
    switch (state) {
        case 'connected':
        case 'completed':
            setPeerMuteVisible(peerDomId);
            break;
        case 'closed':
            detachPeerContainer(peerDomId);
            break;
    }
}

function setPeerMuteVisible(peerDomId) {
    var mute = document.querySelector('#mute_' + peerDomId);
    mute.style.visibility = 'visible';
}

function detachPeerContainer(peerDomId) {
    var container = document.querySelector('#container_' + peerDomId);
    container.remove();
}


function updatePeerDetails(message, peerDomId) {
    var container = document.getElementById('container_' + peerDomId);
    switch (message.type) {
        case 'nickname':
            container.querySelector('.nick').textContent = message.payload.nick;
            break;
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
            // fixme - this should be reversible
            // document.querySelector('form#createRoom>button').textContent = 'Creating room...';
            var roomName = document.querySelector('form#createRoom>input').value;
            // chrome.runtime.sendMessage({channel: audioChatChannel, cmd: 'createRoom', args: [roomName]});
            audioChat.createRoom(roomName, setRoom);
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
                var mics = devices.filter(function (device) {
                    return device.kind === 'audioinput';
                });
                var hasMics = mics.length;
                if (hasMics) {
                    document.getElementById('requirements').style.display = 'none';
                } else {
                    document.getElementById('microphoneWarning').style.display = 'block';
                    document.querySelector('form#createRoom>button').disabled = true;
                }
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
    storage.get('roomName', ({roomName}) => {
        console.log('got room name from storage');
        audioChat.setRoom(roomName);
        audioChat.init({
            onLocalStream: showLocalPeer,
            onPeerConnectionStateChanged: updateRemotePeerContainer,
            onPeerCreated: addRemotePeerContainer,
            onMessage: updatePeerDetails,
        });
        preLoad(roomName);
        sniffDevices();
    });
}


export default {
    init: init,
    setRoom: setRoom,
    // webrtcOnVideoAdded: webrtcOnVideoAdded,
};

