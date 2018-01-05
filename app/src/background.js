
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

// window.onload = ''

