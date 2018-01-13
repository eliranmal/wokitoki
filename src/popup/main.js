import '../../assets/styles/popup.css';

import dom from './dom';
import AudioChat from '../audio-chat';

// chrome.runtime.onMessage.addListener(
//     window.wokitokiEvents.apiCommandListener({
//         initAudioChat: function (channel) {
//             new window.WokitokiAudioChat(channel);
//             // window.wokitokiDom.init(channel);
//         }
//     })
// );


var audioChatChannel = Date.now();

// chrome.runtime.onMessage.addListener(
//     window.wokitokiEvents.apiCommandListener(window.wokitokiDom, audioChatChannel)
// );

// chrome.runtime.sendMessage({cmd: 'initAudioChat', args: [audioChatChannel]}, function (audioChat) {
//     window.wokitokiDom.init(audioChatChannel);
// });
// chrome.runtime.sendMessage({cmd: 'initAudioChat', args: [audioChatChannel]});
var audioChat = new AudioChat(audioChatChannel);
dom.init(audioChatChannel, audioChat);
