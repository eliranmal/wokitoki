import '../../assets/images/logo-48.png';
import '../../assets/images/logo-96.png';
import '../../assets/images/logo-128.png';

import events from '../lib/events';


window.chrome.commands.onCommand.addListener(
    events.userCommandListener
);
