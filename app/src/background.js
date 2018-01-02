
chrome.commands.onCommand.addListener(function(command) {
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


chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
    if (req.cmd && req.cmd in webrtc) {
        try {
            webrtc[req.cmd].apply(webrtc, req.args);
            sendResponse('success:' + req);
        } catch (ex) {
            sendResponse('error:' + req);
        }
    }
});


// window.onload = ''

