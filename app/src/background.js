
chrome.commands.onCommand.addListener(function(command) {
    console.log('onCommand');
    console.log(arguments);
    switch (command) {
        case 'create-popup':
            createPopup();
            break;
    }
});

// window.onload = ''

var popup;

function createPopup() {
    if (popup) {
        console.log('popup is already created, skipping popup creation');
        return;
    }
    console.log('no popup, creating new');
    chrome.windows.create({
        url: '../popup.html',
        width: 600,
        height: 400,
        focused: true,
        type: chrome.windows.WindowType.POPUP,
    }, function (x) {
        popup = x;
    });
}
