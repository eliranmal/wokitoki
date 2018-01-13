var api;

function apiCommandListener(api, channel) {
    return function commandListener(req, sender, sendResponse) {
        if (channel && req.channel && channel !== req.channel) {
            return false;
        }
        if (req.cmd && api[req.cmd]) {
            try {
                var res = api[req.cmd].apply(api, req.args);
                if (typeof res !== 'undefined') {
                    console.log('api:request', req);
                    console.log('api:response', res);
                    sendResponse(res);
                } else {
                    console.log('api:command', req);
                }
            } catch (ex) {
                console.error('api:error', req);
                console.error(ex);
            }
        }
    }
}

function userCommandListener(command) {
    console.log('user:command', command);
    switch (command) {
        case 'create-popup':
            createPopup();
            break;
    }
}

function createPopup() {
    // chrome.windows.create({
    //     url: '../popup.html?c=' + Date.now(),
    //     width: 700,
    //     height: 400,
    //     focused: true,
    //     type: chrome.windows.WindowType.POPUP,
    // });
    chrome.tabs.create({
        url: '../popup.html?c=' + Date.now(),
    });
}

api = {
    apiCommandListener: apiCommandListener,
    userCommandListener: userCommandListener,
};

// window.wokitokiEvents = api;
export default api;

