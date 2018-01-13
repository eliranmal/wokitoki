import '../../assets/images/logo-48.png';
import '../../assets/images/logo-96.png';
import '../../assets/images/logo-128.png';

import events from '../events';

window.chrome.commands.onCommand.addListener(
    events.userCommandListener
);

// chrome.runtime.onMessage.addListener(
//     window.wokitokiEvents.apiCommandListener(window.wokitokiAudioChat)
// );

// chrome.runtime.onMessage.addListener(
//     window.wokitokiEvents.apiCommandListener({
//         initAudioChat: function (channel) {
//             return new window.WokitokiAudioChat(channel);
//         }
//     })
// );
